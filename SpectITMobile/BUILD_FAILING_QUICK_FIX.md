# ⚡ Quick Fix: Build Failing

## 🔍 Immediate Actions

### Step 1: Get Exact Error

**In Xcode:**
1. **View → Debug Area → Activate Console** (⌘⇧Y)
2. **Look for red error messages**
3. **Copy the exact error text**

**Or check Build Log:**
1. **View → Navigators → Show Report Navigator** (⌘9)
2. **Click on latest build**
3. **Look for red errors**
4. **Copy exact error message**

---

## 🚀 Quick Fixes

### Fix 1: Run Comprehensive Fix

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
./FIX_ALL_BUILD_ISSUES.sh
```

This will:
- ✅ Clean all build artifacts
- ✅ Reinstall dependencies
- ✅ Fix configuration
- ✅ Verify everything

---

### Fix 2: Code Signing Error (Most Common)

**If error mentions "signing", "provisioning", or "certificate":**

**In Xcode:**
1. **Project → Target → Signing & Capabilities**
2. ✅ **CHECK "Automatically manage signing"**
3. **Team:** Select "Tanya Strauss (P7BPRR2MY3)"
4. **Click "Try Again"** if errors appear
5. **Wait for green checkmark** ✅

**If team not listed:**
- Xcode → Settings → Accounts
- Click "+" → Add Apple ID: `tanstrauss@gmail.com`
- Sign in and select team

---

### Fix 3: Missing Dependencies

**If error mentions "No such module" or missing files:**

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
npm install --legacy-peer-deps
cd ios
export LANG=en_US.UTF-8
pod install
cd ..
```

---

### Fix 4: Clean and Rebuild

**In Xcode:**
1. **Product → Clean Build Folder** (⌘⇧K)
2. **Wait for clean to complete**
3. **Delete derived data:**
   ```bash
   rm -rf ~/Library/Developer/Xcode/DerivedData/*
   ```
4. **Reopen Xcode**
5. **Try building again**

---

### Fix 5: Wrong Destination Selected

**In Xcode toolbar:**
- Must select **"Any iOS Device"**
- ⚠️ **NOT a simulator**
- ⚠️ **NOT a connected device**

---

### Fix 6: CocoaPods Issues

**If error mentions CocoaPods:**

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile/ios
rm -rf Pods
rm -f Podfile.lock
export LANG=en_US.UTF-8
pod install --repo-update
cd ..
```

---

## 🔍 Common Errors & Fixes

### Error: "Code signing error"
**Fix:**
- Signing & Capabilities → Select Team: P7BPRR2MY3
- Wait for green checkmark
- Click "Try Again"

### Error: "No such module"
**Fix:**
```bash
cd ios
pod install
```

### Error: "Provisioning profile not found"
**Fix:**
- Signing & Capabilities → Click "Try Again"
- Xcode → Settings → Accounts → Download Manual Profiles

### Error: "Archive failed"
**Fix:**
- Select "Any iOS Device" (not simulator)
- Clean build folder
- Try archive again

### Error: "Build failed" (Generic)
**Fix:**
- Check Xcode console for exact error
- Run diagnostic: `./DIAGNOSE_BUILD_FAILURE.sh`
- Share exact error message

---

## 📋 Diagnostic Checklist

**Run diagnostic:**
```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
./DIAGNOSE_BUILD_FAILURE.sh
```

**This checks:**
- ✅ Project files exist
- ✅ Dependencies installed
- ✅ Configuration correct
- ✅ Critical files present
- ✅ Build configuration valid

---

## 💡 What to Share

**To get targeted help, share:**
1. **Exact error message** from Xcode console
2. **Which step failed:**
   - Signing configuration
   - Build
   - Archive
   - Upload
3. **Screenshot** of error (if possible)
4. **Build log** (if available)

---

## ✅ Quick Actions

1. **Run diagnostic** → `./DIAGNOSE_BUILD_FAILURE.sh`
2. **Run fix script** → `./FIX_ALL_BUILD_ISSUES.sh`
3. **Check Xcode console** → Get exact error
4. **Verify signing** → Signing & Capabilities tab
5. **Clean build** → Product → Clean Build Folder

---

**Run the diagnostic and fix scripts, then check Xcode console for the exact error!** 🔍

