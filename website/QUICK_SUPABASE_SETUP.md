# ⚡ Quick Supabase Setup (5 Minutes)

## Step 1: Create Account (2 min)
1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub or email
4. Create project: `spect-it`

## Step 2: Get Credentials (1 min)
1. In Supabase dashboard → **Settings** → **API**
2. Copy:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

## Step 3: Configure (1 min)
Edit `website/supabase-config.js`:

```javascript
const SUPABASE_CONFIG = {
    url: 'https://xxxxx.supabase.co',  // Paste your URL
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'  // Paste your key
};
```

## Step 4: Create Tables (1 min)
1. In Supabase → **SQL Editor** → **New query**
2. Copy SQL from `supabase-config.js` (lines 39-136)
3. Click **Run**

## Step 5: Test (30 sec)
1. Open https://www.spect-it.com
2. Sign in with email
3. Take a test
4. Check Supabase → **Table Editor** → `test_results`
5. ✅ You should see your test result!

---

## That's it! 🎉

Your data is now stored in Supabase (PostgreSQL database) with localStorage as backup.

