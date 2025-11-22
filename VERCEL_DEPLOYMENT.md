# 🚀 Vercel Deployment Guide for Spect-IT

Complete guide for deploying Spect-IT to Vercel with all features enabled.

## 📋 Pre-Deployment Checklist

### 1. ✅ API Keys & Accounts

Before deploying, ensure you have accounts and API keys for:

- [ ] **Google Cloud Console** - For Places API
- [ ] **OpenAI Platform** - For AI Q&A
- [ ] **Stripe Dashboard** (optional) - For e-commerce
- [ ] **Firebase Console** (optional) - For authentication

### 2. ✅ Repository Setup

- [ ] Code pushed to GitHub repository: `TanyaStrauss1/Spect-IT`
- [ ] Repository is set to **PRIVATE**
- [ ] All code committed and pushed to `main` branch

### 3. ✅ Local Testing

- [ ] App runs locally without errors
- [ ] All features tested
- [ ] Browser console shows no critical errors

---

## 🔧 Step-by-Step Vercel Deployment

### Step 1: Install Vercel CLI (Optional but Recommended)

```bash
npm i -g vercel
```

Or use the web interface (recommended for first-time setup).

### Step 2: Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub account
3. Authorize Vercel to access your repositories

### Step 3: Deploy from Dashboard

1. **Import Project:**
   - Click "Add New" → "Project"
   - Select your `Spect-IT` repository
   - Click "Import"

2. **Configure Project:**
   - **Framework Preset:** Other (or Static Site)
   - **Root Directory:** `./` (root)
   - **Build Command:** Leave empty (no build needed)
   - **Output Directory:** `./` (root)
   - **Install Command:** Leave empty

3. **Environment Variables:**
   Add these in the Vercel dashboard under "Environment Variables":

   ```
   GOOGLE_PLACES_API_KEY=your-google-places-api-key
   OPENAI_API_KEY=sk-your-openai-api-key
   STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-key (optional)
   FIREBASE_API_KEY=your-firebase-api-key (optional)
   FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com (optional)
   FIREBASE_PROJECT_ID=your-project-id (optional)
   FIREBASE_STORAGE_BUCKET=your-project.appspot.com (optional)
   FIREBASE_MESSAGING_SENDER_ID=123456789 (optional)
   FIREBASE_APP_ID=your-app-id (optional)
   ```

   **Important:** Set these for **Production**, **Preview**, and **Development** environments.

### Step 4: Deploy

- Click "Deploy"
- Wait for deployment to complete
- Your site will be live at: `https://spect-it.vercel.app` (or custom domain)

---

## 🔐 Environment Variables Setup

### Required Environment Variables

Add these in Vercel Dashboard → Your Project → Settings → Environment Variables:

#### 1. Google Places API
```
Variable Name: GOOGLE_PLACES_API_KEY
Value: AIza... (your actual key)
Environment: Production, Preview, Development
```

#### 2. OpenAI API
```
Variable Name: OPENAI_API_KEY
Value: sk-... (your actual key)
Environment: Production, Preview, Development
```

### Optional Environment Variables

#### 3. Stripe (for e-commerce)
```
Variable Name: STRIPE_PUBLISHABLE_KEY
Value: pk_test_... or pk_live_...
Environment: Production, Preview, Development
```

#### 4. Firebase (for authentication)
```
Variable Name: FIREBASE_API_KEY
Value: your-firebase-key
Environment: Production, Preview, Development

Variable Name: FIREBASE_AUTH_DOMAIN
Value: your-project.firebaseapp.com
Environment: Production, Preview, Development

Variable Name: FIREBASE_PROJECT_ID
Value: your-project-id
Environment: Production, Preview, Development
```

---

## 📝 Create vercel.json Configuration

Create a `vercel.json` file in your project root:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

---

## 🔄 Update config.js for Vercel

Modify `config.js` to use environment variables:

```javascript
// Configuration file for Spect-IT
// Environment variables are injected by Vercel

const CONFIG = {
    // Google Places API Key
    GOOGLE_PLACES_API_KEY: typeof process !== 'undefined' && process.env.GOOGLE_PLACES_API_KEY 
        ? process.env.GOOGLE_PLACES_API_KEY 
        : 'YOUR_GOOGLE_PLACES_API_KEY',
    
    // OpenAI API Key
    OPENAI_API_KEY: typeof process !== 'undefined' && process.env.OPENAI_API_KEY 
        ? process.env.OPENAI_API_KEY 
        : 'YOUR_OPENAI_API_KEY',
    
    // Stripe Publishable Key
    STRIPE_PUBLISHABLE_KEY: typeof process !== 'undefined' && process.env.STRIPE_PUBLISHABLE_KEY 
        ? process.env.STRIPE_PUBLISHABLE_KEY 
        : 'YOUR_STRIPE_PUBLISHABLE_KEY',
    
    // Firebase Config
    FIREBASE_CONFIG: {
        apiKey: typeof process !== 'undefined' && process.env.FIREBASE_API_KEY 
            ? process.env.FIREBASE_API_KEY 
            : "YOUR_FIREBASE_API_KEY",
        authDomain: typeof process !== 'undefined' && process.env.FIREBASE_AUTH_DOMAIN 
            ? process.env.FIREBASE_AUTH_DOMAIN 
            : "your-project.firebaseapp.com",
        projectId: typeof process !== 'undefined' && process.env.FIREBASE_PROJECT_ID 
            ? process.env.FIREBASE_PROJECT_ID 
            : "your-project-id",
        storageBucket: typeof process !== 'undefined' && process.env.FIREBASE_STORAGE_BUCKET 
            ? process.env.FIREBASE_STORAGE_BUCKET 
            : "your-project.appspot.com",
        messagingSenderId: typeof process !== 'undefined' && process.env.FIREBASE_MESSAGING_SENDER_ID 
            ? process.env.FIREBASE_MESSAGING_SENDER_ID 
            : "123456789",
        appId: typeof process !== 'undefined' && process.env.FIREBASE_APP_ID 
            ? process.env.FIREBASE_APP_ID 
            : "YOUR_APP_ID"
    },
    
    // API Endpoints (for backend if needed)
    API_BASE_URL: typeof process !== 'undefined' && process.env.API_BASE_URL 
        ? process.env.API_BASE_URL 
        : 'https://your-api-endpoint.com/api',
    
    // Feature Flags
    FEATURES: {
        GOOGLE_PLACES: true,
        OPENAI_QA: true,
        STRIPE_CHECKOUT: true,
        FIREBASE_AUTH: false, // Set to true when Firebase is configured
        FACE_DETECTION: true
    }
};
```

**Note:** Since `config.js` is excluded from git, you'll need to update it manually on Vercel or use environment variables directly in the code.

---

## 🔧 Alternative: Use Environment Variables Directly in app.js

Since config.js isn't in the repo, update `app.js` to read from environment variables:

In `app.js`, replace config references with:

```javascript
// Read from environment or use defaults
const getConfigValue = (key, defaultValue) => {
    if (typeof window !== 'undefined' && window.__ENV__) {
        return window.__ENV__[key] || defaultValue;
    }
    return defaultValue;
};

// Or use build-time injection with Vercel
const GOOGLE_PLACES_API_KEY = '%VITE_GOOGLE_PLACES_API_KEY%' || 'YOUR_GOOGLE_PLACES_API_KEY';
```

---

## 🌐 Better Approach: Build-time Injection

### Option 1: Use Vercel's Build-time Replacement

Create a build script that injects environment variables into config.js:

1. Create `build-config.js`:
```javascript
const fs = require('fs');

const config = `const CONFIG = {
    GOOGLE_PLACES_API_KEY: '${process.env.GOOGLE_PLACES_API_KEY || 'YOUR_GOOGLE_PLACES_API_KEY'}',
    OPENAI_API_KEY: '${process.env.OPENAI_API_KEY || 'YOUR_OPENAI_API_KEY'}',
    // ... rest of config
};`;

fs.writeFileSync('./config.js', config);
```

2. Update `vercel.json`:
```json
{
  "buildCommand": "node build-config.js"
}
```

### Option 2: Use Runtime Environment Injection (Recommended)

Modify `index.html` to inject environment variables:

Add this before `</body>` in `index.html`:

```html
<script>
    // Inject environment variables from Vercel
    window.__ENV__ = {
        GOOGLE_PLACES_API_KEY: '<%= process.env.GOOGLE_PLACES_API_KEY %>',
        OPENAI_API_KEY: '<%= process.env.OPENAI_API_KEY %>',
        // ... other vars
    };
</script>
```

But since we're using static HTML, the best approach is:

### Option 3: Fetch Config from Server (Most Secure)

Create a `/api/config` endpoint in Vercel:

1. Create `api/config.js`:
```javascript
export default function handler(req, res) {
    res.json({
        GOOGLE_PLACES_API_KEY: process.env.GOOGLE_PLACES_API_KEY,
        OPENAI_API_KEY: process.env.OPENAI_API_KEY,
        STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
        // ... other public keys only
    });
}
```

2. Update `app.js` to fetch config:
```javascript
async function loadConfig() {
    try {
        const response = await fetch('/api/config');
        const config = await response.json();
        window.CONFIG = config;
    } catch (error) {
        console.error('Failed to load config:', error);
        // Use fallback config
    }
}
```

---

## 📦 Recommended: Create package.json

Create a `package.json` for better Vercel integration:

```json
{
  "name": "spect-it",
  "version": "1.0.0",
  "description": "Professional Vision Testing Application",
  "scripts": {
    "dev": "npx serve .",
    "build": "echo 'No build step required'"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/TanyaStrauss1/Spect-IT.git"
  },
  "keywords": [
    "vision-test",
    "eye-test",
    "health"
  ],
  "author": "TanyaStrauss1",
  "license": "MIT"
}
```

---

## ✅ Post-Deployment Checklist

After deployment:

- [ ] Test all vision tests work
- [ ] Verify Google Places API works (search professionals)
- [ ] Test OpenAI Q&A functionality
- [ ] Check virtual try-on with camera
- [ ] Test shopping cart functionality
- [ ] Verify user account system
- [ ] Test on mobile devices
- [ ] Check HTTPS is enabled (required for camera access)
- [ ] Verify environment variables are loaded
- [ ] Test all navigation links

---

## 🔒 Security Reminders

1. **Never commit API keys** - Already excluded in `.gitignore`
2. **Use environment variables** - Set in Vercel dashboard
3. **Restrict API keys** - Add domain restrictions to Google/OpenAI
4. **HTTPS required** - Vercel provides this automatically
5. **Review API quotas** - Monitor usage to avoid unexpected charges

---

## 🐛 Troubleshooting

### Issue: API keys not working
- **Solution:** Check environment variables are set in Vercel dashboard
- Verify they're set for the correct environment (Production/Preview)

### Issue: Camera access denied
- **Solution:** HTTPS is required - Vercel provides this automatically
- Check browser permissions in site settings

### Issue: Face detection not loading
- **Solution:** Check browser console for TensorFlow.js errors
- Ensure CDN links in HTML are accessible

### Issue: Google Maps not loading
- **Solution:** Verify Places API is enabled in Google Cloud Console
- Check API key restrictions allow your Vercel domain

---

## 📞 Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Google Places API Setup](https://developers.google.com/maps/documentation/places/web-service)
- [OpenAI API Docs](https://platform.openai.com/docs)

---

## 🚀 Quick Deploy Command (CLI)

If using Vercel CLI:

```bash
cd /Users/tanyastrauss/eyetesting
vercel login
vercel --prod
```

Follow prompts to link project and set environment variables.

---

**Ready to deploy!** Follow the steps above and your Spect-IT app will be live on Vercel. 🎉

