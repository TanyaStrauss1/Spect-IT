-- ============================================================================
-- Spect-IT — Appointments RLS v2 (run AFTER CREATE_APPOINTMENTS_TABLE.sql)
-- Tightens policies for production. Patients need magic-link auth for cloud sync.
-- ============================================================================

-- Practice staff registry (optional — for future per-practice PINs)
create table if not exists public.practice_staff (
  id              bigint generated always as identity primary key,
  practice_place_id text not null,
  email           text not null,
  role            text not null default 'staff' check (role in ('staff','admin')),
  created_at      timestamptz not null default now(),
  unique (practice_place_id, email)
);

alter table public.practice_staff enable row level security;

-- Drop permissive MVP policies
drop policy if exists appointments_insert_anon on public.appointments;
drop policy if exists appointments_select_anon on public.appointments;
drop policy if exists appointments_update_anon on public.appointments;

-- Anyone can request a booking (anon insert)
create policy appointments_insert_public
  on public.appointments for insert
  to anon, authenticated
  with check (
    status = 'requested'
    and appt_id is not null
    and patient_name is not null
  );

-- Patients see only their own appointments when signed in via Supabase Auth
create policy appointments_select_own
  on public.appointments for select
  to authenticated
  using (user_email = (auth.jwt() ->> 'email'));

-- Patients can cancel their own requests
create policy appointments_update_own_cancel
  on public.appointments for update
  to authenticated
  using (user_email = (auth.jwt() ->> 'email'))
  with check (status in ('cancelled'));

-- Service role / edge functions handle provider status updates (bypass RLS).
-- Provider console should call edge functions with service role, not anon update.

-- Anon can still read for provider MVP console until Auth is wired — REMOVE in prod:
create policy appointments_select_mvp_console
  on public.appointments for select
  to anon
  using (true);

create policy appointments_update_mvp_console
  on public.appointments for update
  to anon
  using (true)
  with check (status in ('confirmed','declined','cancelled','completed'));

-- To fully lock down: drop the two _mvp_console policies above after provider-auth is live.
