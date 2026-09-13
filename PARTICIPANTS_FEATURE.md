# Multi-Participant Profiles Feature

This PR implements multi-participant profiles, enabling one Spect-IT account to manage vision screening tests for multiple participants (children, students, family members, etc.).

## Product Need

**Families**: Parents/guardians can run vision screenings for multiple children and relatives on the same login.

**Teachers/Schools**: One account can run tests for many students, tracking each student's results separately.

## What Changed

### 1. Database Schema (`supabase/migrations/20260913180000_participants.sql`)

- **New `participants` table**:
  - `id` (uuid, primary key)
  - `user_id` (references auth.users - the account owner)
  - `display_name`, `date_of_birth`, `age`, `role` (self/child/student/family/other)
  - `is_self` (boolean - marks the owner's own profile)
  - `archived` (boolean - soft delete)

- **Updated `test_results` table**:
  - Added `participant_id` column (references participants)
  - Updated RLS policies to allow viewing/modifying results for owned participants

- **Automatic backfill**:
  - Creates a default "Me" participant for each existing user
  - Associates all existing test results with the default participant
  - Ensures no data loss during migration

### 2. Web App (`apps/web`)

#### New Components
- **`ParticipantContext`** (`src/lib/participants/participant-context.tsx`):
  - Manages participants list and active participant
  - Persists active participant selection in localStorage
  - CRUD operations for participants

- **`ParticipantSwitcher`** (`src/components/participants/ParticipantSwitcher.tsx`):
  - Dropdown in header to select active participant
  - Shows who is currently being tested

- **`ParticipantManager`** (`src/components/participants/ParticipantManager.tsx`):
  - Full UI for adding/editing/archiving participants
  - Form with name, DOB, age, role, notes

- **Participants page** (`src/app/dashboard/participants/page.tsx`):
  - Dedicated management interface

#### Updated Components
- **Layout** (`src/app/layout.tsx`):
  - Wrapped with `ParticipantProvider`

- **Header** (`src/components/layout/Header.tsx`):
  - Shows `ParticipantSwitcher` when logged in

- **Dashboard** (`src/app/dashboard/page.tsx`):
  - Filters results by active participant
  - Shows participant name in header
  - Link to manage participants

- **All test pages** (acuity, color-vision, astigmatism, contrast, visual-field, prescription):
  - Check for active participant before starting test
  - Save `participant_id` with test results

### 3. Mobile App (`apps/mobile`)

#### New Components
- **`ParticipantContext`** (`lib/participants/participant-context.tsx`):
  - Mobile version using AsyncStorage
  - Same CRUD operations as web

#### Updated Components
- **Root Layout** (`app/_layout.tsx`):
  - Wrapped with `ParticipantProvider`

- **Dashboard** (`app/(tabs)/dashboard.tsx`):
  - Filters results by active participant

- **Acuity Test** (`app/test/acuity.tsx`):
  - Checks for active participant
  - Saves `participant_id` with results

## How to Apply Migration

### For Local Development

1. Run the migration in your local Supabase:
   ```bash
   supabase migration up
   ```

   Or apply directly in Supabase Studio SQL Editor:
   ```bash
   cat supabase/migrations/20260913180000_participants.sql | pbcopy
   # Then paste in Supabase Studio and run
   ```

### For Production (spect-it.com)

1. **Backup your database** (Supabase Dashboard → Database → Backups)

2. Run the migration via Supabase Studio:
   - Go to SQL Editor
   - Paste the contents of `supabase/migrations/20260913180000_participants.sql`
   - Execute the query

3. **Verify**:
   - Check that `participants` table exists
   - Check that `test_results` has `participant_id` column
   - Verify existing users have a default "Me" participant
   - Verify existing test results are associated with participants

## Testing

### Manual Testing Checklist

#### Web App
- [ ] Sign in as existing user
- [ ] Verify default "Me" participant exists
- [ ] Navigate to Dashboard → Manage Participants
- [ ] Add a new participant (e.g., "Alex (child)")
- [ ] Switch to new participant using header switcher
- [ ] Run a vision test (any type)
- [ ] Verify result is saved for the active participant
- [ ] Switch back to "Me" participant
- [ ] Verify dashboard shows only "Me" results
- [ ] Switch to "Alex" participant
- [ ] Verify dashboard shows only "Alex" results
- [ ] Edit participant details
- [ ] Archive a participant

#### Mobile App
- [ ] Sign in on mobile
- [ ] Verify participants load
- [ ] Run a test with active participant
- [ ] Verify dashboard filters by participant

## Privacy & Security

- **RLS Policies**: Participants and their results are only visible to the account owner (via `auth.uid()`)
- **No sharing (yet)**: This is a single-account multi-participant model. Future PRs can add sharing between accounts.
- **Soft delete**: Archiving participants doesn't delete their test results

## Backwards Compatibility

- Existing users get a default "Me" participant automatically
- All existing test results are migrated to the default participant
- Old tests without `participant_id` still work (RLS policies allow `user_id` matching)

## Success Criteria

✅ Migration SQL with RLS and backfill  
✅ Web UI for participant management  
✅ Web participant switcher in header  
✅ All web tests save to active participant  
✅ Web dashboard filters by participant  
✅ Mobile participant context implemented  
✅ Mobile test (acuity) saves to participant  
✅ Mobile dashboard filters by participant  
✅ Documentation for manual migration  

## Future Improvements

- Full mobile UI for participant management (add/edit/archive)
- Update other mobile test pages (color-vision, astigmatism, etc.) to save participant_id
- Participant sharing between accounts (e.g., parent + school nurse sharing access)
- Participant avatars/photos
- Age-based test recommendations
- Export results per participant
- Clinical summary per participant (currently shows all)

## Files Changed

### New Files
- `supabase/migrations/20260913180000_participants.sql`
- `apps/web/src/lib/participants/participant-context.tsx`
- `apps/web/src/components/participants/ParticipantSwitcher.tsx`
- `apps/web/src/components/participants/ParticipantManager.tsx`
- `apps/web/src/app/dashboard/participants/page.tsx`
- `apps/mobile/lib/participants/participant-context.tsx`

### Modified Files
- `apps/web/src/app/layout.tsx`
- `apps/web/src/components/layout/Header.tsx`
- `apps/web/src/app/dashboard/page.tsx`
- `apps/web/src/app/tests/acuity/page.tsx`
- `apps/web/src/app/tests/color-vision/page.tsx`
- `apps/web/src/app/tests/astigmatism/page.tsx`
- `apps/web/src/app/tests/contrast/page.tsx`
- `apps/web/src/app/tests/visual-field/page.tsx`
- `apps/web/src/app/tests/prescription/page.tsx`
- `apps/mobile/app/_layout.tsx`
- `apps/mobile/app/(tabs)/dashboard.tsx`
- `apps/mobile/app/test/acuity.tsx`
