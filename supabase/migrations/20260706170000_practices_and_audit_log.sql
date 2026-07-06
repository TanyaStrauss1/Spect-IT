-- Spect-IT — Practices + audit log + staff management fields
-- Adds a first-class practices table and a basic admin audit trail.

create table if not exists public.practices (
  id                bigint generated always as identity primary key,
  practice_place_id text not null unique,
  name              text not null,
  created_by_email  text,
  created_at        timestamptz not null default now()
);

create index if not exists practices_name_idx on public.practices (name);

create table if not exists public.audit_log (
  id               bigint generated always as identity primary key,
  practice_place_id text,
  actor_user_id    uuid,
  actor_email      text,
  action           text not null,
  metadata         jsonb not null default '{}'::jsonb,
  created_at       timestamptz not null default now()
);

create index if not exists audit_log_practice_place_id_idx on public.audit_log (practice_place_id);
create index if not exists audit_log_actor_email_idx on public.audit_log (actor_email);
create index if not exists audit_log_created_at_idx on public.audit_log (created_at desc);

alter table public.practice_staff
  add column if not exists disabled_at timestamptz,
  add column if not exists disabled_by_email text;

