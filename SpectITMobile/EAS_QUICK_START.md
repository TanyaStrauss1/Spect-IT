# ⚡ EAS Build - Quick Start

## ✅ You're Logged In!

You're already logged into EAS as: **tstrauss** and **spect-it**

## 🚀 Build Your App Now

### Step 1: Configure Credentials (One Time)

**Via Web (Easiest):**
1. Go to: https://expo.dev/accounts/spect-it/settings/credentials
2. Click **"iOS"** tab
3. Click **"Set up credentials"** or **"Manage credentials"**
4. Enter:
   - **Apple ID:** `tanstrauss@gmail.com`
   - **Password:** (use app-specific password if 2FA enabled)
   - **Team:** P7BPRR2MY3
   - **Bundle ID:** com.spectit.app

**Or via Terminal:**
```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
eas credentials
# Select: iOS
# Select: production
# Follow prompts
```

### Step 2: Start Build

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

**Watch progress:**
- Terminal shows live updates
- Or: https://expo.dev/accounts/spect-it/projects/spectit-mobile/builds

**Build time:** 15-30 minutes

## 🔐 Get App-Specific Password (If 2FA Enabled)

If you have 2FA enabled on your Apple ID:

1. **Go to:** https://appleid.apple.com/account/manage
2. **Security** → **App-Specific Passwords**
3. **Generate Password** → Name: "EAS Build"
4. **Copy password** (xxxx-xxxx-xxxx-xxxx)
5. **Use this password** when configuring credentials (NOT your regular password)

## ✅ What Happens

1. **EAS builds your app** in the cloud (15-30 minutes)
2. **Handles signing automatically** (no manual setup needed)
3. **Uploads to App Store Connect** automatically
4. **Ready for TestFlight/App Store** submission

## 📱 After Build

1. **Check App Store Connect:**
   - https://appstoreconnect.apple.com/apps/6755681856
   - My Apps → Spect-IT → TestFlight

2. **Submit for Review:**
   - Select the build
   - Complete app information
   - Submit

## 💡 Why EAS is Better

- ✅ **No Xcode needed** - Builds in cloud
- ✅ **Automatic signing** - No manual certificate setup
- ✅ **No device registration** - Works immediately
- ✅ **Faster setup** - Just configure credentials once
- ✅ **Better for Expo** - Designed for React Native apps

---

**Configure credentials at: https://expo.dev/accounts/spect-it/settings/credentials**  
**Then run: `./BUILD_WITH_EAS_NOW.sh`** 🚀

