# 🔧 Fix: Xcode Build Failed

## ❌ Problem: Build Failed in Xcode

Xcode build is failing. Here's how to fix it.

## ✅ Quick Fixes

### Fix 1: Clean and Rebuild

**In Xcode:**
1. **Product → Clean Build Folder** (`Cmd + Shift + K`)
2. **Wait for clean to complete**
3. **Product → Archive** (or Build)

### Fix 2: Fix CocoaPods Encoding Issue

**If you see encoding errors:**
```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
export LANG=en_US.UTF-8
cd ios
pod install
```

### Fix 3: Delete Derived Data

```bash
rm -rf ~/Library/Developer/Xcode/DerivedData/SpectIT-*
rm -rf ~/Library/Developer/Xcode/DerivedData/Spect-*
```

Then reopen Xcode and try building again.

### Fix 4: Reinstall CocoaPods

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile/ios
rm -rf Pods
rm -f Podfile.lock
export LANG=en_US.UTF-8
pod install --repo-update
```

## 🔍 Common Build Errors

### Error: "Code Signing Error"
**Fix:**
1. In Xcode: Project → Target → Signing & Capabilities
2. ✅ Check "Automatically manage signing"
3. Select Team: P7BPRR2MY3
4. Wait for green checkmark ✅

### Error: "Missing Dependencies"
**Fix:**
```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
npm install
cd ios
pod install
```

### Error: "Deployment Target Too Low"
**Fix:**
- Already set to 15.0 ✅
- Pod warnings are normal (they use their own targets)

### Error: "Build Failed" (Generic)
**Fix:**
1. Check Xcode console for exact error
2. View → Debug Area → Activate Console (`Cmd + Shift + Y`)
3. Look for red error messages
4. Share the exact error for targeted fix

## 🚀 Complete Fix Script

Run the complete fix script:
```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
./FIX_XCODE_BUILD_COMPLETE.sh
```

This will:
- ✅ Clean all build artifacts
- ✅ Fix encoding issues
- ✅ Reinstall CocoaPods
- ✅ Verify configuration

## 📋 What to Check

1. **Xcode Console:**
   - View → Debug Area → Activate Console
   - Look for red errors

2. **Build Settings:**
   - Project → Target → Build Settings
   - Check for any red warnings

3. **Signing:**
   - Project → Target → Signing & Capabilities
   - Verify team and automatic signing

## 💡 Most Likely Fix

**Run the complete fix script:**
```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
./FIX_XCODE_BUILD_COMPLETE.sh
```

Then:
1. Open Xcode
2. Clean Build Folder
3. Try Archive again

---

**The fix script has been created. Run it to fix the build!** 🔧

