-- ============================================================================
-- Spect-IT — Appointments table
-- Run this in Supabase → SQL Editor to enable real (cloud) bookings.
-- ============================================================================

create table if not exists public.appointments (
  id                bigint generated always as identity primary key,
  appt_id           text unique not null,               -- client-generated id
  user_email        text,
  -- practice / specialist
  practice_place_id text,
  practice_name     text,
  practice_phone    text,
  practice_address  text,
  -- booking
  service           text,
  service_label     text,
  appt_date         date,
  appt_time         text,
  duration_mins     int,
  status            text not null default 'requested'
                     check (status in ('requested','confirmed','declined','cancelled','completed')),
  -- patient
  patient_name      text,
  patient_phone     text,
  patient_notes     text,
  -- optional attached Spect-IT results + full snapshot
  results           jsonb,
  data              jsonb,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists appointments_user_email_idx  on public.appointments (user_email);
create index if not exists appointments_place_id_idx     on public.appointments (practice_place_id);
create index if not exists appointments_status_idx       on public.appointments (status);
create index if not exists appointments_date_idx         on public.appointments (appt_date);

-- Keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists appointments_set_updated_at on public.appointments;
create trigger appointments_set_updated_at
  before update on public.appointments
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- Row Level Security
-- NOTE: This MVP has no end-user auth (email-based, like the other tables),
-- so these policies are permissive for the anon key. For production, add
-- Supabase Auth and restrict SELECT/UPDATE to the owning user and the
-- practice's authenticated staff.
-- ----------------------------------------------------------------------------
alter table public.appointments enable row level security;

drop policy if exists appointments_insert_anon on public.appointments;
create policy appointments_insert_anon
  on public.appointments for insert
  to anon, authenticated
  with check (true);

drop policy if exists appointments_select_anon on public.appointments;
create policy appointments_select_anon
  on public.appointments for select
  to anon, authenticated
  using (true);

drop policy if exists appointments_update_anon on public.appointments;
create policy appointments_update_anon
  on public.appointments for update
  to anon, authenticated
  using (true) with check (true);
