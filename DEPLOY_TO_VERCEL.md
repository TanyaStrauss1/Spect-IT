# Deploy Spect-IT to Vercel

## Option 1: Deploy via Vercel CLI (Recommended)

```bash
# Install Vercel CLI globally (if not already installed)
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from root directory
cd /Users/tanyastrauss/Spect-IT
vercel

# For production deployment
vercel --prod
```

## Option 2: Connect GitHub Repository (Auto-Deploy)

1. Go to https://vercel.com
2. Click "Add New Project"
3. Import your GitHub repository: `TanyaStrauss1/Spect-IT`
4. Configure:
   - **Framework Preset:** Next.js
   - **Root Directory:** `apps/web`
   - **Build Command:** `cd ../.. && npm run build`
   - **Output Directory:** `.next`
   - **Install Command:** `cd ../.. && npm install`
5. Add Environment Variables (if needed):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Click "Deploy"

## Option 3: Deploy via Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Click "Add New Project"
3. Import from GitHub: `TanyaStrauss1/Spect-IT`
4. Configure settings as above
5. Deploy

## Current Configuration

- **Framework:** Next.js 15
- **Root Directory:** `apps/web`
- **Build Command:** `cd ../.. && npm run build`
- **Output Directory:** `.next`

## Environment Variables Needed

If using Supabase:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## After Deployment

Your site will be available at:
- Preview: `https://spect-it-*.vercel.app`
- Production: `https://spect-it.vercel.app` (or your custom domain)

