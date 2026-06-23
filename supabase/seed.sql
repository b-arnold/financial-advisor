-- Local development seed data, mirroring lib/seed.ts so a freshly reset local
-- database opens in the same rich "has data" state as the in-memory app.
--
-- Loaded automatically by `supabase db reset` (see [db.seed] in config.toml).
-- `on conflict do nothing` keeps it safe to re-run by hand.

-- Profile / settings -------------------------------------------------------
insert into profile (id, user_name, email, theme, selected_fund_catalog) values
  ('me', 'Brett', 'brett.arnold40@gmail.com', 'light',
   array['pay-down-debt', 'emergency-fund', 'vacation'])
on conflict (id) do nothing;

-- Categories ---------------------------------------------------------------
insert into categories (id, name, color, spent, last_month) values
  ('c1', 'Groceries',         '#2f8f6b', 612, 548),
  ('c2', 'Dining out',        '#c2705a', 384, 441),
  ('c3', 'Transport',         '#3a6ea5', 196, 188),
  ('c4', 'Shopping',          '#6d5bd0', 312, 205),
  ('c5', 'Bills & utilities', '#b07d22', 268, 268),
  ('c6', 'Entertainment',     '#9b5fb0', 144, 121),
  ('c7', 'Health',            '#1f9e8a',  98, 132)
on conflict (id) do nothing;

-- Transactions (positive = spend, negative = income) -----------------------
insert into transactions (id, merchant, amount, date, category_id) values
  ('t1',  'Whole Foods Market', 86.42,  '2026-06-18', 'c1'),
  ('t2',  'Acme Corp',          -4200,  '2026-06-15', null),
  ('t3',  'Blue Bottle Coffee', 7.5,    '2026-06-18', 'c2'),
  ('t4',  'Shell',              52.1,   '2026-06-17', 'c3'),
  ('t5',  'Amazon',             64.99,  '2026-06-16', 'c4'),
  ('t6',  'Trader Joe''s',      41.18,  '2026-06-15', 'c1'),
  ('t7',  'Netflix',            15.49,  '2026-06-14', 'c5'),
  ('t8',  'Chipotle',           13.85,  '2026-06-14', 'c2'),
  ('t9',  'Uptown Cinema',      28.0,   '2026-06-13', 'c6'),
  ('t10', 'CVS Pharmacy',       22.4,   '2026-06-12', 'c7'),
  ('t11', 'Side gig',           -650,   '2026-06-10', null),
  ('t12', 'Lyft',               18.6,   '2026-06-11', 'c3')
on conflict (id) do nothing;

-- Debts (priority = payoff order) ------------------------------------------
insert into debts (id, name, apr, balance, original, color, priority) values
  ('d1', 'Visa Signature', '24.9%', 4820,  6200,  '#c2705a', 1),
  ('d2', 'Apple Card',     '19.2%', 2140,  2800,  '#6d5bd0', 2),
  ('d3', 'Auto loan',      '6.4%',  9650,  14000, '#3a6ea5', 3),
  ('d4', 'Student loan',   '4.1%',  6420,  11000, '#2f8f6b', 4)
on conflict (id) do nothing;

insert into payments (id, debt_id, amount, date) values
  ('p1', 'd1', 380, '2026-06-05'),
  ('p2', 'd2', 220, '2026-06-05'),
  ('p3', 'd3', 310, '2026-06-02'),
  ('p4', 'd1', 400, '2026-05-05'),
  ('p5', 'd4', 145, '2026-05-03')
on conflict (id) do nothing;

-- Funds + contributions ----------------------------------------------------
insert into funds (id, name, emoji, kind, target, saved, date, color) values
  ('g1', 'Family vacation', '🏖️', 'Target', 5000,  1850, '2026-12', '#c2705a'),
  ('g2', 'Emergency fund',  '🛟', 'Target', 12000, 7400, '2027-06', '#2f8f6b'),
  ('g3', 'New laptop',      '💻', 'Open',   null,   480, null,      '#6d5bd0')
on conflict (id) do nothing;

insert into contributions (id, fund_id, amount, date) values
  ('co1', 'g1', 263, '2026-06-01'),
  ('co2', 'g2', 400, '2026-06-01'),
  ('co3', 'g3', 80,  '2026-05-20'),
  ('co4', 'g1', 263, '2026-05-01')
on conflict (id) do nothing;

-- Bills --------------------------------------------------------------------
insert into bills (id, name, kind, amount, due, paid, soon) values
  ('b1', 'Rent',     'Housing',      1850,  'Jun 1',  true,  false),
  ('b2', 'Electric', 'Utility',      124,   'Jun 22', false, true),
  ('b3', 'Netflix',  'Subscription', 15.49, 'Jun 24', false, true),
  ('b4', 'Internet', 'Utility',      70,    'Jun 26', false, false),
  ('b5', 'Spotify',  'Subscription', 11.99, 'Jun 28', false, false),
  ('b6', 'Gym',      'Subscription', 39,    'Jun 30', false, false)
on conflict (id) do nothing;

-- Accounts (negative balance => owed) --------------------------------------
insert into accounts (id, name, inst, mask, type, balance, color, synced, sync_label) values
  ('a1', 'Everyday Checking',   'Chase',         '4821', 'Checking', 5240,  '#3a6ea5', true,  'Synced 2h ago'),
  ('a2', 'High-yield Savings',  'Ally',          '9930', 'Savings',  9730,  '#2f8f6b', true,  'Synced 2h ago'),
  ('a3', 'Visa Signature',      'Chase',         '1142', 'Credit',   -4820, '#c2705a', true,  'Synced 2h ago'),
  ('a4', 'Apple Card',          'Goldman Sachs', '0077', 'Credit',   -2140, '#6d5bd0', false, 'Manual'),
  ('a5', 'Auto loan',           'Capital One',   '5510', 'Loan',     -9650, '#b07d22', false, 'Manual')
on conflict (id) do nothing;

-- Household members --------------------------------------------------------
insert into members (id, name, email, role, color) values
  ('m1', 'Brett Arnold', 'brett.arnold40@gmail.com', 'Owner',  '#c2705a'),
  ('m2', 'Jordan Chen',  'jordan@email.com',         'Editor', '#6d5bd0')
on conflict (id) do nothing;

-- Activity feed ------------------------------------------------------------
insert into activity (id, who, action, detail, ago, initial, av_color, tone) values
  ('ac1', 'Jordan',  'logged a payment',      '$220 to Apple Card',   '2h',        'J', '#6d5bd0', 'green'),
  ('ac2', 'You',     'added a transaction',   'Whole Foods · $86.42', '5h',        'B', '#c2705a', 'warm'),
  ('ac3', 'Jordan',  'contributed to a fund', '$80 to New laptop',    'Yesterday', 'J', '#6d5bd0', 'green'),
  ('ac4', 'You',     'marked a bill paid',    'Rent · $1,850',        '2d',        'B', '#c2705a', 'accent'),
  ('ac5', 'Advisor', 'updated your plan',     'Avalanche payoff order','3d',       '✦', '#8b7bea', 'accent')
on conflict (id) do nothing;

-- Advisor chat -------------------------------------------------------------
insert into messages (id, role, text) values
  ('msg1', 'ai',   'Morning, Brett. Your free cash flow is up $310 this month — nice work. I''d point the extra at the Visa Signature; it''s your most expensive balance at 24.9%.'),
  ('msg2', 'user', 'How much sooner would that get me debt-free?'),
  ('msg3', 'ai',   'About four months sooner — September 2027 instead of January 2028 — and roughly $640 less interest. Want me to set that as your plan?')
on conflict (id) do nothing;

-- Advisor strategies + notes -----------------------------------------------
insert into strategies (id, name, description) values
  ('debt',  'Avalanche',
   'Pay minimums on everything, then throw every spare dollar at the highest-APR balance first. Mathematically the cheapest path — you''ll pay the least interest overall.'),
  ('spend', '50 / 30 / 20',
   'Aim for 50% needs, 30% wants, 20% toward savings and debt. You''re running a little hot on dining out — trimming there frees up your vacation contribution.'),
  ('funds', 'Fund-weighted auto-save',
   'Each payday I split your savings across funds by deadline pressure — the vacation gets the most right now because it''s closest.')
on conflict (id) do nothing;

insert into strategy_notes (id, strategy_id, by, at, text) values
  ('n1',  'debt',  'advisor', 'Jun 12', 'Switched you from snowball to avalanche — the Visa''s 24.9% APR is costing more than the motivation boost of clearing the Apple Card first.'),
  ('n2',  'debt',  'you',     'Jun 13', 'Makes sense. Let''s keep the auto-loan on minimums for now.'),
  ('sn1', 'spend', 'advisor', 'Jun 10', 'Dining out is up 18% over your 3-month average. A $120/mo trim covers most of the vacation auto-save.'),
  ('fn1', 'funds', 'advisor', 'Jun 1',  'Bumped the emergency fund to $400/mo now that the vacation is 37% funded.')
on conflict (id) do nothing;
