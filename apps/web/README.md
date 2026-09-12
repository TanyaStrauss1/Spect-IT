# Spect-IT Web Application

**Production Next.js 15 application for spect-it.com**

## Overview

This is the primary web interface for Spect-IT vision screening platform. It provides:

- **Six Clinical Screening Tests:**
  - Visual Acuity (Sloan optotypes, ETDRS protocol, logMAR scoring)
  - Color Vision (confusion-line pseudoisochromatic plates)
  - Contrast Sensitivity (low-contrast optotypes, logCS)
  - Astigmatism (radial fan, clock dial)
  - Visual Field (Amsler grid)
  - Refractive Screening (sphere/cylinder estimates, NOT dispensable)

- **User Features:**
  - Supabase authentication (email/password)
  - Personal dashboard with test history
  - Longitudinal trends with change detection (≥0.1 logMAR)
  - Clinical summary page with PDF export
  - Screen calibration (pixels/mm, viewing distance)
  - Guided test journey with progress tracking

## Development

```bash
cd apps/web

# Install dependencies
npm install

# Start development server
npm run dev
# → http://localhost:3000

# Build for production
npm run build

# Start production server
npm run start
```

## Environment Variables

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Get these from your Supabase project settings → API.

## Deployment

This app is deployed to Vercel. The live production site is at **spect-it.com**.

To deploy manually:

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS, shadcn/ui components
- **Backend:** Supabase (PostgreSQL, Auth, Edge Functions)
- **Charts:** Recharts (for longitudinal trends)
- **Computer Vision:** @spect-it/cv package (Sloan optotypes, pseudoisochromatic plates)

## Key Features

### Calibration
- Physical screen calibration using credit card reference
- Viewing distance measurement (recommend 40-60cm)
- Stored in localStorage, expires after 30 days

### Test Methodology
- **Acuity:** ETDRS chart, 5 letters per line, 0.1 logMAR steps, letter-by-letter scoring
- **Color:** Confusion-line plates (NOT Ishihara), control plates mark unreliable tests as "inconclusive"
- **Contrast:** Pelli-Robson-inspired low-contrast letters
- **Others:** Standard optometric screening protocols

### Data & Privacy
- All test results saved to Supabase `test_results` table
- User-scoped via RLS policies
- No identifiable patient data collected beyond email
- Results are screening estimates, NOT clinical diagnoses or dispensable prescriptions

## Important Notes

⚠️ **This is NOT a medical device.** Results are screening estimates for informational use only. Users must consult licensed eye care professionals for clinical decisions, prescriptions, and eyewear.

⚠️ **This is the production path.** The `website/` directory is deprecated legacy code. Do NOT expand or deploy from `website/`.
