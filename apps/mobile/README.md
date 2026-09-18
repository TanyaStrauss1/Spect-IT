# Spect-IT Mobile App

Expo-based mobile application for Spect-IT vision screening (Expo SDK 50).

## Platform Support

This app is configured for both **Android** and **iOS** builds with EAS (Expo Application Services).

- **Android**: See [PLAY_STORE_CHECKLIST.md](./PLAY_STORE_CHECKLIST.md) for Google Play Store submission
- **iOS**: See [APP_STORE_CHECKLIST.md](./APP_STORE_CHECKLIST.md) for Apple App Store submission

### Quick Start (Local Development)
```bash
npm install
npm start
```

### Building for Production
```bash
# Prerequisites
npm install -g eas-cli
eas login

# First-time setup
eas build:configure

# Build production AAB for Android (Google Play Store)
eas build -p android --profile production

# Build production IPA for iOS (Apple App Store)
eas build -p ios --profile production
```

## Configuration

- **Package/Bundle ID**: `com.spectit.app` (both Android and iOS)
- **Version**: `1.0.0`
- **Android versionCode**: `1`
- **iOS buildNumber**: `1`
- **Config**: `app.config.js` (migrated from app.json for dynamic configuration)
- **Build profiles**: `eas.json` (includes both Android and iOS profiles)

## Permissions

### Android
- **CAMERA**: Required for vision test calibration
- **ACCESS_COARSE_LOCATION**: Optional, for finding nearby optical practices

### iOS
- **NSCameraUsageDescription**: Camera access for vision test calibration and face detection
- **NSLocationWhenInUseUsageDescription**: Optional location access for finding nearby optical practices
- **ITSAppUsesNonExemptEncryption**: `false` (uses standard HTTPS only)

## Monorepo Setup

This app is part of a monorepo with workspace dependencies (`@spect-it/cv`). EAS builds handle workspace installation automatically. If you encounter workspace errors during EAS builds, see the troubleshooting sections in:
- [PLAY_STORE_CHECKLIST.md](./PLAY_STORE_CHECKLIST.md#troubleshooting) (Android)
- [APP_STORE_CHECKLIST.md](./APP_STORE_CHECKLIST.md#troubleshooting) (iOS)

## Privacy Policy

https://spect-it.com/privacy

## Important: Screening Disclaimer

Spect-IT provides **screening only**, not medical diagnosis or dispensable prescriptions. All marketing materials, store listings, and in-app messaging must maintain this positioning to comply with medical app regulations.
