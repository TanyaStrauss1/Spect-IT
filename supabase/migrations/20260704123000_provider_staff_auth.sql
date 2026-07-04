-- Spect-IT — provider staff auth + invite metadata
-- Keeps the legacy shared PIN available as a bootstrap path while
-- adding real provider staff memberships for magic-link auth.

alter table public.practice_staff
  add column if not exists full_name text,
  add column if not exists phone text,
  add column if not exists auth_user_id uuid,
  add column if not exists status text not null default 'invited'
    check (status in ('invited', 'active', 'disabled')),
  add column if not exists invited_at timestamptz,
  add column if not exists invited_by_email text,
  add column if not exists activated_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

create index if not exists practice_staff_email_idx
  on public.practice_staff (email);

create index if not exists practice_staff_auth_user_id_idx
  on public.practice_staff (auth_user_id);

drop trigger if exists practice_staff_set_updated_at on public.practice_staff;
create trigger practice_staff_set_updated_at
  before update on public.practice_staff
  for each row execute function public.set_updated_at();
