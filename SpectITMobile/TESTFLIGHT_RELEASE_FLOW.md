# Spect-IT iOS TestFlight Release Flow

This is the practical flow to build and submit a TestFlight-ready package from `SpectITMobile/`.

## 1) Preflight checks

```bash
cd SpectITMobile
npx expo-doctor
eas whoami
```

Expected:
- `expo-doctor` should pass or only show non-blocking warnings.
- `eas whoami` should return your Expo account (`tstrauss`).

## 2) Ensure iOS app metadata is correct

In `app.json`:
- `expo.ios.bundleIdentifier` = `com.spectit.app`
- `expo.ios.buildNumber` should be incremented for each new App Store/TestFlight upload.

In App Store Connect:
- Ensure app record exists and bundle identifier matches.

## 3) Configure credentials (interactive; one-time or when certs change)

```bash
cd SpectITMobile
eas build:configure -p ios
eas credentials -p ios
```

If prompted:
- Use **remote credentials** managed by EAS.
- Create or reuse Apple Distribution certificate.
- Create or reuse App Store provisioning profile.

## 4) Build TestFlight package (store profile)

```bash
cd SpectITMobile
eas build --platform ios --profile production
```

Notes:
- This creates an App Store compatible `.ipa` on EAS servers.
- You can monitor the build in the Expo dashboard.

## 5) Submit to TestFlight

Option A: Submit with EAS

```bash
cd SpectITMobile
eas submit --platform ios --profile production
```

Option B: Upload manually in Xcode Transporter (if needed).

## 6) Post-submit checks

- App Store Connect → TestFlight tab
- Wait for processing
- Add internal testers
- Verify build notes and test instructions

## Recommended release cadence

For each iOS release:
1. Commit and push code
2. Increment `expo.ios.buildNumber`
3. Run `eas build --platform ios --profile production`
4. Run `eas submit --platform ios --profile production`

