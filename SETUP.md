# Spect-IT Setup Guide

This guide will help you set up the Spect-IT monorepo for development.

## Prerequisites

- Node.js 18 or higher
- npm 9 or higher
- A Supabase account ([sign up here](https://supabase.com))
- Expo CLI (for mobile development)
- iOS Simulator (Mac) or Android Emulator for mobile development

## Step 1: Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd spect-it

# Install all dependencies
npm install
```

## Step 2: Set Up Supabase

### 2.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in your project details
4. Wait for the project to be created

### 2.2 Get Your Credentials

1. Go to Project Settings > API
2. Copy your:
   - Project URL (something like `https://xxxxx.supabase.co`)
   - Anon/Public key (starts with `eyJ...`)

### 2.3 Configure Auth Redirect URLs

For password reset functionality to work, you need to configure redirect URLs in Supabase:

1. Go to your Supabase Dashboard
2. Navigate to Authentication > URL Configuration
3. Add the following redirect URLs:
   - For local development:
     - `http://localhost:3000/auth/reset-password` (web)
     - `http://localhost:3000/auth/callback` (web sign-up confirmation)
     - `spectit://reset-password` (mobile)
   - For production:
     - `https://yourdomain.com/auth/reset-password` (web)
     - `https://yourdomain.com/auth/callback` (web sign-up confirmation)
     - `spectit://reset-password` (mobile)

### 2.4 Run Database Migrations

**Option A: Using Supabase CLI (Recommended)**

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project (get project ref from dashboard)
supabase link --project-ref your-project-ref

# Push migrations to your database
supabase db push
```

**Option B: Manual SQL Execution**

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Run each SQL file in `supabase/migrations/` in order:
   - `20260703160000_spectit_core.sql`
   - `20260703170000_appointments.sql`
   - `20260703180000_rls_hardening.sql`
   - `20260704123000_provider_staff_auth.sql`
   - `20260706170000_practices_and_audit_log.sql`
   - `20260910180000_auth_user_id_and_rls.sql` (Required for auth apps)

## Step 3: Configure Environment Variables

### 3.1 Root .env.local

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3.2 Web App Environment

```bash
cd apps/web
cp .env.example .env.local
```

Edit `apps/web/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3.3 Mobile App Environment

```bash
cd apps/mobile
cp .env.example .env
```

Edit `apps/mobile/.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 4: Start Development

### Web App

```bash
cd apps/web
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Mobile App

```bash
cd apps/mobile
npm run start
```

This will open Expo Dev Tools. You can:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app on your phone

## Step 5: Test the Vertical Slice

### Web Flow

1. Navigate to [http://localhost:3000](http://localhost:3000)
2. Click "Sign Up" and create an account
3. Check your email for confirmation (or disable email confirmation in Supabase settings)
4. Sign in with your credentials
5. Click "Start Test" to begin the Visual Acuity test
6. Complete the test by reading the letters
7. View your results and navigate to the Dashboard
8. See your test history

### Mobile Flow

1. Open the app in Expo Go or simulator
2. Tap "Get Started" to sign up or "Sign In"
3. Complete authentication
4. Tap "Start Vision Test"
5. Complete the Visual Acuity test
6. View results and check Dashboard

## Troubleshooting

### Issue: "Invalid project URL" error

**Solution:** Make sure your Supabase URL doesn't have a trailing slash and includes `https://`

### Issue: "Invalid API key" error

**Solution:** Double-check your anon key - it should start with `eyJ` and be quite long

### Issue: "Table doesn't exist" error

**Solution:** Run the database migrations (see Step 2.3)

### Issue: "Column user_id doesn't exist" error

**Solution:** Make sure you ran the latest migration `20260910180000_auth_user_id_and_rls.sql` that adds the `user_id` column

### Issue: Dashboard shows "Loading..." but no results appear

**Solution:** This is usually an RLS (Row Level Security) issue:
1. Verify the `20260910180000_auth_user_id_and_rls.sql` migration ran successfully
2. Check that test results have `user_id` populated (not null)
3. Verify you're signed in with the same account that created the test results

### Issue: Mobile app can't connect to Supabase

**Solution:** 
1. Make sure `.env` file exists in `apps/mobile/`
2. Restart the Expo development server after adding env vars
3. Clear Metro bundler cache: `npm start -- --clear`

### Issue: Web app auth not working

**Solution:**
1. Check browser console for errors
2. Verify environment variables in `.env.local`
3. Make sure email confirmation is disabled in Supabase (Settings > Auth > Email Auth > Confirm email: OFF) for testing

## Next Steps

- Explore the codebase structure
- Try modifying the Visual Acuity test
- Add more vision test types
- Customize the UI/UX
- Deploy to production (see DEPLOYMENT.md)

## Support

For issues or questions:
1. Check the main README.md
2. Review Supabase documentation
3. Open an issue on GitHub
