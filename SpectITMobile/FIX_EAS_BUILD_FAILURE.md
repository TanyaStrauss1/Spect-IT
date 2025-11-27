# 🔧 Fix: EAS Build Failure

## ❌ Build Failed

Here's how to fix common EAS build failures.

## 🔍 Step 1: Check Build Logs

**Get the exact error:**

1. **Via Terminal:**
   ```bash
   cd /Users/tanyastrauss/Spect-IT/SpectITMobile
   eas build:list --platform ios --limit 1
   ```

2. **Via Web:**
   - https://expo.dev/accounts/spect-it/projects/spectit-mobile/builds
   - Click on the failed build
   - View logs for exact error

## 🚀 Common Fixes

### Fix 1: Credentials Not Configured

**If error mentions "credentials" or "signing":**

**Configure credentials:**
1. Go to: https://expo.dev/accounts/spect-it/settings/credentials
2. Click **"iOS"** tab
3. Click **"Set up credentials"** or **"Manage credentials"**
4. Enter:
   - Apple ID: `tanstrauss@gmail.com`
   - Password: (app-specific password if 2FA)
   - Team: P7BPRR2MY3
   - Bundle ID: com.spectit.app

**Or via Terminal:**
```bash
eas credentials
# Select: iOS
# Select: production
# Follow prompts
```

### Fix 2: App-Specific Password Required

**If error mentions "invalid password" or "2FA":**

1. **Get app-specific password:**
   - https://appleid.apple.com/account/manage
   - Security → App-Specific Passwords
   - Generate password → Name: "EAS Build"
   - Copy password (xxxx-xxxx-xxxx-xxxx)

2. **Update credentials:**
   - https://expo.dev/accounts/spect-it/settings/credentials
   - iOS → Update credentials
   - Use app-specific password (NOT regular password)

### Fix 3: Bundle ID Mismatch

**If error mentions "bundle identifier":**

**Verify Bundle ID:**
- Should be: `com.spectit.app`
- Check: `app.json` → `ios.bundleIdentifier`
- Check: App Store Connect app settings

### Fix 4: Team ID Mismatch

**If error mentions "team" or "provisioning":**

**Verify Team ID:**
- Should be: `P7BPRR2MY3`
- Check: App Store Connect → App Information → Team
- Update credentials if different

### Fix 5: Missing Dependencies

**If error mentions "module not found" or "dependency":**

**Reinstall dependencies:**
```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
rm -rf node_modules
npm install --legacy-peer-deps
```

### Fix 6: Build Configuration Error

**If error mentions "build configuration":**

**Check eas.json:**
- Profile: `production`
- Distribution: `store`
- Platform: `ios`

**Current configuration looks correct** ✅

## 📋 Diagnostic Steps

### Step 1: Check Build Status

```bash
eas build:list --platform ios --limit 1
```

### Step 2: View Build Logs

**Via Web:**
- https://expo.dev/accounts/spect-it/projects/spectit-mobile/builds
- Click failed build → View logs

**Look for:**
- Red error messages
- First error in the log
- Error code (if any)

### Step 3: Verify Credentials

```bash
eas credentials
# Select: iOS
# Select: production
# Check current credentials
```

### Step 4: Verify Configuration

**Check app.json:**
- Bundle ID: `com.spectit.app` ✅
- Version: `1.0.0` ✅
- Build Number: `1` ✅

**Check eas.json:**
- Profile: `production` ✅
- Distribution: `store` ✅

## 🔧 Quick Fixes

### Fix 1: Reconfigure Credentials

```bash
eas credentials
# Select: iOS
# Select: production
# Choose: "Set up new credentials"
# Enter Apple ID and password
```

### Fix 2: Clean and Rebuild

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
rm -rf node_modules
npm install --legacy-peer-deps
eas build --platform ios --profile production --clear-cache
```

### Fix 3: Check Apple Developer Account

**Verify:**
1. Apple Developer account is active
2. Team P7BPRR2MY3 has App Store access
3. App ID `com.spectit.app` is registered
4. Distribution certificate exists

## 💡 Most Common Issues

1. **Credentials Not Set (40%)**
   - Fix: Configure at https://expo.dev/accounts/spect-it/settings/credentials

2. **Wrong Password (30%)**
   - Fix: Use app-specific password if 2FA enabled

3. **Bundle ID Mismatch (15%)**
   - Fix: Verify Bundle ID matches everywhere

4. **Team ID Mismatch (10%)**
   - Fix: Verify Team ID in credentials

5. **Build Configuration (5%)**
   - Fix: Check eas.json configuration

## 📝 What to Share

**To get targeted help, share:**
1. **Exact error message** from build logs
2. **Error code** (if any)
3. **Which step failed:**
   - Credentials setup
   - Build start
   - During build
   - Upload

## 🔗 Important Links

- **Build Dashboard:** https://expo.dev/accounts/spect-it/projects/spectit-mobile/builds
- **Credentials:** https://expo.dev/accounts/spect-it/settings/credentials
- **App Store Connect:** https://appstoreconnect.apple.com/apps/6755681856

---

**Check the build logs and share the exact error message for a targeted fix!** 🔍

