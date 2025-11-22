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

### Installation

```bash
# Install all dependencies
npm install

# Install dependencies for a specific workspace
npm install --workspace=apps/web
npm install --workspace=apps/mobile
```

## 📱 Development

### Web App (Next.js 15)

```bash
# Start development server
npm run web:dev

# Build for production
npm run web:build
```

### Mobile App (Expo React Native)

```bash
# Start Expo development server
npm run mobile:dev

# Build for iOS/Android
npm run mobile:build
```

### All Apps

```bash
# Run all apps in development mode
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
Supabase edge functions for backend API endpoints.

### `packages/models`
ML models for vision testing, including TensorFlow.js and ONNX models.

## 🔧 Tech Stack

- **Web**: Next.js 15, React, TypeScript, Tailwind CSS, shadcn/ui
- **Mobile**: Expo, React Native, TypeScript, NativeBase
- **Backend**: Supabase (PostgreSQL, Edge Functions, Auth)
- **AI/ML**: TensorFlow.js, ONNX, MediaPipe, Face Landmarks Detection
- **Build System**: Turborepo, npm workspaces

## 📄 License

© 2025 Spect-IT. All rights reserved.
