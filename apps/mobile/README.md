# Spect-IT Mobile App

Expo-based mobile application for Spect-IT vision screening (Expo SDK 50).

## Google Play Store Preparation

This app is configured for Android builds with EAS. See [PLAY_STORE_CHECKLIST.md](./PLAY_STORE_CHECKLIST.md) for complete submission instructions.

### Quick Start (Local Development)
```bash
npm install
npm start
```

### Building for Play Store
```bash
# Prerequisites
npm install -g eas-cli
eas login

# First-time setup
eas build:configure

# Build production AAB
eas build -p android --profile production
```

## Configuration

- **Package**: `com.spectit.app`
- **Version**: `1.0.0` (versionCode: 1)
- **Config**: `app.config.js` (migrated from app.json for dynamic configuration)
- **Build profiles**: `eas.json`

## Permissions

- **CAMERA**: Required for vision test calibration
- **ACCESS_COARSE_LOCATION**: Optional, for finding nearby optical practices

## Monorepo Setup

This app is part of a monorepo with workspace dependencies (`@spect-it/cv`). EAS builds handle workspace installation automatically. If you encounter workspace errors during EAS builds, see the troubleshooting section in [PLAY_STORE_CHECKLIST.md](./PLAY_STORE_CHECKLIST.md).

## Privacy Policy

https://spect-it.com/privacy.html

## Important: Screening Disclaimer

Spect-IT provides **screening only**, not medical diagnosis or dispensable prescriptions. All marketing materials, store listings, and in-app messaging must maintain this positioning to comply with medical app regulations.
