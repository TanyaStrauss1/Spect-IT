# 🚀 Manual Build Instructions

The build process requires interactive input for Apple credentials. Run these commands in your terminal:

## Step 1: Navigate to Project

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
```

## Step 2: Build iOS App

```bash
eas build --platform ios --profile production
```

**When prompted:**
1. **"Do you want to log in to your Apple account?"** → Type: `y` (yes)
2. **Apple ID:** → Type: `tanstrauss@gmail.com`
3. **Password:** → Enter your Apple ID password
4. **2FA Code (if enabled):** → Enter the code from your device

**⏱️ Build takes 15-30 minutes**

## Step 3: Monitor Build Progress

While building, you can monitor progress at:
- https://expo.dev/accounts/tstrauss/projects/spectit-mobile/builds

## Step 4: Submit to App Store Connect

After build completes successfully:

```bash
eas submit --platform ios --latest
```

**When prompted:**
- Apple ID: `tanstrauss@gmail.com`
- Password: [Your Apple ID password]
- 2FA Code: [If enabled]

## Step 5: Complete App Listing

1. Go to: https://appstoreconnect.apple.com/apps/6755681856/distribution/ios/version/inflight
2. Select the uploaded build
3. Complete all required information
4. Submit for review

---

## Alternative: Run Script with Input

You can also run the script and provide input when prompted:

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
./BUILD_AND_SUBMIT_NOW.sh
```

Press Enter when prompted, then provide Apple credentials when asked.

---

## Quick Commands Summary

```bash
# Navigate
cd /Users/tanyastrauss/Spect-IT/SpectITMobile

# Build
eas build --platform ios --profile production

# Submit (after build completes)
eas submit --platform ios --latest
```

