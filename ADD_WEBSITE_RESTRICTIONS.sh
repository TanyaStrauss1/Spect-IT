#!/bin/bash

# Add Website Restrictions to Google API Keys
# Security measure to restrict API keys to specific domains

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║          🔒 ADDING WEBSITE RESTRICTIONS TO API KEYS             ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

GOOGLE_CREDENTIALS_URL="https://console.cloud.google.com/apis/credentials"

# Detect website domains
echo "🌐 Detecting website domains..."
echo ""

# Check for Vercel deployment
VERCEL_URL="https://spect-it.vercel.app"
CUSTOM_DOMAIN="www.spect-it.com"
LOCALHOST="localhost:3000"

echo "📋 Website Domains to Restrict:"
echo ""
echo "   Production:"
echo "   - $CUSTOM_DOMAIN"
echo "   - $VERCEL_URL"
echo "   - *.vercel.app (for preview deployments)"
echo ""
echo "   Development:"
echo "   - $LOCALHOST"
echo "   - 127.0.0.1:3000"
echo ""

# Open Google Cloud Console
echo "🔑 Opening Google Cloud Console..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    open "$GOOGLE_CREDENTIALS_URL" 2>/dev/null
else
    xdg-open "$GOOGLE_CREDENTIALS_URL" 2>/dev/null
fi

echo "✅ Console opened"
echo ""

# Create restriction guide
cat > GOOGLE_API_RESTRICTIONS.md << 'RESTRICTIONSEOF'
# Google API Key Website Restrictions

## 🔒 Security: Restrict API Keys to Specific Domains

### Why Restrict?
- Prevents unauthorized use of your API keys
- Limits API usage to your domains only
- Reduces risk of key theft/abuse
- Required for production security

### Domains to Restrict

#### Production Domains:
```
www.spect-it.com
spect-it.com
spect-it.vercel.app
*.vercel.app
```

#### Development Domains:
```
localhost:3000
127.0.0.1:3000
localhost
127.0.0.1
```

### Step-by-Step Instructions

1. **Go to Google Cloud Console:**
   https://console.cloud.google.com/apis/credentials

2. **Find Your API Key:**
   - Look for "Spect-IT" or your API key name
   - Click on the key to edit

3. **Add Website Restrictions:**
   - Under "Application restrictions"
   - Select "HTTP referrers (web sites)"
   - Click "Add an item"

4. **Add Each Domain:**
   ```
   https://www.spect-it.com/*
   https://spect-it.com/*
   https://spect-it.vercel.app/*
   https://*.vercel.app/*
   http://localhost:3000/*
   http://127.0.0.1:3000/*
   ```

5. **API Restrictions:**
   - Under "API restrictions"
   - Select "Restrict key"
   - Enable only:
     - Places API
     - Maps JavaScript API
     - Geocoding API
     - Distance Matrix API (if used)

6. **Save Changes:**
   - Click "Save"
   - Wait for changes to propagate (1-2 minutes)

### Restriction Patterns

**For Production:**
```
https://www.spect-it.com/*
https://spect-it.com/*
https://spect-it.vercel.app/*
https://*.vercel.app/*
```

**For Development:**
```
http://localhost:3000/*
http://127.0.0.1:3000/*
http://localhost/*
http://127.0.0.1/*
```

**Wildcard Pattern (Vercel Previews):**
```
https://*.vercel.app/*
```

### Verification

After adding restrictions:
1. Test on your website - should work
2. Test from another domain - should be blocked
3. Check Google Cloud Console for usage stats

### Important Notes

- Changes take 1-2 minutes to propagate
- Use wildcards (*) for subdomains
- Include both http:// and https:// for localhost
- Add all Vercel preview URLs with wildcard
- Keep a backup key without restrictions for testing

### Security Best Practices

✅ Restrict to specific domains
✅ Limit to required APIs only
✅ Monitor usage regularly
✅ Rotate keys periodically
✅ Use separate keys for dev/prod

RESTRICTIONSEOF

echo "✅ Created GOOGLE_API_RESTRICTIONS.md"
echo ""

# Create quick restriction script
cat > QUICK_RESTRICT_KEYS.sh << 'QUICKEOF'
#!/bin/bash

# Quick script to show exact restrictions to add

echo "🔒 Google API Key Website Restrictions"
echo ""
echo "Copy these restrictions to Google Cloud Console:"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "HTTP Referrers (Web Sites):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "https://www.spect-it.com/*"
echo "https://spect-it.com/*"
echo "https://spect-it.vercel.app/*"
echo "https://*.vercel.app/*"
echo "http://localhost:3000/*"
echo "http://127.0.0.1:3000/*"
echo "http://localhost/*"
echo "http://127.0.0.1/*"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "API Restrictions (Enable Only):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Places API"
echo "✅ Maps JavaScript API"
echo "✅ Geocoding API"
echo "✅ Distance Matrix API (if used)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Go to: https://console.cloud.google.com/apis/credentials"
echo "Edit your API key → Add restrictions above → Save"
echo ""

QUICKEOF

chmod +x QUICK_RESTRICT_KEYS.sh
echo "✅ Created QUICK_RESTRICT_KEYS.sh"
echo ""

# Summary
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║          ✅ WEBSITE RESTRICTIONS GUIDE READY                    ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "📋 Created:"
echo "   📖 GOOGLE_API_RESTRICTIONS.md - Complete guide"
echo "   🔑 QUICK_RESTRICT_KEYS.sh - Quick reference"
echo ""
echo "🌐 Google Cloud Console opened"
echo ""
echo "📝 Add These Restrictions:"
echo ""
echo "   HTTP Referrers:"
echo "   - https://www.spect-it.com/*"
echo "   - https://spect-it.com/*"
echo "   - https://spect-it.vercel.app/*"
echo "   - https://*.vercel.app/*"
echo "   - http://localhost:3000/*"
echo ""
echo "   API Restrictions:"
echo "   - Places API only"
echo "   - Maps JavaScript API only"
echo "   - Geocoding API only"
echo ""
echo "🔒 This prevents unauthorized use of your API keys!"
echo ""

