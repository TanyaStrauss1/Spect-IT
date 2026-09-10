# Spect-IT Monorepo

Advanced Professional Eye Testing Platform with AI-powered vision assessments.

## 🏗️ Monorepo Structure

```
spect-it/
├── apps/
│   ├── web/           → Next.js 15 (Vision tests + Marketplace + Dashboard)
│   └── mobile/        → Expo React Native (iOS + Android Vision Tests)
│
├── packages/
│   ├── ui/            → Shared UI component library (shadcn/ui + NativeBase)
│   ├── cv/            → Computer vision + LiDAR utilities
│   ├── api/           → Supabase edge functions
│   └── models/        → ML models (TensorFlow.js + ONNX)
│
└── turbo.json         → Turborepo configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- Expo CLI (for mobile development)
- Supabase account (for backend)

### Environment Setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com)

2. **Set up environment variables:**

```bash
# Copy the example files
cp .env.example .env.local
cp apps/web/.env.example apps/web/.env.local
cp apps/mobile/.env.example apps/mobile/.env

# Edit .env.local files and add your Supabase credentials:
# - NEXT_PUBLIC_SUPABASE_URL (from Supabase project settings)
# - NEXT_PUBLIC_SUPABASE_ANON_KEY (from Supabase project API settings)
# - EXPO_PUBLIC_SUPABASE_URL (same URL for mobile)
# - EXPO_PUBLIC_SUPABASE_ANON_KEY (same key for mobile)
```

3. **Run Supabase migrations:**

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

Alternatively, run the SQL migrations manually in your Supabase dashboard:
- Go to SQL Editor in Supabase dashboard
- Run the migrations in `supabase/migrations/` in order

### Installation

```bash
# Install all dependencies
npm install

# Or install for specific workspaces
npm install --workspace=apps/web
npm install --workspace=apps/mobile
```

## 📱 Development

### Web App (Next.js 15)

```bash
# Navigate to web app
cd apps/web

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

The web app will be available at `http://localhost:3000`

**Features:**
- Supabase authentication (sign up / sign in / sign out)
- Visual Acuity test (Snellen chart)
- User dashboard with test history
- Results saved to Supabase

### Mobile App (Expo React Native)

```bash
# Navigate to mobile app
cd apps/mobile

# Start Expo development server
npm run start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android
```

**Features:**
- Supabase authentication
- Visual Acuity test
- User dashboard with test history
- Syncs with same Supabase backend as web

**Note:** You'll need to scan the QR code with Expo Go app (iOS/Android) or run on a simulator/emulator.

### All Apps

```bash
# From root directory
# Run all apps in development mode (from root)
npm run dev

# Build all apps
npm run build

# Lint all packages
npm run lint
```

## 📦 Packages

### `packages/ui`
Shared UI component library using shadcn/ui for web and NativeBase for mobile.

### `packages/cv`
Computer vision utilities including LiDAR distance measurement, face detection, and eye tracking.

### `packages/api`
Shared API functions for interacting with Supabase:
- `saveTestResult()` - Save test results
- `getTestResults()` - Fetch user test results with filters
- `getUserStats()` - Get user statistics

### `packages/models`
ML models and scoring algorithms for vision testing, including TensorFlow.js and ONNX models.

## 🔧 Tech Stack

- **Web**: Next.js 15, React, TypeScript, Tailwind CSS, shadcn/ui
- **Mobile**: Expo, React Native, TypeScript, NativeBase
- **Backend**: Supabase (PostgreSQL, Edge Functions, Auth)
- **AI/ML**: TensorFlow.js, ONNX, MediaPipe, Face Landmarks Detection
- **Build System**: Turborepo, npm workspaces

## 📄 License

© 2025 Spect-IT. All rights reserved.
