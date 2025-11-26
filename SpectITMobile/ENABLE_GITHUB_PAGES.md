# Enable GitHub Pages for Spect-IT

## Issue: "There isn't a GitHub Pages site here"

GitHub Pages needs to be enabled in your repository settings.

## Step-by-Step: Enable GitHub Pages

### Step 1: Go to Repository Settings

1. **Open:** https://github.com/TanyaStrauss1/Spect-IT/settings/pages
   - (Page should be opening automatically)

2. **Under "Source" section:**
   - You'll see options for deploying GitHub Pages

### Step 2: Select Deployment Source

**Option 1: GitHub Actions (Recommended)**
- Select **"GitHub Actions"** as the source
- This uses the workflow file: `.github/workflows/pages.yml`
- Automatically deploys from `public/` directory
- Deploys on every push to `main` branch

**Option 2: Deploy from a branch (Alternative)**
- Select **"Deploy from a branch"**
- Branch: `main`
- Folder: `/ (root)` or `/public`
- Click "Save"

### Step 3: Save Settings

1. Click **"Save"** button
2. Wait 1-2 minutes for initial deployment
3. You'll see a green checkmark when deployment completes

### Step 4: Verify Deployment

**Your GitHub Pages URLs will be:**
- **Main site:** https://tanyastrauss1.github.io/Spect-IT/
- **Privacy Policy:** https://tanyastrauss1.github.io/Spect-IT/privacy-policy.html
- **Index page:** https://tanyastrauss1.github.io/Spect-IT/index.html

### Step 5: Use in App Store Connect

**Privacy Policy URL:**
```
https://tanyastrauss1.github.io/Spect-IT/privacy-policy.html
```

**Support URL:**
```
https://tanyastrauss1.github.io/Spect-IT/
```

## Current Configuration

✅ **Workflow file exists:** `.github/workflows/pages.yml`
✅ **Public directory exists:** `public/`
✅ **Privacy policy exists:** `public/privacy-policy.html`
✅ **Index page exists:** `public/index.html`

**Workflow configuration:**
- Deploys from: `public/` directory
- Triggers on: Push to `main` branch
- Uses: GitHub Actions

## Troubleshooting

### Pages Not Deploying

1. **Check Actions tab:**
   - Go to: https://github.com/TanyaStrauss1/Spect-IT/actions
   - Look for "Deploy to GitHub Pages" workflow
   - Check if it's running or failed

2. **Verify workflow file:**
   - File should exist: `.github/workflows/pages.yml`
   - Should have `path: 'public'`

3. **Check public directory:**
   - Files should be in `public/` directory
   - At minimum: `privacy-policy.html` and `index.html`

### Site Still Not Available

1. **Wait 2-5 minutes** after enabling
2. **Check Actions tab** for deployment status
3. **Verify files in public/** directory
4. **Try accessing URL directly:**
   - https://tanyastrauss1.github.io/Spect-IT/privacy-policy.html

### Custom Domain (Optional)

If you want to use `www.spect-it.com`:

1. **In GitHub Pages settings:**
   - Add custom domain: `www.spect-it.com`

2. **In your domain DNS:**
   - Add CNAME record pointing to: `tanyastrauss1.github.io`

3. **Wait for DNS propagation** (up to 24 hours)

## Quick Checklist

- [ ] Go to repository settings → Pages
- [ ] Select "GitHub Actions" as source
- [ ] Click "Save"
- [ ] Wait 1-2 minutes
- [ ] Verify site is accessible
- [ ] Use URLs in App Store Connect

## After Enabling

**Test the URLs:**
- https://tanyastrauss1.github.io/Spect-IT/privacy-policy.html
- https://tanyastrauss1.github.io/Spect-IT/

**Use in App Store Connect:**
- Privacy Policy URL: https://tanyastrauss1.github.io/Spect-IT/privacy-policy.html
- Support URL: https://tanyastrauss1.github.io/Spect-IT/

---

**Enable GitHub Pages in settings, then use the URLs in App Store Connect!**

