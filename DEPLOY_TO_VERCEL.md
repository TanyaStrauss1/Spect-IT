# 🚀 Deploy Spect-IT to Vercel - Complete Guide

## ✅ Prerequisites

- ✅ Code pushed to GitHub: `https://github.com/TanyaStrauss1/Spect-IT`
- ✅ Supabase database set up
- ✅ Supabase credentials configured

---

## 📋 Step-by-Step Deployment

### Step 1: Import Project to Vercel

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com/dashboard
   - Sign in (or create account with GitHub)

2. **Import Repository:**
   - Click **"Add New..."** → **"Project"**
   - Select **"Import Git Repository"**
   - Find and select: **`TanyaStrauss1/Spect-IT`**
   - Click **"Import"**

---

### Step 2: Configure Project Settings

1. **Project Name:**
   - Name: `spect-it` (or your preferred name)

2. **Root Directory:**
   - Click **"Edit"** next to Root Directory
   - Set to: **`eyetesting`** (since your app files are in this folder)
   - Click **"Continue"**

3. **Framework Preset:**
   - Select: **"Other"** (or "Vite" if detected)
   - Build Command: Leave empty (or `npm run build` if you have one)
   - Output Directory: **`./`** (current directory)

4. **Click "Deploy"** (we'll add environment variables after)

---

### Step 3: Add Environment Variables

**⚠️ IMPORTANT: Do this BEFORE the first deployment completes, or redeploy after adding.**

1. **In Vercel Dashboard:**
   - Go to your project → **Settings** → **Environment Variables**

2. **Add These Variables:**

   ```
   Name: SUPABASE_URL
   Value: https://lecwenhoatzpnvmhoiua.supabase.co
   Environment: Production, Preview, Development
   ```

   ```
   Name: SUPABASE_ANON_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlY3dlbmhvYXR6cG52bWhvaXVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMjgyMDEsImV4cCI6MjA3ODcwNDIwMX0.be4y8_3gorrn3a6zT2dIY9zNHoaGAPfd6aKVNE0r-PA
   Environment: Production, Preview, Development
   ```

3. **Save** each variable

4. **Redeploy:**
   - Go to **Deployments** tab
   - Click **"..."** on latest deployment → **"Redeploy"**

---

### Step 4: Update Supabase Auth Settings

1. **Get Your Vercel URL:**
   - After deployment, Vercel will give you a URL like: `https://spect-it.vercel.app`
   - Copy this URL

2. **Update Supabase:**
   - Go to: https://supabase.com/dashboard/project/lecwenhoatzpnvmhoiua/auth/url-configuration
   - **Site URL:** Set to your Vercel URL (e.g., `https://spect-it.vercel.app`)
   - **Redirect URLs:** Add:
     - `https://spect-it.vercel.app/**`
     - `https://*.vercel.app/**` (for preview deployments)
   - **Save**

---

### Step 5: Verify Deployment

1. **Visit Your App:**
   - Open your Vercel URL (e.g., `https://spect-it.vercel.app`)

2. **Test Authentication:**
   - Go to "Account" section
   - Sign up for an account
   - Verify email (check Supabase Auth logs if needed)

3. **Test Data Saving:**
   - Complete a test
   - Check Supabase Table Editor to verify data saved

4. **Check Console:**
   - Open browser DevTools (F12)
   - Check for any errors
   - Verify Supabase connection

---

## 🔧 Troubleshooting

### Issue: Environment Variables Not Working

**Solution:**
- Make sure variables are set for all environments (Production, Preview, Development)
- Redeploy after adding variables
- Check variable names match exactly (case-sensitive)

### Issue: Supabase Auth Not Working

**Solution:**
- Verify Supabase Auth URL settings include your Vercel domain
- Check browser console for CORS errors
- Ensure `SUPABASE_URL` and `SUPABASE_ANON_KEY` are correct

### Issue: Build Fails

**Solution:**
- Check Vercel build logs
- Ensure Root Directory is set to `eyetesting`
- Verify all files are committed to GitHub

### Issue: 404 Errors

**Solution:**
- Check `vercel.json` routing configuration
- Ensure `index.html` is in the root of the `eyetesting` directory

---

## 📚 Quick Reference

**GitHub Repository:**
👉 https://github.com/TanyaStrauss1/Spect-IT

**Vercel Dashboard:**
👉 https://vercel.com/dashboard

**Supabase Dashboard:**
👉 https://supabase.com/dashboard/project/lecwenhoatzpnvmhoiua

**Supabase Auth Settings:**
👉 https://supabase.com/dashboard/project/lecwenhoatzpnvmhoiua/auth/url-configuration

---

## ✅ Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Project imported to Vercel
- [ ] Root Directory set to `eyetesting`
- [ ] Environment variables added (SUPABASE_URL, SUPABASE_ANON_KEY)
- [ ] First deployment successful
- [ ] Supabase Auth URLs updated with Vercel domain
- [ ] Tested authentication on live site
- [ ] Tested data saving on live site
- [ ] Verified data appears in Supabase

---

**🎉 Your app is now live!**

