# 🚀 Supabase Setup Guide for Spect-IT

Complete guide to set up Supabase for your Spect-IT application.

## 📋 Prerequisites

1. A Supabase account (sign up at https://supabase.com)
2. Your web app code ready

## 🔧 Step 1: Create Supabase Project

1. Go to https://supabase.com
2. Click "New Project"
3. Fill in:
   - **Project Name**: `spect-it` (or your preferred name)
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to your users
4. Click "Create new project"
5. Wait for project to be created (2-3 minutes)

## 📊 Step 2: Set Up Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the contents of `supabase/schema.sql`
4. Paste into the SQL Editor
5. Click "Run" (or press Cmd/Ctrl + Enter)
6. Verify tables were created:
   - Go to **Table Editor**
   - You should see: `profiles`, `test_results`, `prescriptions`, `shared_results`

## 🔑 Step 3: Get API Keys

1. In Supabase dashboard, go to **Settings** → **API**
2. Copy the following:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

## ⚙️ Step 4: Configure Your App

### Option A: For Local Development

1. Open `config.js`
2. Update:
   ```javascript
   SUPABASE_URL: 'https://your-project.supabase.co',
   SUPABASE_ANON_KEY: 'your-anon-key-here',
   ```

### Option B: For Vercel Deployment

1. Go to your Vercel project dashboard
2. Go to **Settings** → **Environment Variables**
3. Add:
   - **Name**: `SUPABASE_URL`
   - **Value**: `https://your-project.supabase.co`
   - **Environments**: Production, Preview, Development
4. Add:
   - **Name**: `SUPABASE_ANON_KEY`
   - **Value**: `your-anon-key-here`
   - **Environments**: Production, Preview, Development

## 🔐 Step 5: Configure Authentication

1. In Supabase dashboard, go to **Authentication** → **Settings**
2. Configure:
   - **Site URL**: Your app URL (e.g., `https://your-app.vercel.app`)
   - **Redirect URLs**: Add your app URL
3. Enable **Email** provider (already enabled by default)
4. (Optional) Configure other providers (Google, GitHub, etc.)

### Practice console (provider) redirect URL

The provider console uses **Supabase magic links**. You must allow redirects to the provider console URL.

- Add **Redirect URL**: `https://www.spect-it.com/provider` (or your deployed provider URL)
- Set Edge Function secret **`SPECTIT_PROVIDER_URL`** to the same URL (used when generating OTP links)

## ✉️ Step 5B: Configure messaging providers (Resend + Twilio)

Some notifications are sent via Edge Functions:

- **Email (`send-email`)**:
  - `RESEND_API_KEY`
  - `EMAIL_FROM` (example: `Spect-IT <noreply@spect-it.com>`)
- **SMS (`send-sms`)**:
  - `TWILIO_ACCOUNT_SID`
  - `TWILIO_AUTH_TOKEN`
  - `TWILIO_FROM_NUMBER`

Magic-link sign-in emails are sent by Supabase Auth. (If you want Resend for auth emails, configure Supabase Auth SMTP to use Resend.)

## 🧩 Step 5C: Provider console/admin Edge Function secrets

Set these in Supabase → **Project Settings** → **Edge Functions** → **Secrets** (or CLI).

- **Provider console**
  - `SPECTIT_PROVIDER_URL`: `https://www.spect-it.com/provider`
  - `SPECTIT_PROVIDER_PIN`: legacy shared PIN (bootstrap only)
- **Spect-IT internal onboarding**
  - `SPECTIT_ADMIN_SECRET`: used by `provider-admin` to authorize `create_practice`
  - (Optional) `SPECTIT_ADMIN_EMAILS`: comma-separated allowlist for Spect-IT staff who can create practices via logged-in Supabase auth

Never commit these values to git.

### Smoke tests (curl)

Replace `PROJECT_REF` and `ANON_KEY`, and optionally `ACCESS_TOKEN` (from a logged-in provider admin session).

- **Create practice + invite first admin** (Spect-IT internal):

```bash
curl -sS "https://PROJECT_REF.functions.supabase.co/provider-admin" \
  -H "Content-Type: application/json" \
  -H "apikey: ANON_KEY" \
  -H "x-spectit-admin-secret: $SPECTIT_ADMIN_SECRET" \
  -d '{"action":"create_practice","practicePlaceId":"place_123","name":"Demo Practice","adminEmail":"admin@example.com","adminPhone":"+27..."}'
```

- **Resend invite** (practice admin; requires `ACCESS_TOKEN`):

```bash
curl -sS "https://PROJECT_REF.functions.supabase.co/provider-admin" \
  -H "Content-Type: application/json" \
  -H "apikey: ANON_KEY" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{"action":"resend_invite","practicePlaceId":"place_123","email":"staff@example.com"}'
```

## ✅ Step 6: Test Authentication

1. Open your app
2. Go to the Account section
3. Try signing up with a test email
4. Check your email for verification link
5. Sign in and verify it works

## 📱 Step 7: Test Database Operations

1. Complete a test (e.g., Visual Acuity)
2. Check if it saves to Supabase:
   - Go to Supabase dashboard
   - **Table Editor** → `test_results`
   - You should see your test result

## 🔒 Step 8: Security Settings

1. In Supabase dashboard, go to **Settings** → **API**
2. Review **Row Level Security (RLS)** policies:
   - Already configured in schema.sql
   - Users can only see their own data
3. (Optional) Add additional security policies

## 🚀 Step 9: Deploy to Vercel

1. Push your code to GitHub
2. In Vercel, go to your project
3. Add environment variables (from Step 4B)
4. Redeploy your app
5. Test authentication and data saving

## 📊 Step 10: Monitor Usage

1. In Supabase dashboard, go to **Settings** → **Usage**
2. Monitor:
   - Database size
   - API requests
   - Storage usage
3. Set up alerts if needed

## 🐛 Troubleshooting

### Issue: "Supabase not configured"
- **Solution**: Check that `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set correctly

### Issue: "User must be authenticated"
- **Solution**: Make sure user is signed in before saving data

### Issue: "Row Level Security policy violation"
- **Solution**: Check that RLS policies are set up correctly in schema.sql

### Issue: Authentication not working
- **Solution**: 
  - Check Site URL in Supabase Auth settings
  - Verify redirect URLs are configured
  - Check browser console for errors

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

## ✅ Checklist

- [ ] Supabase project created
- [ ] Database schema imported
- [ ] API keys obtained
- [ ] Config.js updated (local) or Vercel env vars set
- [ ] Authentication configured
- [ ] Test authentication works
- [ ] Test data saving works
- [ ] Deployed to Vercel
- [ ] Production environment variables set

---

**Ready to go!** Your app now has cloud storage, authentication, and data persistence. 🎉

