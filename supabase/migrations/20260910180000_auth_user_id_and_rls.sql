-- Add auth.users integration to test_results and fix RLS for authenticated apps
-- This migration adds user_id (uuid) for Supabase Auth integration while keeping user_email for backwards compatibility

-- Add user_id column that references auth.users
alter table public.test_results 
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

-- Create index for efficient queries
create index if not exists test_results_user_id_idx on public.test_results (user_id);

-- Backfill user_id from user_email where possible (if auth.users.email matches)
-- This is a best-effort backfill for existing data
update public.test_results
set user_id = auth.users.id
from auth.users
where test_results.user_email = auth.users.email
  and test_results.user_id is null;

-- Add RLS policies for authenticated users to manage their own test results
-- These policies work alongside the existing insert_anon policy

-- Allow authenticated users to select their own results
drop policy if exists test_results_select_own on public.test_results;
create policy test_results_select_own
  on public.test_results for select
  to authenticated
  using (auth.uid() = user_id);

-- Allow authenticated users to update their own results
drop policy if exists test_results_update_own on public.test_results;
create policy test_results_update_own
  on public.test_results for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Allow authenticated users to delete their own results
drop policy if exists test_results_delete_own on public.test_results;
create policy test_results_delete_own
  on public.test_results for delete
  to authenticated
  using (auth.uid() = user_id);

-- Update the insert policy to also check user_id for authenticated users
drop policy if exists test_results_insert_authenticated on public.test_results;
create policy test_results_insert_authenticated
  on public.test_results for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and test_type is not null
  );

-- Keep the anon insert policy for backwards compatibility (email-based)
-- The existing test_results_insert_anon policy remains unchanged

-- Add comment for documentation
comment on column public.test_results.user_id is 
  'References auth.users(id). Primary association for authenticated apps. user_email is kept for backwards compatibility.';
