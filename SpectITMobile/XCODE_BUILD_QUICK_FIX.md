# ⚡ Quick Fix: Xcode Build Failed

## 🚀 Immediate Actions

### Step 1: Clean Build (2 minutes)

**In Xcode:**
1. **Product → Clean Build Folder** (⌘⇧K)
2. Wait for completion
3. Try building again

**Or run script:**
```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
./FIX_XCODE_BUILD_FAILURE.sh
```

### Step 2: Check Exact Error

**In Xcode:**
1. **View → Debug Area → Activate Console** (⌘⇧Y)
2. Look for **red error messages**
3. **Copy the exact error text**

**Or check Build Log:**
1. **View → Navigators → Show Report Navigator** (⌘9)
2. Click on latest build
3. Look for red errors

## 🔧 Most Common Fixes

### Fix 1: Code Signing Error

**If error mentions "signing" or "provisioning":**

1. **Project → Target → Signing & Capabilities**
2. ✅ **CHECK "Automatically manage signing"**
3. **Team:** Select "Tanya Strauss (P7BPRR2MY3)"
4. Wait for green checkmark ✅
5. Click **"Try Again"** if needed

### Fix 2: Missing Dependencies

**If error mentions "No such module" or missing files:**

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile/ios
pod install
cd ..
```

### Fix 3: Select Correct Destination

**In Xcode toolbar:**
- Click device selector
- Select **"Any iOS Device"**
- ⚠️ **NOT a simulator**

### Fix 4: Delete Derived Data

```bash
rm -rf ~/Library/Developer/Xcode/DerivedData/*
```

Then reopen Xcode and try again.

## 📋 What to Share

**To get targeted help, share:**
1. **Exact error message** from Xcode console
2. **Which step failed:** Build, Archive, or Signing
3. **Screenshot** of error (if possible)

## ✅ Configuration Verified

All settings are correct:
- ✅ Team ID: P7BPRR2MY3
- ✅ Bundle ID: com.spectit.app
- ✅ Code Signing: Automatic
- ✅ CocoaPods: Installed
- ✅ Workspace: Correct

**The issue is likely signing or a specific build error. Check Xcode console for exact error!** 🔍

