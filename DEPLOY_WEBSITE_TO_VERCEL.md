# Deploy Website to Vercel

## Quick Deploy

The `website/` folder contains the superior build with emojis and location functionality.

### Option 1: Vercel Dashboard (Recommended)

1. Go to: https://vercel.com/dashboard
2. Click "Add New Project"
3. Import from GitHub: `TanyaStrauss1/Spect-IT`
4. Configure:
   - **Root Directory**: `website`
   - **Framework Preset**: Other
   - **Build Command**: (leave empty)
   - **Output Directory**: `.`
5. Click "Deploy"

### Option 2: Vercel CLI

```bash
cd website
vercel --prod
```

### Option 3: GitHub Integration

If Vercel is connected to your GitHub repo:
1. Set Root Directory to `website` in project settings
2. Push changes (already done)
3. Vercel will auto-deploy

## Configuration

The `website/vercel.json` is configured for static deployment.

## Environment Variables

Add these in Vercel Dashboard → Settings → Environment Variables:
- `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`

