# 🔧 Fix Provisioning Profile Error

## ❌ Error Message

"No profiles for 'com.spectit.app' were found. Xcode couldn't find any iOS App Development provisioning profiles matching 'com.spectit.app'."

---

## ✅ Solution 1: Use EAS Build (Recommended - Easiest)

EAS Build automatically creates and manages provisioning profiles. You don't need to create them manually.

### Build with EAS:

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
./BUILD_WITH_EAS_NO_DEVICE.sh
```

**Or manually:**
```bash
eas build --platform ios --profile production
```

**EAS will:**
- ✅ Automatically create provisioning profiles
- ✅ Handle certificates
- ✅ Manage all signing requirements
- ✅ No manual setup needed

---

## ✅ Solution 2: Enable Automatic Signing in Xcode

Xcode can automatically create provisioning profiles for App Store distribution.

### Step 1: Open Xcode Project

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
./FIX_XCODE_SIGNING.sh
```

### Step 2: Configure Automatic Signing

1. **In Xcode:**
   - Click project name (blue icon) in left sidebar
   - Select target under TARGETS
   - Go to **"Signing & Capabilities"** tab

2. **Enable Automatic Signing:**
   - ✅ **CHECK** "Automatically manage signing"
   - **Team:** Select your team (tanstrauss@gmail.com)
   - **Bundle Identifier:** `com.spectit.app`

3. **Xcode will automatically:**
   - Create provisioning profile
   - Generate certificates if needed
   - Handle all signing requirements

4. **If you see errors:**
   - Click **"Try Again"** button
   - Or click **"Download Manual Profiles"** in Preferences → Accounts

---

## ✅ Solution 3: Create Provisioning Profile Manually

If automatic signing doesn't work, create the profile manually:

### Step 1: Create App ID (if not exists)

1. **Go to:** https://developer.apple.com/account/resources/identifiers/list

2. **Click:** "+" button

3. **Select:** "App IDs" → "Continue"

4. **Fill in:**
   - **Description:** Spect-IT
   - **Bundle ID:** `com.spectit.app` (Explicit)
   - **Capabilities:** Select what you need (Camera, Location, etc.)

5. **Click:** "Continue" → "Register"

### Step 2: Create Provisioning Profile

1. **Go to:** https://developer.apple.com/account/resources/profiles/list

2. **Click:** "+" button

3. **Select:** "App Store" (for App Store distribution)
   - Or "iOS App Development" (for testing)

4. **Select App ID:**
   - Choose: `com.spectit.app`

5. **Select Certificate:**
   - Choose your development/distribution certificate

6. **Name the profile:**
   - Example: "Spect-IT App Store"

7. **Click:** "Generate" → "Download"

### Step 3: Install Profile in Xcode

1. **Double-click** the downloaded `.mobileprovision` file
2. It will install in Xcode automatically
3. Or drag it into Xcode → Preferences → Accounts → Your Apple ID → Download Manual Profiles

---

## ✅ Solution 4: Use Xcode to Download Profiles

1. **In Xcode:**
   - **Xcode** → **Preferences** → **Accounts**
   - Select your Apple ID (tanstrauss@gmail.com)
   - Click **"Download Manual Profiles"**

2. **Or in Project Settings:**
   - Go to Signing & Capabilities
   - Click **"Try Again"** or **"Download Manual Profiles"**

---

## 🎯 Quick Fix (Recommended)

**For App Store submission:** Use **EAS Build**

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
eas build --platform ios --profile production
```

**For Xcode builds:** Enable **Automatic Signing**

1. Open Xcode
2. Signing & Capabilities tab
3. ✅ Check "Automatically manage signing"
4. Select your team
5. Xcode creates profile automatically

---

## ⚠️ Common Issues

### Issue: "No team found"
**Solution:**
1. Xcode → Preferences → Accounts
2. Add Apple ID: tanstrauss@gmail.com
3. Sign in

### Issue: "Bundle ID not registered"
**Solution:**
1. Go to: https://developer.apple.com/account/resources/identifiers/list
2. Create App ID: `com.spectit.app`

### Issue: "Certificate expired"
**Solution:**
1. Xcode → Preferences → Accounts
2. Select your Apple ID
3. Click "Download Manual Profiles"
4. Or let Xcode regenerate automatically

---

## 📋 Quick Commands

```bash
# Option 1: Build with EAS (handles everything)
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
./BUILD_WITH_EAS_NO_DEVICE.sh

# Option 2: Fix Xcode signing
./FIX_XCODE_SIGNING.sh
# Then enable "Automatically manage signing" in Xcode
```

---

**The easiest solution is EAS Build - it handles provisioning profiles automatically!**

