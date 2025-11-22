# Vercel Monorepo Deployment Setup

## The Issue

Vercel needs to know the root directory of your Next.js app in a monorepo. The CLI deployment is having issues with workspace dependencies.

## Solution: Use Vercel Dashboard (Recommended)

### Step 1: Go to Vercel Dashboard
1. Visit https://vercel.com/dashboard
2. Click "Add New Project"
3. Import your GitHub repository: `TanyaStrauss1/Spect-IT`

### Step 2: Configure Project Settings

**Framework Preset:** Next.js

**Root Directory:** `apps/web`

**Build Command:** 
```bash
cd ../.. && npm install && cd apps/web && npm run build
```

**Output Directory:** `.next`

**Install Command:**
```bash
cd ../.. && npm install
```

**Development Command:**
```bash
cd ../.. && npm run dev --filter=web
```

### Step 3: Environment Variables (if needed)
Add any environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Step 4: Deploy
Click "Deploy" and Vercel will:
1. Install dependencies from root
2. Build the Next.js app in `apps/web`
3. Deploy to production

## Alternative: Fix Workspace Dependencies

If you want to use CLI, you need to ensure workspace dependencies are resolved. The issue is that `workspace:*` protocol requires npm workspaces to be properly set up.

### Option A: Use pnpm (Better for monorepos)
1. Create `pnpm-workspace.yaml`:
```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

2. Update `package.json` to remove `workspaces` field
3. Use pnpm in Vercel settings

### Option B: Use file: protocol
Replace `workspace:*` with `file:../../packages/ui` etc. in package.json

## Current Status

✅ All code pushed to GitHub
✅ Vercel configuration files created
⚠️ Need to set Root Directory in Vercel dashboard

## Next Steps

1. **Go to Vercel Dashboard** and import the project
2. **Set Root Directory to `apps/web`**
3. **Deploy!**

After the first deployment, all future pushes to `main` will auto-deploy.

