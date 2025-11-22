# 🔑 Set Google API Keys via Terminal

## 🚀 Quick Setup

### Option 1: Use the Automated Script

```bash
cd /Users/tanyastrauss/Spect-IT/website
./set-api-keys.sh
```

This will:
1. Prompt for your API keys
2. Set them in Vercel environment variables
3. Update spectit-location.js
4. Redeploy to production

---

### Option 2: Manual Setup via Vercel CLI

```bash
cd /Users/tanyastrauss/Spect-IT/website

# Set Google Places API Key
vercel env add GOOGLE_PLACES_API_KEY production
# Paste your API key when prompted

# Set Google Maps API Key
vercel env add GOOGLE_MAPS_API_KEY production
# Paste your API key when prompted

# Update the JavaScript file
# Edit spectit-location.js and replace:
#   'YOUR_GOOGLE_PLACES_API_KEY' with your actual key
#   'YOUR_GOOGLE_MAPS_API_KEY' with your actual key

# Redeploy
vercel --prod
```

---

### Option 3: Edit File Directly

```bash
cd /Users/tanyastrauss/Spect-IT/website

# Edit the file
nano spectit-location.js
# or
open -e spectit-location.js

# Find lines 7-8 and replace:
#   googlePlacesApiKey: 'YOUR_GOOGLE_PLACES_API_KEY',
#   googleMapsApiKey: 'YOUR_GOOGLE_MAPS_API_KEY',

# With your actual keys, then:
vercel --prod
```

---

## 📋 Get Your API Keys

1. Go to: https://console.cloud.google.com
2. Create a project (or select existing)
3. Enable APIs:
   - Places API
   - Maps JavaScript API
   - Directions API
4. Create API Key
5. Copy the key

---

## ✅ After Setting Keys

The location services and specialist finder will work automatically!

---

**Ready to set your API keys!** 🔑

