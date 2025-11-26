# Fix GitHub Pages and URLs

## Issue

The required URLs are returning 404:
- Privacy Policy: https://tanyastrauss1.github.io/Spect-IT/privacy-policy.html
- Support URL: https://tanyastrauss1.github.io/Spect-IT/

## Solution

### Step 1: Enable GitHub Pages

1. **Go to:** https://github.com/TanyaStrauss1/Spect-IT/settings/pages
2. **Source:** Select "GitHub Actions" or "Deploy from a branch"
3. **Branch:** Select `main` (or your default branch)
4. **Folder:** `/ (root)` or `/docs` if using docs folder
5. **Click "Save"**

### Step 2: Verify Privacy Policy File Exists

The privacy policy file should be at:
- `privacy-policy.html` (in root)
- Or `docs/privacy-policy.html` (if using docs folder)

**If it doesn't exist, create it:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Privacy Policy - Spect-IT</title>
</head>
<body>
    <h1>Privacy Policy</h1>
    <p>Last updated: [Date]</p>
    
    <h2>Information We Collect</h2>
    <p>Spect-IT collects the following information:</p>
    <ul>
        <li>Email addresses (for test results storage)</li>
        <li>Location data (for finding nearby specialists)</li>
        <li>Camera usage (for vision tests)</li>
        <li>Test results (stored locally or in cloud)</li>
    </ul>
    
    <h2>How We Use Your Information</h2>
    <p>We use your information to:</p>
    <ul>
        <li>Provide vision testing services</li>
        <li>Store and display test results</li>
        <li>Find nearby eye care specialists</li>
        <li>Improve our services</li>
    </ul>
    
    <h2>Data Storage</h2>
    <p>All test data is stored securely. We use:</p>
    <ul>
        <li>Local device storage (AsyncStorage)</li>
        <li>Supabase cloud storage (optional)</li>
    </ul>
    
    <h2>Contact Us</h2>
    <p>For questions about this privacy policy, contact:</p>
    <p>Email: tanstrauss@gmail.com</p>
</body>
</html>
```

### Step 3: Verify Repository is Public

1. **Go to:** https://github.com/TanyaStrauss1/Spect-IT/settings
2. **Scroll to "Danger Zone"**
3. **Verify repository is public** (or ensure GitHub Pages works with private repos)

### Step 4: Wait for GitHub Pages to Deploy

- **Deployment time:** 1-5 minutes
- **Check status:** https://github.com/TanyaStrauss1/Spect-IT/actions
- **Verify:** Visit https://tanyastrauss1.github.io/Spect-IT/

### Step 5: Re-verify URLs

After enabling GitHub Pages:

```bash
cd SpectITMobile
./VERIFY_URLS.sh
```

---

## Alternative: Use Different URLs

If GitHub Pages doesn't work, you can:

1. **Use a different hosting service:**
   - Netlify
   - Vercel
   - Your own domain

2. **Update URLs in App Store Connect:**
   - Privacy Policy URL: [Your new URL]
   - Support URL: [Your new URL]

---

## Quick Fix Commands

```bash
# Check if privacy policy exists
ls -la privacy-policy.html

# Create privacy policy if missing
# (Copy content from above)

# Enable GitHub Pages via GitHub web interface
# Then verify:
curl -I https://tanyastrauss1.github.io/Spect-IT/privacy-policy.html
```

---

**Once URLs are accessible, you can proceed with submission!**

