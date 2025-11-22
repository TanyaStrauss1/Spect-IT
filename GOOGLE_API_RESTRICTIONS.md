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

4. **Add Each Domain (Copy these exactly):**
   ```
   https://www.spect-it.com/*
   https://spect-it.com/*
   https://spect-it.vercel.app/*
   https://*.vercel.app/*
   http://localhost:3000/*
   http://127.0.0.1:3000/*
   http://localhost/*
   http://127.0.0.1/*
   ```
   
   **Important:** 
   - Include the `/*` at the end of each URL
   - Use `https://` for production domains
   - Use `http://` for localhost
   - The `*.vercel.app` wildcard covers all Vercel preview deployments

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

