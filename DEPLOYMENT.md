# 🚀 Deployment Guide for Spect-IT

This guide will help you deploy Spect-IT to various hosting platforms.

## GitHub Pages (Recommended - Free)

### Step 1: Create GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Name it `spect-it` (or any name you prefer)
3. Make it public (required for free GitHub Pages)
4. Don't initialize with README (we already have one)

### Step 2: Upload Files

```bash
# Navigate to your project directory
cd /path/to/eyetesting

# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Spect-IT vision testing app"

# Add your GitHub repository as remote
git remote add origin https://github.com/TanyaStrauss1/Spect-IT.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** tab
3. Scroll down to **Pages** section
4. Under **Source**, select:
   - Branch: `main` (or `master`)
   - Folder: `/ (root)`
5. Click **Save**
6. Wait 1-2 minutes for GitHub to build your site

### Step 4: Update URLs

✅ **URLs are already configured!** All files have been updated with:
- Username: `TanyaStrauss1`
- Repository: `Spect-IT`

Your site URLs are configured as:
- Main URL: `https://tanyastrauss1.github.io/Spect-IT/`

### Step 5: Access Your Site

Your site will be available at:
```
https://tanyastrauss1.github.io/Spect-IT/
```

## Netlify (Alternative - Free)

### Option 1: Drag & Drop

1. Go to [Netlify](https://netlify.com) and sign up/login
2. Drag and drop your `eyetesting` folder onto Netlify
3. Your site will be live instantly!

### Option 2: Git Integration

1. Connect your GitHub repository to Netlify
2. Netlify will automatically deploy on every push
3. Update URLs in files to match your Netlify domain

## Vercel (Alternative - Free)

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in your project directory
3. Follow the prompts
4. Update URLs accordingly

## Custom Domain (Optional)

### With GitHub Pages:

1. In repository Settings → Pages
2. Add your custom domain under "Custom domain"
3. Follow DNS configuration instructions

### DNS Settings:
- Add a CNAME record pointing to `YOUR_USERNAME.github.io`
- Or add A records pointing to GitHub Pages IPs:
  - 185.199.108.153
  - 185.199.109.153
  - 185.199.110.153
  - 185.199.111.153

## Post-Deployment Checklist

- [ ] Update all URLs in `index.html` with your actual domain
- [ ] Update URLs in `sitemap.xml`
- [ ] Update URLs in `robots.txt`
- [ ] Test all three vision tests
- [ ] Test on mobile device
- [ ] Verify PWA installation works
- [ ] Test social media sharing (Open Graph tags)
- [ ] Submit sitemap to Google Search Console
- [ ] Test accessibility features

## Troubleshooting

### GitHub Pages not updating?
- Clear browser cache
- Wait 5-10 minutes (GitHub Pages can take time)
- Check repository Settings → Pages for errors

### CORS errors with Canvas?
- Make sure you're accessing via HTTP/HTTPS, not `file://`
- Use GitHub Pages or another web server

### PWA not installing?
- Make sure you're accessing via HTTPS
- Check browser console for manifest errors
- Verify `manifest.json` is accessible

## Need Help?

If you encounter issues:
1. Check browser console for errors
2. Verify all files are uploaded correctly
3. Ensure URLs are updated correctly
4. Test locally first before deploying

