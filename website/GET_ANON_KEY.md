# 🔑 How to Get Your Supabase Anon Key

## Quick Steps

1. **Go to your Supabase Dashboard:**
   - https://supabase.com/dashboard/project/lecwenhoatzpnvmhoiua

2. **Navigate to API Settings:**
   - Click **Settings** (gear icon in left sidebar)
   - Click **API** in the settings menu

3. **Copy the Anon Key:**
   - Find **"Project API keys"** section
   - Copy the **"anon"** or **"public"** key
   - It starts with: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - This is safe to use in client-side code

4. **Update Configuration:**
   - Open `website/supabase-config.js`
   - Replace `'your-anon-key-here'` with your copied key
   - Save the file

5. **Deploy:**
   - The updated config will be deployed automatically
   - Or run: `cd website && vercel --prod`

---

## What the Anon Key Looks Like

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlY3dlbmhvYXR6cG52bWhvaXVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ3ODk2MDAsImV4cCI6MjA1MDM2NTYwMH0.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Note:** This is a long string (usually 200+ characters). Make sure to copy the entire key.

---

## Security Note

✅ **Safe for client-side:** The anon key is designed to be used in browser JavaScript  
✅ **Protected by RLS:** Row-level security policies protect your data  
⚠️ **Don't share:** Keep your service_role key secret (never use in client-side code)

---

## After Getting the Key

Once you've updated `supabase-config.js` with your anon key:

1. Create database tables (run SQL from `SUPABASE_SETUP.md`)
2. Test: `window.SupabaseStorage.isAvailable()` should return `true`
3. Your data will automatically sync to Supabase!

