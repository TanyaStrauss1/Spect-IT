# 🔒 Protect Your Google Maps API Key

## 📋 Quick Setup Guide

### Step 1: Go to Google Cloud Console

1. Visit: https://console.cloud.google.com/apis/credentials
2. Find your API key: `AIzaSyCCEQr9H_OwLccYjDNoTTH_u9cFymPXa08`
3. Click on the key name to edit

---

## 🔒 Application Restrictions

### Select: **"HTTP referrers (web sites)"**

This restricts the key to only work on your website domains.

### Add These Referrers:

```
https://www.spect-it.com/*
https://spect-it.com/*
https://spect-it-app1.vercel.app/*
https://*.vercel.app/*
http://localhost:*
```

**How to add:**
1. Click "ADD AN ITEM"
2. Paste each referrer URL
3. Use `*` wildcard to allow all paths on that domain

---

## 🔑 API Restrictions

### Select: **"Restrict key"**

Then check ONLY these APIs:

- ✅ **Places API** (for finding locations)
- ✅ **Maps JavaScript API** (for displaying maps)
- ✅ **Directions API** (for getting directions)
- ✅ **Geocoding API** (optional, for address lookup)

**Why restrict?**
- Prevents unauthorized API usage
- Reduces risk of quota abuse
- Limits access to only what you need

---

## 📝 Complete Settings Summary

### Application Restrictions:
```
Type: HTTP referrers (web sites)
Referrers:
  - https://www.spect-it.com/*
  - https://spect-it.com/*
  - https://*.vercel.app/*
  - http://localhost:*
```

### API Restrictions:
```
Restrict key: ✅ Yes
Allowed APIs:
  - Places API
  - Maps JavaScript API
  - Directions API
  - Geocoding API (optional)
```

---

## ✅ After Saving

1. **Wait 2-5 minutes** for changes to propagate
2. **Test your website** to ensure maps still work
3. **Check browser console** for any API errors

---

## ⚠️ Important Notes

- **Wildcards (`*`)** allow all subdomains and paths
- **No wildcard** = exact match only
- **Changes take effect** within a few minutes
- **Keep your key secure** - don't commit to public repos

---

## 🆘 Troubleshooting

### If maps stop working after restrictions:

1. Check browser console for errors
2. Verify referrer URLs match exactly (including `https://`)
3. Ensure APIs are enabled in your project
4. Wait a few minutes for changes to propagate

### Common Issues:

- **"RefererNotAllowedMapError"** → Add the exact domain to referrers
- **"ApiNotActivatedMapError"** → Enable the API in Google Cloud Console
- **"RefererNotAllowedMapError"** → Check for `http://` vs `https://` mismatch

---

## 🔗 Useful Links

- API Credentials: https://console.cloud.google.com/apis/credentials
- Enable APIs: https://console.cloud.google.com/apis/library
- API Key Best Practices: https://developers.google.com/maps/api-security-best-practices

---

**Your API key is now protected!** 🔒

