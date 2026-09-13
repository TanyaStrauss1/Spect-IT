-- Multi-participant profiles feature
-- Enables one account to manage multiple test participants (family members, students, etc.)

-- ============================================
-- PARTICIPANTS TABLE
-- ============================================
create table if not exists public.participants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null,
  date_of_birth date,
  age integer,
  role text check (role in ('self', 'child', 'student', 'family', 'other')),
  notes text,
  is_self boolean default false,
  archived boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes for efficient queries
create index if not exists participants_user_id_idx on public.participants (user_id);
create index if not exists participants_user_archived_idx on public.participants (user_id, archived);

-- ============================================
-- RLS POLICIES FOR PARTICIPANTS
-- ============================================
alter table public.participants enable row level security;

-- Users can only see their own participants
drop policy if exists participants_select_own on public.participants;
create policy participants_select_own
  on public.participants for select
  to authenticated
  using (auth.uid() = user_id);

-- Users can create their own participants
drop policy if exists participants_insert_own on public.participants;
create policy participants_insert_own
  on public.participants for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Users can update their own participants
drop policy if exists participants_update_own on public.participants;
create policy participants_update_own
  on public.participants for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Users can delete their own participants
drop policy if exists participants_delete_own on public.participants;
create policy participants_delete_own
  on public.participants for delete
  to authenticated
  using (auth.uid() = user_id);

-- ============================================
-- ADD PARTICIPANT_ID TO TEST_RESULTS
-- ============================================
alter table public.test_results 
  add column if not exists participant_id uuid references public.participants(id) on delete cascade;

-- Create index for efficient queries
create index if not exists test_results_participant_id_idx on public.test_results (participant_id);

-- ============================================
-- UPDATE RLS POLICIES FOR TEST_RESULTS
-- ============================================

-- Update select policy to allow viewing results for own participants
drop policy if exists test_results_select_own on public.test_results;
create policy test_results_select_own
  on public.test_results for select
  to authenticated
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.participants
      where participants.id = test_results.participant_id
      and participants.user_id = auth.uid()
    )
  );

-- Update update policy
drop policy if exists test_results_update_own on public.test_results;
create policy test_results_update_own
  on public.test_results for update
  to authenticated
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.participants
      where participants.id = test_results.participant_id
      and participants.user_id = auth.uid()
    )
  )
  with check (
    auth.uid() = user_id
    or exists (
      select 1 from public.participants
      where participants.id = test_results.participant_id
      and participants.user_id = auth.uid()
    )
  );

-- Update delete policy
drop policy if exists test_results_delete_own on public.test_results;
create policy test_results_delete_own
  on public.test_results for delete
  to authenticated
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.participants
      where participants.id = test_results.participant_id
      and participants.user_id = auth.uid()
    )
  );

-- Update insert policy to require valid participant
drop policy if exists test_results_insert_authenticated on public.test_results;
create policy test_results_insert_authenticated
  on public.test_results for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and test_type is not null
    and (
      participant_id is null
      or exists (
        select 1 from public.participants
        where participants.id = test_results.participant_id
        and participants.user_id = auth.uid()
      )
    )
  );

-- ============================================
-- BACKFILL: CREATE DEFAULT PARTICIPANTS
-- ============================================
-- For each user_id in test_results, create a "Me" participant if they don't have one
-- and associate all their existing results with it

do $$
declare
  user_rec record;
  default_participant_id uuid;
begin
  -- For each unique user_id in test_results
  for user_rec in 
    select distinct user_id 
    from public.test_results 
    where user_id is not null 
      and participant_id is null
  loop
    -- Check if user already has a 'self' participant
    select id into default_participant_id
    from public.participants
    where user_id = user_rec.user_id
      and is_self = true
    limit 1;

    -- If not, create one
    if default_participant_id is null then
      insert into public.participants (user_id, display_name, role, is_self)
      values (user_rec.user_id, 'Me', 'self', true)
      returning id into default_participant_id;
    end if;

    -- Associate all existing results with this participant
    update public.test_results
    set participant_id = default_participant_id
    where user_id = user_rec.user_id
      and participant_id is null;
  end loop;
end $$;

-- ============================================
-- TRIGGER: Auto-update updated_at timestamp
-- ============================================
create trigger update_participants_updated_at 
  before update on public.participants
  for each row 
  execute function update_updated_at_column();

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================
comment on table public.participants is 
  'Test participants managed by an account. One account can manage multiple participants (children, students, family members, etc.)';

comment on column public.participants.user_id is 
  'Account owner - references auth.users(id)';

comment on column public.participants.is_self is 
  'True if this participant represents the account owner themselves';

comment on column public.participants.role is 
  'Optional participant role: self, child, student, family, other';

comment on column public.test_results.participant_id is 
  'References participants(id). Which participant took this test. If null, uses legacy user_id association.';
