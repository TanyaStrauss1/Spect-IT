# Fix: "Your team has no devices" Error in Xcode

## Problem
When building in Xcode, you get:
```
Your team has no devices from which to generate a provisioning profile.
```

## Solution
**For App Store builds, you DON'T need a physical device!**

## Steps to Fix

### 1. Select Correct Target
- In Xcode top toolbar, select **"Any iOS Device"**
- **NOT** a simulator
- **NOT** a connected device
- This is for App Store distribution

### 2. Use Archive (Not Build)
- **Product → Archive** (for App Store)
- **NOT** Product → Build (requires device for development)

### 3. Configure Signing for Release
1. Click project (blue icon) → Select "SpectIT" target
2. Go to **"Signing & Capabilities"** tab
3. Make sure **"Release"** configuration is selected (top of the tab)
4. ✅ Check **"Automatically manage signing"**
5. Select **Team: UHMT4AX5T7**
6. Wait for green checkmark ✅

### 4. Verify Distribution Certificate
If signing still fails:
1. Go to: https://developer.apple.com/account/
2. **Certificates, Identifiers & Profiles**
3. Verify Team `UHMT4AX5T7` has:
   - ✅ **App Store** distribution certificate
   - ✅ Provisioning profile for `com.spectit.app`

## Why This Happens
- **Development builds** require a device (for testing)
- **App Store builds** (Archive) don't need a device
- Xcode might be trying to create a development profile instead of distribution

## Quick Fix
1. Select **"Any iOS Device"** in toolbar
2. **Product → Archive** (not Build)
3. Xcode will create App Store distribution profile automatically

## Alternative: Use EAS Build
If Xcode continues to have issues:
```bash
cd SpectITMobile
eas build --platform ios --profile production
```
EAS handles all signing automatically and doesn't require device setup.

