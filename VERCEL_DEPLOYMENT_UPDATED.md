# 🚀 Updated Vercel Deployment Guide with Supabase

Complete guide for deploying Spect-IT to Vercel with Supabase integration.

## 📋 Pre-Deployment Checklist

- [ ] Supabase project created and configured
- [ ] Database schema imported
- [ ] Supabase API keys obtained
- [ ] Code committed to GitHub
- [ ] All features tested locally

## 🔧 Step 1: Set Up Vercel Project

1. Go to [vercel.com](https://vercel.com)
2. Sign up/Login with GitHub
3. Click "Add New" → "Project"
4. Import your `Spect-IT` repository
5. Configure:
   - **Framework Preset**: Other
   - **Root Directory**: `./eyetesting` (or root if files are in root)
   - **Build Command**: Leave empty
   - **Output Directory**: `./`
   - **Install Command**: Leave empty

## 🔑 Step 2: Add Environment Variables

In Vercel Dashboard → Your Project → Settings → Environment Variables:

### Required Variables:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

### Optional Variables (if using):

```
GOOGLE_PLACES_API_KEY=your-google-places-api-key
OPENAI_API_KEY=sk-your-openai-api-key
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-key
```

**Important**: 
- Set for **Production**, **Preview**, and **Development**
- Never commit these to git
- Use Vercel's environment variables

## 📝 Step 3: Update Config for Vercel

The `config.js` file will automatically read from environment variables:

```javascript
SUPABASE_URL: typeof process !== 'undefined' && process.env.SUPABASE_URL 
    ? process.env.SUPABASE_URL 
    : 'YOUR_SUPABASE_URL',
```

This means:
- **Local**: Uses values from `config.js`
- **Vercel**: Uses environment variables automatically

## 🚀 Step 4: Deploy

1. Click "Deploy" in Vercel
2. Wait for deployment (1-2 minutes)
3. Your app will be live at: `https://your-project.vercel.app`

## ✅ Step 5: Post-Deployment

1. **Test Authentication**:
   - Go to Account section
   - Try signing up
   - Verify email works

2. **Test Data Saving**:
   - Complete a test
   - Check if it saves to Supabase
   - View in Supabase dashboard

3. **Test Sharing**:
   - Share a prescription
   - Verify share link works

## 🔒 Step 6: Configure Supabase for Production

1. In Supabase dashboard → **Authentication** → **Settings**:
   - **Site URL**: `https://your-project.vercel.app`
   - **Redirect URLs**: Add `https://your-project.vercel.app/**`

2. In Supabase dashboard → **Settings** → **API**:
   - Review CORS settings
   - Add your Vercel domain if needed

## 📊 Step 7: Monitor

1. **Vercel Dashboard**:
   - Monitor deployments
   - Check function logs
   - View analytics

2. **Supabase Dashboard**:
   - Monitor database usage
   - Check API requests
   - View authentication logs

## 🔄 Step 8: Continuous Deployment

Vercel automatically deploys on:
- Push to `main` branch → Production
- Push to other branches → Preview
- Pull requests → Preview

## 🐛 Troubleshooting

### Issue: Environment variables not working
- **Solution**: 
  - Check variable names match exactly
  - Ensure they're set for correct environment
  - Redeploy after adding variables

### Issue: Supabase connection fails
- **Solution**:
  - Verify API keys are correct
  - Check Supabase project is active
  - Review browser console for errors

### Issue: Authentication redirects fail
- **Solution**:
  - Update Site URL in Supabase Auth settings
  - Add redirect URLs in Supabase
  - Check Vercel domain matches

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Supabase Setup Guide](./SUPABASE_SETUP.md)

---

**Your app is now live with cloud storage and authentication!** 🎉

