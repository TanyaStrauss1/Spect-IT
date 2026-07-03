-- Spect-IT website core tables (email-based, anon-friendly RLS)

create table if not exists public.users (
  id          bigint generated always as identity primary key,
  email       text unique not null,
  last_seen   timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.test_results (
  id                bigint generated always as identity primary key,
  user_email        text,
  test_type         text,
  test_name         text,
  test_data         jsonb,
  score             numeric,
  level             text,
  decimal_acuity    numeric,
  accuracy_rating   text,
  test_date         timestamptz,
  eye               text,
  lidar_calibrated  boolean default false,
  test_distance     numeric,
  stability_score   numeric,
  created_at        timestamptz not null default now()
);
create index if not exists test_results_user_email_idx on public.test_results (user_email);

create table if not exists public.shopping_carts (
  id          bigint generated always as identity primary key,
  user_email  text unique not null,
  cart_data   jsonb,
  updated_at  timestamptz not null default now()
);

create table if not exists public.orders (
  id            bigint generated always as identity primary key,
  user_email    text,
  order_id      text,
  order_data    jsonb,
  total_amount  numeric default 0,
  status        text default 'pending',
  created_at    timestamptz not null default now()
);
create index if not exists orders_user_email_idx on public.orders (user_email);

alter table public.users enable row level security;
alter table public.test_results enable row level security;
alter table public.shopping_carts enable row level security;
alter table public.orders enable row level security;

drop policy if exists users_all on public.users;
create policy users_all on public.users for all to anon, authenticated using (true) with check (true);

drop policy if exists test_results_all on public.test_results;
create policy test_results_all on public.test_results for all to anon, authenticated using (true) with check (true);

drop policy if exists shopping_carts_all on public.shopping_carts;
create policy shopping_carts_all on public.shopping_carts for all to anon, authenticated using (true) with check (true);

drop policy if exists orders_all on public.orders;
create policy orders_all on public.orders for all to anon, authenticated using (true) with check (true);
