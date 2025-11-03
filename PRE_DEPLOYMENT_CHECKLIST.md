# ✅ Pre-Deployment Checklist for Vercel

## 🔑 Required Setup Before Deployment

### 1. API Accounts & Keys

- [ ] **Google Cloud Console**
  - [ ] Create account at https://console.cloud.google.com/
  - [ ] Create new project
  - [ ] Enable "Places API" 
  - [ ] Enable "Maps JavaScript API"
  - [ ] Create API Key
  - [ ] Restrict API key to your Vercel domain
  - [ ] Copy API key for environment variables

- [ ] **OpenAI Platform**
  - [ ] Create account at https://platform.openai.com/
  - [ ] Add payment method
  - [ ] Generate API key
  - [ ] Set usage limits
  - [ ] Copy API key for environment variables

- [ ] **Stripe Dashboard** (Optional - for e-commerce)
  - [ ] Create account at https://dashboard.stripe.com/
  - [ ] Get Publishable key (pk_test_...)
  - [ ] Copy key for environment variables

- [ ] **Firebase** (Optional - for user auth)
  - [ ] Create account at https://console.firebase.google.com/
  - [ ] Create new project
  - [ ] Enable Authentication
  - [ ] Copy config values for environment variables

---

## 📦 Vercel Environment Variables

Before deploying, prepare these environment variables:

### Required:
```
GOOGLE_PLACES_API_KEY=AIza...your-key
OPENAI_API_KEY=sk-...your-key
```

### Optional:
```
STRIPE_PUBLISHABLE_KEY=pk_test_...your-key
FIREBASE_API_KEY=your-firebase-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=your-app-id
```

---

## 🚀 Deployment Steps

1. **Push latest code to GitHub:**
   ```bash
   cd /Users/tanyastrauss/eyetesting
   git add .
   git commit -m "Add Vercel deployment configuration"
   git push origin main
   ```

2. **Go to Vercel Dashboard:**
   - Visit https://vercel.com/dashboard
   - Click "Add New" → "Project"
   - Import `Spect-IT` repository

3. **Configure Project:**
   - Framework: Other (Static Site)
   - Root Directory: `./`
   - Build Command: (leave empty)
   - Output Directory: `./`

4. **Add Environment Variables:**
   - Go to Project Settings → Environment Variables
   - Add all API keys listed above
   - Set for: Production, Preview, Development

5. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete
   - Copy deployment URL

---

## ✅ Post-Deployment Verification

After deployment, test:

- [ ] Site loads at Vercel URL
- [ ] HTTPS is enabled (check URL shows https://)
- [ ] Vision tests work
- [ ] Google Places search works (test professional search)
- [ ] OpenAI Q&A works (test asking a question)
- [ ] Camera access works (test virtual try-on)
- [ ] Shopping cart functions
- [ ] User accounts save data
- [ ] Mobile view works correctly

---

## 🔒 Security Checklist

- [ ] API keys are in Vercel environment variables (not in code)
- [ ] `config.js` is in `.gitignore` (not committed)
- [ ] Google API key is restricted to your domain
- [ ] Repository is set to **PRIVATE** on GitHub
- [ ] Vercel project access is restricted

---

## 📝 Files Created for Vercel

✅ `vercel.json` - Vercel configuration
✅ `api/config.js` - Serverless function for secure config access
✅ `package.json` - Project metadata
✅ `VERCEL_DEPLOYMENT.md` - Detailed deployment guide

---

## ⚠️ Important Notes

1. **API Keys**: Never commit API keys. Always use environment variables.

2. **HTTPS Required**: Camera access requires HTTPS - Vercel provides this automatically.

3. **Domain Restrictions**: Add your Vercel domain (e.g., `*.vercel.app`) to Google API key restrictions.

4. **Billing**: Monitor API usage:
   - Google: $200 free credit/month
   - OpenAI: Pay-per-use
   - Stripe: No fees until first sale

5. **Config File**: The `/api/config` endpoint safely exposes only public keys needed by the frontend.

---

## 🐛 Quick Troubleshooting

**Problem:** API keys not working after deployment
- **Fix:** Verify environment variables are set in Vercel dashboard
- Check they're enabled for the correct environment

**Problem:** Camera doesn't work
- **Fix:** Verify site is using HTTPS (Vercel provides automatically)
- Check browser permissions

**Problem:** Google Maps not loading
- **Fix:** Verify Places API is enabled in Google Cloud Console
- Check API key restrictions allow your Vercel domain

---

**Ready when all checkboxes are complete!** ✅

