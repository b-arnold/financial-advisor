-- Initial schema for the Northstar financial command center.
--
-- The tables mirror the domain model in `lib/types.ts`. Primary keys are `text`
-- (not uuid) on purpose: the app already mints string ids (e.g. "c1", "t1") in
-- `lib/store.tsx`/`lib/seed.ts`, so text keys keep the generated database types
-- assignable to the existing TypeScript shapes. Column names are snake_case per
-- Postgres convention; supabase-js returns them as-is.
--
-- Row Level Security is enabled on every table (the anon key shipped to the
-- browser is only safe because of this — see `.env.example`). The app does not
-- have login yet (auth gating is stubbed in `lib/supabase/proxy.ts`), so the
-- policies below grant the `authenticated` role full access to all rows: this is
-- a single-household personal-finance app, so per-user row scoping is deferred
-- until multi-tenant auth lands. Until then, nothing is exposed to `anon`.

-- ---------------------------------------------------------------------------
-- Profile / app settings (single row for the current household)
-- ---------------------------------------------------------------------------
create table profile (
  id          text primary key default 'me',
  user_name   text not null,
  email       text not null,
  theme       text not null default 'light' check (theme in ('light', 'dark', 'system')),
  -- Fund catalog goals selected during onboarding (ids from FUND_CATALOG in lib/seed.ts).
  selected_fund_catalog text[] not null default '{}',
  constraint profile_singleton check (id = 'me')
);

-- ---------------------------------------------------------------------------
-- Spending categories + transactions
-- ---------------------------------------------------------------------------
create table categories (
  id         text primary key,
  name       text not null,
  color      text not null,
  spent      numeric not null default 0,
  last_month numeric not null default 0
);

create table transactions (
  id          text primary key,
  merchant    text not null,
  -- Signed: positive = spend, negative = income.
  amount      numeric not null,
  date        date not null,
  -- null category => income.
  category_id text references categories (id) on delete set null
);

create index transactions_category_id_idx on transactions (category_id);
create index transactions_date_idx on transactions (date desc);

-- ---------------------------------------------------------------------------
-- Debts + payments
-- ---------------------------------------------------------------------------
create table debts (
  id       text primary key,
  name     text not null,
  apr      text not null,
  balance  numeric not null default 0,
  original numeric not null default 0,
  color    text not null,
  -- Payoff priority (the TS field is `order`, reserved in SQL).
  priority integer not null default 0
);

create table payments (
  id      text primary key,
  debt_id text not null references debts (id) on delete cascade,
  amount  numeric not null,
  date    date not null
);

create index payments_debt_id_idx on payments (debt_id);

-- ---------------------------------------------------------------------------
-- Savings funds + contributions
-- ---------------------------------------------------------------------------
create table funds (
  id     text primary key,
  name   text not null,
  emoji  text not null,
  kind   text not null check (kind in ('Target', 'Recurring', 'Open')),
  target numeric,
  saved  numeric not null default 0,
  -- yyyy-mm target month (nullable for open-ended funds).
  date   text,
  color  text not null
);

create table contributions (
  id      text primary key,
  fund_id text not null references funds (id) on delete cascade,
  amount  numeric not null,
  date    date not null
);

create index contributions_fund_id_idx on contributions (fund_id);

-- ---------------------------------------------------------------------------
-- Bills
-- ---------------------------------------------------------------------------
create table bills (
  id     text primary key,
  name   text not null,
  kind   text not null,
  amount numeric not null,
  -- Human label, e.g. "Jun 24".
  due    text not null,
  paid   boolean not null default false,
  soon   boolean not null default false
);

-- ---------------------------------------------------------------------------
-- Linked accounts
-- ---------------------------------------------------------------------------
create table accounts (
  id         text primary key,
  name       text not null,
  inst       text not null,
  mask       text not null,
  type       text not null check (type in ('Checking', 'Savings', 'Credit', 'Loan', 'Investment')),
  -- negative => owed.
  balance    numeric not null,
  color      text not null,
  synced     boolean not null default false,
  sync_label text not null default 'Manual'
);

-- ---------------------------------------------------------------------------
-- Household members
-- ---------------------------------------------------------------------------
create table members (
  id    text primary key,
  name  text not null,
  email text not null,
  role  text not null check (role in ('Owner', 'Editor', 'Viewer')),
  color text not null
);

-- ---------------------------------------------------------------------------
-- Activity feed
-- ---------------------------------------------------------------------------
create table activity (
  id       text primary key,
  who      text not null,
  action   text not null,
  detail   text not null,
  ago      text not null,
  initial  text not null,
  av_color text not null,
  tone     text not null check (tone in ('green', 'warm', 'accent'))
);

-- ---------------------------------------------------------------------------
-- Advisor chat + strategies
-- ---------------------------------------------------------------------------
create table messages (
  id   text primary key,
  role text not null check (role in ('ai', 'user')),
  text text not null,
  -- Preserves chat order (seed data has no timestamps).
  seq  bigint generated always as identity
);

create index messages_seq_idx on messages (seq);

create table strategies (
  -- 'debt' | 'spend' | 'funds'
  id          text primary key check (id in ('debt', 'spend', 'funds')),
  name        text not null,
  description text not null
);

create table strategy_notes (
  id          text primary key,
  strategy_id text not null references strategies (id) on delete cascade,
  by          text not null check (by in ('advisor', 'you')),
  at          text not null,
  text        text not null,
  seq         bigint generated always as identity
);

create index strategy_notes_strategy_id_idx on strategy_notes (strategy_id);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
-- Enable RLS everywhere, then grant the authenticated role full access. See the
-- header comment for why this is intentionally coarse for now.
do $$
declare
  t text;
begin
  foreach t in array array[
    'profile', 'categories', 'transactions', 'debts', 'payments', 'funds',
    'contributions', 'bills', 'accounts', 'members', 'activity', 'messages',
    'strategies', 'strategy_notes'
  ]
  loop
    execute format('alter table %I enable row level security;', t);
    execute format(
      'create policy %I on %I for all to authenticated using (true) with check (true);',
      t || '_authenticated_all', t
    );
  end loop;
end $$;
