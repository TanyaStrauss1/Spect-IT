# 🚀 Quick Setup Guide - Supabase Already Configured!

Your Supabase credentials are already in `config.js`. Follow these steps:

## Step 1: Set Up Database Schema

1. Go to https://supabase.com/dashboard
2. Select your project: `lecwenhoatzpnvmhoiua`
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**
5. Open `supabase/schema.sql` in your code editor
6. Copy the ENTIRE file contents
7. Paste into Supabase SQL Editor
8. Click **Run** (or press Cmd/Ctrl + Enter)
9. You should see: "Success. No rows returned"

## Step 2: Verify Tables Created

1. In Supabase dashboard, click **Table Editor**
2. You should see these tables:
   - ✅ profiles
   - ✅ test_results
   - ✅ prescriptions
   - ✅ shared_results

## Step 3: Configure Authentication

1. In Supabase dashboard, go to **Authentication** → **Settings**
2. Set **Site URL**: 
   - For local testing: `http://localhost:3000` or `file://`
   - For production: Your Vercel URL
3. Add **Redirect URLs**:
   - `http://localhost:3000/**`
   - `https://your-app.vercel.app/**`

## Step 4: Test Locally

1. Open `index.html` in your browser
2. Go to **Account** section
3. Click **Create Account**
4. Enter email and password
5. Check your email for verification link
6. Sign in
7. Complete a test
8. Check if it saves to Supabase:
   - Go to Supabase dashboard
   - **Table Editor** → `test_results`
   - You should see your test!

## Step 5: Deploy to Vercel

1. Push your code to GitHub
2. Go to https://vercel.com
3. Import your repository
4. In **Environment Variables**, add:
   - `SUPABASE_URL` = `https://lecwenhoatzpnvmhoiua.supabase.co`
   - `SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
5. Deploy!

## ✅ Done!

Your app now has:
- ✅ User authentication
- ✅ Cloud storage
- ✅ Test history
- ✅ Prescription management
- ✅ Sharing capabilities

