# Testing the Vertical Slice

This document describes how to test the complete end-to-end vertical slice after the schema and RLS fixes.

## Prerequisites

1. **Fresh Supabase Project**: Create a new project at [supabase.com](https://supabase.com)
2. **Run ALL Migrations**: Execute migrations in order (see below)
3. **Environment Variables**: Set up `.env.local` files with your Supabase credentials

## Step 1: Run Migrations

### Option A: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Push all migrations
supabase db push
```

### Option B: Manual Execution in Supabase Dashboard

Go to SQL Editor and run each migration in order:

1. `supabase/migrations/20260703160000_spectit_core.sql`
2. `supabase/migrations/20260703170000_appointments.sql`
3. `supabase/migrations/20260703180000_rls_hardening.sql`
4. `supabase/migrations/20260704123000_provider_staff_auth.sql`
5. `supabase/migrations/20260706170000_practices_and_audit_log.sql`
6. ✅ **`supabase/migrations/20260910180000_auth_user_id_and_rls.sql`** (NEW - Required!)

### Verify Schema

After running migrations, verify in SQL Editor:

```sql
-- Check that user_id column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'test_results' 
  AND column_name IN ('user_id', 'user_email');

-- Should return:
-- user_id     | uuid
-- user_email  | text

-- Check RLS policies exist
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename = 'test_results';

-- Should include:
-- test_results_insert_anon
-- test_results_insert_authenticated
-- test_results_select_own
-- test_results_update_own
-- test_results_delete_own
```

## Step 2: Set Up Environment

### Web App

```bash
cd apps/web
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Mobile App

```bash
cd apps/mobile
cp .env.example .env
```

Edit `.env`:
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Step 3: Test Web Flow

```bash
cd apps/web
npm install
npm run dev
```

### Test Checklist

1. **Sign Up** (http://localhost:3000/auth/signup)
   - [ ] Create account with email and password
   - [ ] Check email for confirmation link (or disable in Supabase Auth settings)
   
2. **Sign In** (http://localhost:3000/auth/signin)
   - [ ] Sign in with credentials
   - [ ] Header shows "Sign Out" button
   - [ ] User email visible in UI

3. **Take Test** (http://localhost:3000/tests/acuity)
   - [ ] Test loads without errors
   - [ ] Can type letters and submit
   - [ ] Progress bar updates
   - [ ] Test completes and shows results
   - [ ] Results page shows Snellen score

4. **View Dashboard** (http://localhost:3000/dashboard)
   - [ ] Dashboard loads without "Loading..." stuck
   - [ ] Test result appears in history
   - [ ] Shows correct Snellen score
   - [ ] Shows test date and stats

5. **Verify Database** (Supabase Dashboard → Table Editor)
   - [ ] Open `test_results` table
   - [ ] Find your test result
   - [ ] Verify `user_id` is populated (UUID, not null)
   - [ ] Verify `user_email` matches your account

6. **Test RLS** (Sign out, create second account)
   - [ ] Sign out from first account
   - [ ] Create new account with different email
   - [ ] Dashboard should be empty (cannot see first user's results)
   - [ ] Take new test
   - [ ] Dashboard shows only new account's results

## Step 4: Test Mobile Flow

```bash
cd apps/mobile
npm install
npm start
```

### Test Checklist

1. **Launch App**
   - [ ] App loads without errors
   - [ ] Shows "Sign Up" / "Sign In" buttons

2. **Sign In**
   - [ ] Sign in with same account from web test
   - [ ] Home screen shows user email
   - [ ] "Start Vision Test" button visible

3. **Take Test**
   - [ ] Tap "Start Vision Test"
   - [ ] Test loads with letters
   - [ ] Can type and submit answers
   - [ ] Test completes and shows results

4. **View Dashboard**
   - [ ] Tap "Dashboard" tab
   - [ ] Shows same test results as web (from both mobile and web tests)
   - [ ] Test history includes web and mobile tests
   - [ ] Data syncs correctly

## Step 5: Verify RLS Isolation

This test confirms RLS policies work correctly:

```sql
-- In Supabase SQL Editor, as postgres (service role):

-- Check all test_results (bypasses RLS)
SELECT id, user_id, user_email, test_type, score
FROM test_results;

-- Should see results from both users
-- But each user in the app should only see their own
```

In the apps:
- [ ] User A can only see their own results in dashboard
- [ ] User B can only see their own results in dashboard
- [ ] No cross-user data leakage

## Expected Outcomes

### ✅ Success Indicators

1. **Schema**: `test_results` has both `user_id` (uuid) and `user_email` (text)
2. **Data**: Test results save with `user_id` populated
3. **RLS**: Users can SELECT only their own results via `auth.uid()`
4. **Sync**: Same results visible on web and mobile for same user
5. **Isolation**: Different users cannot see each other's results
6. **No Errors**: No console errors about missing columns or RLS blocks

### ❌ Failure Indicators (and fixes)

| Error | Cause | Fix |
|-------|-------|-----|
| "column user_id does not exist" | Migration not run | Run `20260910180000_auth_user_id_and_rls.sql` |
| Dashboard stuck on "Loading..." | No SELECT policy | Verify RLS policies created |
| "new row violates row-level security" | Wrong user_id on INSERT | Check app code sets `user_id: user.id` |
| Empty dashboard but data exists | RLS blocking | Check `user_id` matches `auth.uid()` |
| See other users' results | RLS not working | Re-run migration, check policies |

## Troubleshooting

### Migration Issues

```sql
-- Check if migration ran
SELECT version FROM supabase_migrations.schema_migrations 
WHERE version = '20260910180000';

-- If not present, run the migration SQL manually
```

### RLS Issues

```sql
-- Check policies
SELECT * FROM pg_policies WHERE tablename = 'test_results';

-- Test as authenticated user (replace YOUR_USER_ID)
SET request.jwt.claims.sub = 'YOUR_USER_ID';
SELECT * FROM test_results WHERE user_id = 'YOUR_USER_ID';
```

### Data Issues

```sql
-- Check if user_id is populated
SELECT COUNT(*) as total,
       COUNT(user_id) as with_user_id,
       COUNT(user_email) as with_email
FROM test_results;

-- Should have equal counts after new tests
```

## Clean Up (for re-testing)

To start fresh:

```sql
-- Delete test data (as service role in SQL Editor)
DELETE FROM test_results;

-- Delete test users (in Supabase Auth dashboard)
-- Or via SQL:
-- DELETE FROM auth.users WHERE email LIKE '%test%';
```

## Support

If tests fail:
1. Check migration order and execution
2. Verify environment variables
3. Check browser/app console for errors
4. Review Supabase logs (Dashboard → Logs)
5. Verify RLS policies in Database → Policies
