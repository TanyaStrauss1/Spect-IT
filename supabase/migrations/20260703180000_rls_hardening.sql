-- Spect-IT — RLS hardening (P0)
-- Tightens anon access; provider console uses provider-api edge function (service role).

-- ----------------------------------------------------------------------------
-- Core tables: anon INSERT only (reads fall back to localStorage until Auth)
-- ----------------------------------------------------------------------------

drop policy if exists users_all on public.users;
drop policy if exists users_insert_anon on public.users;
create policy users_insert_anon
  on public.users for insert
  to anon, authenticated
  with check (email is not null and length(trim(email)) > 3);

drop policy if exists test_results_all on public.test_results;
drop policy if exists test_results_insert_anon on public.test_results;
create policy test_results_insert_anon
  on public.test_results for insert
  to anon, authenticated
  with check (user_email is not null and test_type is not null);

drop policy if exists shopping_carts_all on public.shopping_carts;
drop policy if exists shopping_carts_upsert_anon on public.shopping_carts;
create policy shopping_carts_upsert_anon
  on public.shopping_carts for insert
  to anon, authenticated
  with check (user_email is not null);

drop policy if exists orders_all on public.orders;
drop policy if exists orders_insert_anon on public.orders;
create policy orders_insert_anon
  on public.orders for insert
  to anon, authenticated
  with check (user_email is not null);

-- ----------------------------------------------------------------------------
-- Appointments: public booking insert; provider reads/updates via edge function
-- ----------------------------------------------------------------------------

create table if not exists public.practice_staff (
  id                bigint generated always as identity primary key,
  practice_place_id text not null,
  email             text not null,
  role              text not null default 'staff' check (role in ('staff','admin')),
  created_at        timestamptz not null default now(),
  unique (practice_place_id, email)
);

alter table public.practice_staff enable row level security;

drop policy if exists appointments_insert_anon on public.appointments;
drop policy if exists appointments_select_anon on public.appointments;
drop policy if exists appointments_update_anon on public.appointments;
drop policy if exists appointments_insert_public on public.appointments;
drop policy if exists appointments_select_own on public.appointments;
drop policy if exists appointments_update_own_cancel on public.appointments;
drop policy if exists appointments_select_mvp_console on public.appointments;
drop policy if exists appointments_update_mvp_console on public.appointments;

create policy appointments_insert_public
  on public.appointments for insert
  to anon, authenticated
  with check (
    status = 'requested'
    and appt_id is not null
    and patient_name is not null
  );

create policy appointments_select_own
  on public.appointments for select
  to authenticated
  using (user_email = (auth.jwt() ->> 'email'));

create policy appointments_update_own_cancel
  on public.appointments for update
  to authenticated
  using (user_email = (auth.jwt() ->> 'email'))
  with check (status in ('cancelled'));
