# Quick Deploy to Vercel

## Option 1: Use the Deploy Script (Easiest)

```bash
cd /Users/tanyastrauss/Spect-IT
./DEPLOY_NOW.sh
```

## Option 2: Manual Deploy via CLI

```bash
cd /Users/tanyastrauss/Spect-IT/apps/web

# Install dependencies
npm install

# Build the app
npm run build

# Deploy to Vercel
vercel --prod
```

## Option 3: Connect GitHub for Auto-Deploy (Recommended)

1. Go to https://vercel.com/dashboard
2. Click "Add New Project"
3. Import: `TanyaStrauss1/Spect-IT`
4. Configure:
   - **Framework:** Next.js
   - **Root Directory:** `apps/web`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`
   - **Install Command:** `npm install`
5. Click "Deploy"

After connecting, every push to `main` will auto-deploy!

## Current Status

✅ Vercel CLI installed and configured
✅ Configuration files ready
✅ Build scripts set up

## Next Steps

Run `./DEPLOY_NOW.sh` or follow Option 3 above for auto-deploy.
