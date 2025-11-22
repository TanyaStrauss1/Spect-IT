# 🚀 Deploy to Vercel - spect-it-app1

## ✅ Your Vercel Project

- **Project**: spect-it-app1
- **Team**: equi-ledger
- **Domains**: 
  - spect-it.com (307 redirect)
  - www.spect-it.com (Production)
  - spect-it-app1.vercel.app (Production)

---

## 🎯 Quick Deploy Steps

### Option 1: Connect This Repository to Vercel

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/equi-ledger/spect-it-app1
   - Click "Settings" → "Git"

2. **Connect Repository**
   - If not connected, click "Connect Git Repository"
   - Select: `TanyaStrauss1/Spect-IT`
   - Root Directory: `website/`
   - Framework: Other (Static)
   - Build Command: (leave empty)
   - Output Directory: `./`

3. **Add Environment Variables**
   - Go to Settings → Environment Variables
   - Add:
     ```
     GOOGLE_PLACES_API_KEY=your_key
     GOOGLE_MAPS_API_KEY=your_key
     ```

4. **Deploy**
   - Vercel will auto-deploy when you push to GitHub
   - Or click "Redeploy" in dashboard

---

### Option 2: Deploy via Vercel CLI

```bash
cd /Users/tanyastrauss/Spect-IT/website

# Install Vercel CLI (if not installed)
npm i -g vercel

# Login
vercel login

# Link to existing project
vercel link

# Follow prompts:
# - Which scope? equi-ledger
# - Link to existing project? Yes
# - Project name? spect-it-app1

# Deploy
vercel --prod
```

---

## 📋 What's Ready to Deploy

**In `/website/` folder:**
- ✅ `index.html` - Complete website with all improvements
- ✅ `spectit-currency.js` - ZAR currency conversion
- ✅ `spectit-products.js` - Real products with shopping cart
- ✅ `spectit-location.js` - Location services & specialist finder
- ✅ `spectit-styles.css` - Complete CSS styling
- ✅ `vercel.json` - Vercel configuration
- ✅ `package.json` - Project configuration

---

## 🔑 Required: Set API Keys

**Before deploying, edit `website/spectit-location.js`:**

Replace:
```javascript
const CONFIG = {
  googlePlacesApiKey: 'YOUR_GOOGLE_PLACES_API_KEY',
  googleMapsApiKey: 'YOUR_GOOGLE_MAPS_API_KEY'
};
```

With your actual API keys from: https://console.cloud.google.com

---

## ✅ After Deployment

1. **Test the website**
   - Visit: https://www.spect-it.com
   - Check currency (should be ZAR)
   - Test products
   - Test location services
   - Test virtual try-on

2. **Verify Features**
   - ✅ All prices in ZAR
   - ✅ Real products display
   - ✅ Shopping cart works
   - ✅ Location services work
   - ✅ Specialist finder works

---

## 🚀 Deploy Now!

**Quick command:**
```bash
cd /Users/tanyastrauss/Spect-IT/website
vercel --prod
```

**Or push to GitHub and Vercel will auto-deploy!**

---

**All files ready in `/website/` folder!** 🎉

