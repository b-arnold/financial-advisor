-- ============================================================================
-- Northstar — initial schema
-- ============================================================================
-- Multi-tenant financial command center. All financial data belongs to a
-- HOUSEHOLD (a shared workspace), not an individual user. Users join households
-- via household_members with a role (Owner / Editor / Viewer). Every data table
-- carries household_id and is gated by RLS keyed on membership.
--
-- Derived, NOT stored (computed in app/selectors over the tables below):
--   * category spend / last-month       -> sum(transactions) by category & period
--   * debt current balance              -> original - sum(debt_payment txns)
--   * fund saved                        -> sum(fund_contribution txns)
--   * bill "paid this period"           -> exists(transaction with bill_id in period)
--   * net worth / cash flow / trends    -> transactions (flows) + trend_snapshots (stocks)
--
-- transactions is a UNIFIED LEDGER: spend, income, debt payments, and fund
-- contributions are all rows, distinguished by `kind` with a CHECK constraint
-- enforcing which target FK may be set.
-- ============================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type member_role        as enum ('Owner', 'Editor', 'Viewer');
create type theme_mode         as enum ('light', 'dark', 'system');
create type invitation_status  as enum ('pending', 'accepted', 'revoked', 'expired');
create type account_type       as enum ('Checking', 'Savings', 'Credit', 'Loan', 'Investment');
create type alias_match_type   as enum ('exact', 'prefix', 'contains', 'regex');
create type txn_kind           as enum ('spend', 'income', 'debt_payment', 'fund_contribution');
create type fund_kind          as enum ('Target', 'Recurring', 'Open');
create type bill_cadence       as enum ('weekly', 'monthly', 'quarterly', 'annual');
create type bill_status        as enum ('suggested', 'active', 'dismissed', 'ended');
create type bill_source        as enum ('detected', 'manual');
create type chat_role          as enum ('ai', 'user');
create type strategy_kind      as enum ('debt', 'spend', 'funds');
create type strat_note_by      as enum ('advisor', 'you');
create type trend_metric       as enum ('net_worth', 'total_debt', 'total_saved', 'assets');
create type notification_type  as enum ('bill_due', 'sync_error', 'invitation', 'advisor', 'system');

-- ---------------------------------------------------------------------------
-- Identity & tenancy
-- ---------------------------------------------------------------------------

-- 1. profiles — 1:1 with auth.users; per-user app data & preferences
create table profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  email        text,
  theme        theme_mode not null default 'system',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- 2. households — the shared workspace
create table households (
  id                    uuid primary key default gen_random_uuid(),
  name                  text not null default 'My Household',
  selected_fund_catalog text[] not null default '{}',  -- onboarding picks (FUND_CATALOG ids)
  onboarded             boolean not null default false,
  created_by            uuid references auth.users (id) on delete set null,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- 3. household_members — who belongs to a household, and their role
create table household_members (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references households (id) on delete cascade,
  user_id      uuid not null references auth.users (id) on delete cascade,
  role         member_role not null default 'Viewer',
  name         text,            -- display name within the household
  email        text,
  color        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (household_id, user_id)
);

-- 4. invitations — pending invites by email (invitee may not have an account yet)
create table invitations (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references households (id) on delete cascade,
  email        text not null,
  role         member_role not null default 'Viewer',
  token        text not null unique default encode(gen_random_bytes(24), 'hex'),
  status       invitation_status not null default 'pending',
  invited_by   uuid references auth.users (id) on delete set null,
  expires_at   timestamptz not null default (now() + interval '14 days'),
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Financial data
-- ---------------------------------------------------------------------------

-- 5. categories — spending categories (spent / last-month are derived)
create table categories (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references households (id) on delete cascade,
  name         text not null,
  color        text,
  sort_order   int not null default 0,
  created_at   timestamptz not null default now()
);

-- 6. accounts — bank / credit / loan accounts (balance < 0 => owed)
create table accounts (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references households (id) on delete cascade,
  name         text not null,
  inst         text,            -- institution
  mask         text,            -- last 4
  type         account_type not null,
  balance      numeric not null default 0,
  color        text,
  synced       boolean not null default false,
  sync_label   text,            -- derived from a connection once Plaid lands
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- 7. merchants — canonical payee; groups transactions and auto-categorizes
create table merchants (
  id                  uuid primary key default gen_random_uuid(),
  household_id        uuid not null references households (id) on delete cascade,
  name                text not null,
  default_category_id uuid references categories (id) on delete set null,
  color               text,
  emoji               text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- 8. merchant_aliases — matching rules so future transactions auto-link
create table merchant_aliases (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references households (id) on delete cascade,
  merchant_id  uuid not null references merchants (id) on delete cascade,
  pattern      text not null,                                  -- e.g. 'SQ *BLUE BOTTLE'
  match_type   alias_match_type not null default 'contains',
  created_at   timestamptz not null default now(),
  unique (household_id, pattern, match_type)
);

-- 9. debts — liabilities. `original` = opening balance; current balance derived.
create table debts (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references households (id) on delete cascade,
  name         text not null,
  apr          numeric,         -- percent, e.g. 24.9
  original     numeric not null default 0,
  color        text,
  sort_order   int not null default 0,  -- payoff priority
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- 10. funds — savings goals. `saved` derived from fund_contribution txns.
create table funds (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references households (id) on delete cascade,
  name         text not null,
  emoji        text,
  kind         fund_kind not null default 'Open',
  target       numeric,         -- null for Open funds
  target_date  date,            -- null for Open/Recurring
  color        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- 11. bills — recurring obligations. May be auto-DETECTED from transactions
--     (merchant + cadence + amount + day-of-month) or entered manually.
--     "Paid this period" is derived from transactions carrying this bill_id.
create table bills (
  id              uuid primary key default gen_random_uuid(),
  household_id    uuid not null references households (id) on delete cascade,
  merchant_id     uuid references merchants (id) on delete set null,
  name            text not null,
  kind            text,          -- 'Subscription' | 'Utility' | 'Housing' | ...
  cadence         bill_cadence not null default 'monthly',
  expected_amount numeric,       -- running average; match within a tolerance band
  day_of_month    int check (day_of_month between 1 and 31),
  month           int check (month between 1 and 12),  -- for annual cadence
  next_due_date   date,
  status          bill_status not null default 'active',
  source          bill_source not null default 'manual',
  last_seen_at    date,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- 12. transactions — UNIFIED LEDGER
create table transactions (
  id                   uuid primary key default gen_random_uuid(),
  household_id         uuid not null references households (id) on delete cascade,
  kind                 txn_kind not null,
  amount               numeric not null,   -- magnitude; direction implied by kind
  date                 date not null,
  description          text,               -- raw bank descriptor
  merchant_id          uuid references merchants (id) on delete set null,
  account_id           uuid references accounts (id) on delete set null,
  category_id          uuid references categories (id) on delete set null,
  debt_id              uuid references debts (id) on delete cascade,
  fund_id              uuid references funds (id) on delete cascade,
  bill_id              uuid references bills (id) on delete set null,
  plaid_transaction_id text unique,        -- idempotent dedupe on re-sync
  pending              boolean not null default false,
  created_by           uuid references auth.users (id) on delete set null,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  -- enforce that the target FK matches the kind
  constraint txn_target_ck check (
    case kind
      when 'debt_payment'      then debt_id is not null and fund_id is null
      when 'fund_contribution' then fund_id is not null and debt_id is null
      else debt_id is null and fund_id is null
    end
  )
);

-- ---------------------------------------------------------------------------
-- Advisor
-- ---------------------------------------------------------------------------

-- 13. chat_messages — advisor conversation
create table chat_messages (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references households (id) on delete cascade,
  role         chat_role not null,
  text         text not null,
  created_at   timestamptz not null default now()
);

-- 14. strategies — one per kind (debt / spend / funds) per household
create table strategies (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references households (id) on delete cascade,
  kind         strategy_kind not null,
  name         text not null,
  description  text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (household_id, kind)
);

-- 15. strategy_notes — back-and-forth notes on a strategy
create table strategy_notes (
  id           uuid primary key default gen_random_uuid(),
  strategy_id  uuid not null references strategies (id) on delete cascade,
  household_id uuid not null references households (id) on delete cascade,  -- denormalized for RLS
  by           strat_note_by not null,
  text         text not null,
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Activity, trends, notifications
-- ---------------------------------------------------------------------------

-- 16. activity — append-only household feed (ago/initials/tone are presentation)
create table activity (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references households (id) on delete cascade,
  actor_id     uuid references auth.users (id) on delete set null,
  actor_name   text,
  action       text not null,
  detail       text,
  created_at   timestamptz not null default now()
);

-- 17. trend_snapshots — point-in-time STOCKS for the Trends screen.
--     Flows (income / spending) come from the ledger, not from here.
create table trend_snapshots (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references households (id) on delete cascade,
  captured_at  date not null,
  metric       trend_metric not null,
  value        numeric not null,
  created_at   timestamptz not null default now(),
  unique (household_id, captured_at, metric)
);

-- 18. notifications — per-household, optionally targeted at one user
create table notifications (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references households (id) on delete cascade,
  user_id      uuid references auth.users (id) on delete cascade,  -- null => whole household
  type         notification_type not null default 'system',
  title        text not null,
  body         text,
  read_at      timestamptz,
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Indexes (household_id on every table + hot FK / query columns)
-- ---------------------------------------------------------------------------
create index on household_members (household_id);
create index on household_members (user_id);
create index on invitations (household_id);
create index on invitations (email);
create index on categories (household_id);
create index on accounts (household_id);
create index on merchants (household_id);
create index on merchant_aliases (household_id);
create index on merchant_aliases (merchant_id);
create index on debts (household_id);
create index on funds (household_id);
create index on bills (household_id);
create index on bills (merchant_id);
create index on transactions (household_id);
create index on transactions (date);
create index on transactions (merchant_id);
create index on transactions (account_id);
create index on transactions (category_id);
create index on transactions (debt_id);
create index on transactions (fund_id);
create index on transactions (bill_id);
create index on chat_messages (household_id);
create index on strategies (household_id);
create index on strategy_notes (household_id);
create index on strategy_notes (strategy_id);
create index on activity (household_id);
create index on trend_snapshots (household_id);
create index on notifications (household_id);
create index on notifications (user_id);

-- ---------------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

do $$
declare t text;
begin
  foreach t in array array[
    'profiles', 'households', 'household_members', 'accounts', 'merchants',
    'debts', 'funds', 'bills', 'transactions', 'strategies'
  ] loop
    execute format(
      'create trigger %1$s_set_updated before update on public.%1$I '
      'for each row execute function public.set_updated_at()', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Membership helpers (SECURITY DEFINER to avoid RLS recursion on policies)
-- ---------------------------------------------------------------------------
create or replace function is_household_member(hid uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from household_members
    where household_id = hid and user_id = auth.uid()
  );
$$;

create or replace function can_write(hid uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from household_members
    where household_id = hid and user_id = auth.uid()
      and role in ('Owner', 'Editor')
  );
$$;

create or replace function is_owner(hid uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from household_members
    where household_id = hid and user_id = auth.uid() and role = 'Owner'
  );
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

-- Standard household-data tables: members read; Owner/Editor write; Viewer read-only.
do $$
declare t text;
begin
  foreach t in array array[
    'categories', 'accounts', 'merchants', 'merchant_aliases', 'debts',
    'funds', 'bills', 'transactions', 'chat_messages', 'strategies',
    'strategy_notes', 'activity', 'trend_snapshots'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy %1$s_sel on public.%1$I for select to authenticated using (public.is_household_member(household_id))', t);
    execute format('create policy %1$s_ins on public.%1$I for insert to authenticated with check (public.can_write(household_id))', t);
    execute format('create policy %1$s_upd on public.%1$I for update to authenticated using (public.can_write(household_id)) with check (public.can_write(household_id))', t);
    execute format('create policy %1$s_del on public.%1$I for delete to authenticated using (public.can_write(household_id))', t);
  end loop;
end $$;

-- profiles — self only
alter table profiles enable row level security;
create policy profiles_sel on profiles for select to authenticated using (id = auth.uid());
create policy profiles_ins on profiles for insert to authenticated with check (id = auth.uid());
create policy profiles_upd on profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- households — members read; creator inserts; Owner manages
alter table households enable row level security;
create policy households_sel on households for select to authenticated using (is_household_member(id));
create policy households_ins on households for insert to authenticated with check (created_by = auth.uid());
create policy households_upd on households for update to authenticated using (is_owner(id)) with check (is_owner(id));
create policy households_del on households for delete to authenticated using (is_owner(id));

-- household_members — members read; Owner manages. Self-add goes through
-- the SECURITY DEFINER RPCs below (which bypass RLS), so policy stays strict.
alter table household_members enable row level security;
create policy hm_sel on household_members for select to authenticated using (is_household_member(household_id));
create policy hm_ins on household_members for insert to authenticated with check (is_owner(household_id));
create policy hm_upd on household_members for update to authenticated using (is_owner(household_id)) with check (is_owner(household_id));
create policy hm_del on household_members for delete to authenticated using (is_owner(household_id));

-- invitations — Owner only (invitee accepts via accept_invitation RPC)
alter table invitations enable row level security;
create policy inv_sel on invitations for select to authenticated using (is_owner(household_id));
create policy inv_ins on invitations for insert to authenticated with check (is_owner(household_id));
create policy inv_upd on invitations for update to authenticated using (is_owner(household_id)) with check (is_owner(household_id));
create policy inv_del on invitations for delete to authenticated using (is_owner(household_id));

-- notifications — members read their own (or household-wide) and mark read
alter table notifications enable row level security;
create policy notif_sel on notifications for select to authenticated
  using (is_household_member(household_id) and (user_id is null or user_id = auth.uid()));
create policy notif_ins on notifications for insert to authenticated with check (can_write(household_id));
create policy notif_upd on notifications for update to authenticated
  using (is_household_member(household_id) and (user_id is null or user_id = auth.uid()))
  with check (is_household_member(household_id) and (user_id is null or user_id = auth.uid()));
create policy notif_del on notifications for delete to authenticated
  using (is_household_member(household_id) and (user_id is null or user_id = auth.uid()));

-- ---------------------------------------------------------------------------
-- Onboarding / membership RPCs (atomic, RLS-safe)
-- ---------------------------------------------------------------------------

-- Auto-create a profile row when a user signs up
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, split_part(coalesce(new.email, ''), '@', 1))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Create a household and make the caller its Owner, atomically
create or replace function create_household(p_name text default 'My Household')
returns uuid language plpgsql security definer set search_path = public as $$
declare
  hid    uuid;
  uemail text;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  select email into uemail from auth.users where id = auth.uid();
  insert into households (name, created_by) values (coalesce(p_name, 'My Household'), auth.uid())
    returning id into hid;
  insert into household_members (household_id, user_id, role, name, email)
    values (hid, auth.uid(), 'Owner', split_part(coalesce(uemail, ''), '@', 1), uemail);
  return hid;
end $$;

-- Accept an invitation by token (validates email + expiry, then joins)
create or replace function accept_invitation(p_token text)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  inv    invitations%rowtype;
  uemail text;
begin
  select email into uemail from auth.users where id = auth.uid();
  select * into inv from invitations
    where token = p_token and status = 'pending'
      and (expires_at is null or expires_at > now());
  if not found then
    raise exception 'invalid or expired invitation';
  end if;
  if lower(inv.email) <> lower(coalesce(uemail, '')) then
    raise exception 'invitation email does not match';
  end if;
  insert into household_members (household_id, user_id, role, email)
    values (inv.household_id, auth.uid(), inv.role, uemail)
    on conflict (household_id, user_id) do update set role = excluded.role;
  update invitations set status = 'accepted' where id = inv.id;
  return inv.household_id;
end $$;

-- ---------------------------------------------------------------------------
-- Convenience views for the agreed derivations (read-only; inherit table RLS)
-- ---------------------------------------------------------------------------

-- Current debt balance = original - sum of debt payments
create view debt_balances with (security_invoker = true) as
  select d.*,
         greatest(0, d.original - coalesce(p.paid, 0)) as balance
  from debts d
  left join (
    select debt_id, sum(amount) as paid
    from transactions where kind = 'debt_payment'
    group by debt_id
  ) p on p.debt_id = d.id;

-- Fund saved = sum of contributions
create view fund_totals with (security_invoker = true) as
  select f.*,
         coalesce(c.saved, 0) as saved
  from funds f
  left join (
    select fund_id, sum(amount) as saved
    from transactions where kind = 'fund_contribution'
    group by fund_id
  ) c on c.fund_id = f.id;

-- ---------------------------------------------------------------------------
-- Grants (RLS still governs row access; anon gets nothing)
-- ---------------------------------------------------------------------------
grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant execute on function create_household(text)  to authenticated;
grant execute on function accept_invitation(text) to authenticated;
