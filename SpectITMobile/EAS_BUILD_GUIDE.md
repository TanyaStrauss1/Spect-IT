# 🚀 Build with EAS (Expo Application Services)

## ✅ Why EAS Build is Better

**EAS Build is much easier than Xcode Cloud for Expo apps:**

- ✅ **No Xcode needed** - Builds in cloud
- ✅ **Automatic signing** - Handles certificates and provisioning
- ✅ **No device registration** - Works out of the box
- ✅ **Faster setup** - Just configure credentials once
- ✅ **Automatic upload** - Uploads to App Store Connect
- ✅ **Better for Expo** - Designed for React Native/Expo apps

## 🚀 Quick Start

### Step 1: Configure Credentials

**Option A: Via Web (Easiest)**
1. Go to: https://expo.dev/accounts/spect-it/settings/credentials
2. Click **"iOS"** tab
3. Click **"Set up credentials"** or **"Manage credentials"**
4. Follow the wizard:
   - Apple ID: `tanstrauss@gmail.com`
   - Password: (use app-specific password if 2FA enabled)
   - Team: P7BPRR2MY3
   - Bundle ID: com.spectit.app

**Option B: Via Terminal**
```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
eas credentials
# Select: iOS
# Select: production
# Follow prompts
```

### Step 2: Build

**Run the build script:**
```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
./BUILD_WITH_EAS_NOW.sh
```

**Or manually:**
```bash
eas build --platform ios --profile production
```

### Step 3: Monitor Build

**Check progress:**
- Terminal shows live progress
- Or: https://expo.dev/accounts/spect-it/projects/spectit-mobile/builds

**Build time:** 15-30 minutes

## 📋 Configuration Details

**Current EAS Configuration:**
- **Project ID:** 8479efbf-f284-4b6f-a6f5-66eceee62c92
- **Bundle ID:** com.spectit.app
- **Team ID:** P7BPRR2MY3
- **Profile:** production
- **Distribution:** App Store

**File:** `eas.json` ✅

## 🔐 Credentials Setup

### Get App-Specific Password (If 2FA Enabled)

1. **Go to:** https://appleid.apple.com/account/manage
2. **Security** → **App-Specific Passwords**
3. **Generate Password** → Name it "EAS Build"
4. **Copy password** (xxxx-xxxx-xxxx-xxxx format)
5. **Use this password** when prompted (NOT your regular password)

### Configure in Expo

**Via Web:**
- https://expo.dev/accounts/spect-it/settings/credentials
- Click **"iOS"** → **"Set up credentials"**
- Enter Apple ID and app-specific password

**Via Terminal:**
```bash
eas credentials
# Select iOS → production
# Enter credentials
```

## 🚀 Build Commands

### Build for App Store
```bash
eas build --platform ios --profile production
```

### Build for TestFlight
```bash
eas build --platform ios --profile production
# Same command - automatically goes to TestFlight
```

### Submit to App Store
```bash
eas submit --platform ios --latest
```

## 📱 After Build Completes

1. **Build completes** → Automatically uploads to App Store Connect
2. **Check App Store Connect:**
   - https://appstoreconnect.apple.com
   - My Apps → Spect-IT → TestFlight or App Store
3. **Submit for review:**
   - Select the build
   - Complete app information
   - Submit

## 🔍 Monitor Builds

**Expo Dashboard:**
- https://expo.dev/accounts/spect-it/projects/spectit-mobile/builds

**App Store Connect:**
- https://appstoreconnect.apple.com/apps/6755681856

## ✅ Advantages Over Xcode Cloud

1. **Easier Setup:**
   - Just configure credentials once
   - No workflow creation needed
   - No pre-build script issues

2. **Better for Expo:**
   - Designed for React Native/Expo
   - Handles Expo-specific configurations
   - Automatic dependency management

3. **More Reliable:**
   - Fewer signing issues
   - Better error messages
   - Automatic retry on failures

4. **Faster:**
   - Optimized for React Native builds
   - Parallel builds available
   - Better caching

## 💡 Quick Commands

```bash
# Check if logged in
eas whoami

# Configure credentials
eas credentials

# Build iOS
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios --latest

# View builds
# https://expo.dev/accounts/spect-it/projects/spectit-mobile/builds
```

## 🔗 Important Links

- **EAS Credentials:** https://expo.dev/accounts/spect-it/settings/credentials
- **Build Dashboard:** https://expo.dev/accounts/spect-it/projects/spectit-mobile/builds
- **App Store Connect:** https://appstoreconnect.apple.com/apps/6755681856

---

**EAS Build is the recommended way to build your Expo app! Configure credentials and start building!** 🚀

