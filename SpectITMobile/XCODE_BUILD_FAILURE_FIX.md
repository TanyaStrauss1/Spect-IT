# 🔧 Fix: Xcode Build Failure

## ❌ Build Failed in Xcode

Here's how to fix common Xcode build failures.

## 🚀 Quick Fixes

### Fix 1: Clean Build Folder

**In Xcode:**
1. **Product → Clean Build Folder** (⌘⇧K)
2. Wait for clean to complete
3. **Product → Archive** again

**Or via Terminal:**
```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
./FIX_XCODE_BUILD_FAILURE.sh
```

### Fix 2: Verify Signing

**In Xcode:**
1. Click **"SpectIT"** project (blue icon)
2. Select **"SpectIT"** target
3. Go to **"Signing & Capabilities"** tab
4. ✅ **CHECK "Automatically manage signing"**
5. **Team:** Select "Tanya Strauss (P7BPRR2MY3)"
6. Wait for green checkmark ✅

**If errors:**
- Click **"Try Again"**
- Or: Xcode → Settings → Accounts → Download Manual Profiles

### Fix 3: Reinstall CocoaPods

**If error mentions CocoaPods or missing files:**
```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile/ios
pod deintegrate
pod install
cd ..
```

### Fix 4: Select Correct Destination

**In Xcode toolbar:**
1. Click device selector (top of Xcode)
2. Select **"Any iOS Device"**
3. ⚠️ **NOT a simulator** - must be device for Archive

### Fix 5: Check Build Settings

**In Xcode:**
1. Project → Target → Build Settings
2. Search for: `DEVELOPMENT_TEAM`
3. Should show: `P7BPRR2MY3`
4. Search for: `PRODUCT_BUNDLE_IDENTIFIER`
5. Should show: `com.spectit.app`

## 🔍 Common Errors & Fixes

### Error: "No such module"

**Fix:**
```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile/ios
pod install
```

### Error: "Code signing error"

**Fix:**
1. Signing & Capabilities → Select Team: P7BPRR2MY3
2. Wait for green checkmark
3. If still fails: Xcode → Settings → Accounts → Download Manual Profiles

### Error: "Provisioning profile not found"

**Fix:**
1. Signing & Capabilities → Click "Try Again"
2. Or: Xcode → Settings → Accounts → Download Manual Profiles
3. Verify team is selected

### Error: "Missing Info.plist"

**Fix:**
- Verify: `ios/SpectIT/Info.plist` exists
- Check Build Settings → INFOPLIST_FILE points to correct file

### Error: "Cannot find workspace"

**Fix:**
- Make sure you open: `ios/SpectIT.xcworkspace`
- **NOT:** `ios/SpectIT.xcodeproj`

### Error: "Build settings error"

**Fix:**
1. Product → Clean Build Folder
2. Close Xcode
3. Delete DerivedData: `rm -rf ~/Library/Developer/Xcode/DerivedData/*`
4. Reopen Xcode

## 📋 Step-by-Step Fix

### Step 1: Clean Everything

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
./FIX_XCODE_BUILD_FAILURE.sh
```

### Step 2: Open Xcode

```bash
open ios/SpectIT.xcworkspace
```

**Wait 2-5 minutes** for Xcode to finish indexing.

### Step 3: Verify Signing

1. Project → Target → Signing & Capabilities
2. ✅ Check "Automatically manage signing"
3. Team: P7BPRR2MY3
4. Wait for green checkmark ✅

### Step 4: Select Destination

1. Top toolbar → Device selector
2. Select **"Any iOS Device"**

### Step 5: Clean Build

1. **Product → Clean Build Folder** (⌘⇧K)
2. Wait for completion

### Step 6: Archive

1. **Product → Archive**
2. Wait for build (5-15 minutes)

## 🔍 Get Exact Error

**To see the exact error:**

1. **In Xcode:**
   - View → Debug Area → Activate Console (⌘⇧Y)
   - Look for red error messages
   - Copy the exact error text

2. **Check Build Log:**
   - View → Navigators → Show Report Navigator (⌘9)
   - Click on latest build
   - Look for red errors

## 💡 Most Common Issues

1. **Signing Error (80%)**
   - Fix: Verify team and automatic signing

2. **Missing Dependencies (15%)**
   - Fix: Run `pod install`

3. **Build Settings (5%)**
   - Fix: Clean build folder and rebuild

## 🚀 After Fix

Once build succeeds:
1. Archive window opens automatically
2. Click **"Distribute App"**
3. Select **"App Store Connect"**
4. Follow distribution wizard

---

**Run the fix script and check Xcode for the exact error message!** 🔧

