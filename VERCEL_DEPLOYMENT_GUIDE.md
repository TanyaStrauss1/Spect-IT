# 🚀 Vercel Deployment Guide - Spect-IT Website

## 📋 Pre-Deployment Checklist

- [x] All code committed to GitHub
- [x] Website improvements ready
- [ ] Vercel account connected
- [ ] Environment variables set
- [ ] Domain configured

---

## 🔧 Step 1: Connect GitHub Repository to Vercel

### Option A: Via Vercel Dashboard

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Sign in with your GitHub account

2. **Import Project**
   - Click "Add New..." → "Project"
   - Select "Import Git Repository"
   - Choose `TanyaStrauss1/Spect-IT`

3. **Configure Project**
   - **Framework Preset**: Next.js (or your framework)
   - **Root Directory**: `./` (or your website folder)
   - **Build Command**: (auto-detected)
   - **Output Directory**: `.next` (for Next.js) or `dist` (for static)

4. **Environment Variables**
   - Add the following variables:
     ```
     GOOGLE_PLACES_API_KEY=your_google_places_api_key
     GOOGLE_MAPS_API_KEY=your_google_maps_api_key
     NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=your_google_places_api_key
     NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
     ```

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete

---

### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
cd /Users/tanyastrauss/Spect-IT
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? spect-it
# - Directory? ./
# - Override settings? No
```

---

## 🌐 Step 2: Configure Domain

### Connect Custom Domain

1. **In Vercel Dashboard**
   - Go to your project
   - Click "Settings" → "Domains"
   - Add domain: `spect-it.com`
   - Add domain: `www.spect-it.com`

2. **Update DNS Records**
   - Go to your domain registrar
   - Add DNS records:
     ```
     Type: A
     Name: @
     Value: 76.76.21.21
     
     Type: CNAME
     Name: www
     Value: cname.vercel-dns.com
     ```

3. **Wait for DNS Propagation**
   - Usually takes 24-48 hours
   - Check status in Vercel dashboard

---

## 🔑 Step 3: Set Environment Variables

### Required Environment Variables

```bash
# Google Maps API Keys
GOOGLE_PLACES_API_KEY=your_places_api_key
GOOGLE_MAPS_API_KEY=your_maps_api_key

# For Next.js (if using)
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=your_places_api_key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_maps_api_key

# Optional: Analytics
NEXT_PUBLIC_GA_ID=your_google_analytics_id
```

### How to Add in Vercel

1. Go to Project Settings
2. Click "Environment Variables"
3. Add each variable
4. Select environments (Production, Preview, Development)
5. Click "Save"

---

## 📝 Step 4: Create vercel.json (if needed)

If your project needs specific configuration:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/$1"
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
  ]
}
```

---

## 🎯 Step 5: Implement Website Changes

### Files to Update on Your Website

Based on the improvements created, you need to:

1. **Currency Conversion (ZAR)**
   - Copy code from `WEBSITE_IMPLEMENTATION_CODE.md`
   - Update all price displays
   - Add VAT calculation

2. **Real Products**
   - Copy code from `WEBSITE_SHOP_REAL_PRODUCTS.md`
   - Implement product scraper
   - Add shopping cart

3. **Location Services**
   - Copy code from `WEBSITE_REAL_PRODUCTS_WEB_SCRAPING.md`
   - Add geolocation API
   - Implement specialist finder

4. **Virtual Try-On**
   - Copy code from `WEBSITE_VIRTUAL_TRYON_IMPROVEMENT.md`
   - Add MediaPipe Face Mesh
   - Implement auto eye detection

---

## 🔄 Step 6: Continuous Deployment

### Automatic Deployments

Vercel automatically deploys when you push to GitHub:

1. **Push to main branch** → Production deployment
2. **Push to other branches** → Preview deployment
3. **Pull requests** → Preview deployment

### Manual Deployment

```bash
# Deploy to production
vercel --prod

# Deploy preview
vercel
```

---

## 📊 Step 7: Monitor Deployments

### Check Deployment Status

1. Go to Vercel Dashboard
2. Click on your project
3. View "Deployments" tab
4. Check build logs for errors

### Common Issues

**Build Fails:**
- Check build logs
- Verify environment variables
- Check Node.js version
- Verify dependencies

**Environment Variables Not Working:**
- Ensure variables are set in Vercel dashboard
- Restart deployment after adding variables
- Check variable names match code

---

## 🚀 Quick Deploy Commands

```bash
# First time setup
vercel login
vercel

# Production deploy
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs

# Remove deployment
vercel rm
```

---

## ✅ Post-Deployment Checklist

- [ ] Website loads correctly
- [ ] All pages accessible
- [ ] Currency displays in ZAR
- [ ] Products load from web
- [ ] Location services work
- [ ] Virtual try-on works
- [ ] Specialist finder works
- [ ] Mobile responsive
- [ ] SSL certificate active
- [ ] Domain redirects correctly

---

## 🔧 Troubleshooting

### Build Errors

```bash
# Check build logs in Vercel dashboard
# Common fixes:
- Update Node.js version in package.json
- Check for missing dependencies
- Verify build command
```

### Environment Variables

```bash
# Verify variables are set
vercel env ls

# Add variable
vercel env add VARIABLE_NAME
```

### Domain Issues

```bash
# Check DNS
nslookup spect-it.com

# Verify in Vercel
# Settings → Domains → Check status
```

---

## 📚 Resources

- **Vercel Docs**: https://vercel.com/docs
- **GitHub Integration**: https://vercel.com/docs/concepts/git
- **Environment Variables**: https://vercel.com/docs/concepts/projects/environment-variables
- **Custom Domains**: https://vercel.com/docs/concepts/projects/domains

---

## 🎉 Deployment Complete!

Once deployed, your website will be live at:
- **Production**: https://www.spect-it.com
- **Preview**: https://spect-it-*.vercel.app

All improvements are now live! 🚀

