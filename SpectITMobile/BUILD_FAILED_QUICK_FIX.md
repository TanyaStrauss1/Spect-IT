# ⚡ Quick Fix: Build Failed

## 🔍 What Failed?

**To fix this, I need to know what specifically failed:**

1. **Xcode Archive?** (Product → Archive)
2. **EAS Build?** (eas build command)
3. **Upload to App Store Connect?** (Distribute App)
4. **Something else?**

## 🚀 Most Common Fixes

### Fix 1: Code Signing Error (Most Common)

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

### Fix 2: Clean and Rebuild

**Run fix script:**
```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
./FIX_BUILD_FAILURE_NOW.sh
```

**Or manually:**
1. **In Xcode:** Product → Clean Build Folder (⌘⇧K)
2. **Delete derived data:**
   ```bash
   rm -rf ~/Library/Developer/Xcode/DerivedData/*
   ```
3. **Reopen Xcode and try again**

### Fix 3: Missing Dependencies

**If error mentions "No such module" or missing files:**
```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile/ios
export LANG=en_US.UTF-8
pod install
cd ..
```

### Fix 4: Wrong Destination Selected

**In Xcode toolbar:**
- Must select **"Any iOS Device"**
- ⚠️ **NOT a simulator**
- ⚠️ **NOT a connected device**

### Fix 5: Distribution Certificate Missing

**If error mentions "no distribution certificate":**

**Let Xcode create it:**
1. Signing & Capabilities → Automatically manage signing
2. Select Team: P7BPRR2MY3
3. Xcode creates certificate automatically

**Or create manually:**
- See: `GET_APPLE_DISTRIBUTION_CERTIFICATE.md`

## 🔍 Get Exact Error

**In Xcode:**
1. **View → Debug Area → Activate Console** (⌘⇧Y)
2. **Look for red error messages**
3. **Copy the exact error text**

**Or check Build Log:**
1. **View → Navigators → Show Report Navigator** (⌘9)
2. **Click on latest build**
3. **Look for red errors**

## 📋 Diagnostic Checklist

Run this to check everything:
```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
./FIX_BUILD_FAILURE_NOW.sh
```

## 💡 What to Share

**To get targeted help, share:**
1. **Exact error message** from Xcode console
2. **Which step failed:**
   - Signing configuration
   - Build
   - Archive
   - Upload
3. **Screenshot** of error (if possible)

## ✅ Quick Actions

1. **Run fix script** → `./FIX_BUILD_FAILURE_NOW.sh`
2. **Check Xcode console** → Get exact error
3. **Verify signing** → Signing & Capabilities tab
4. **Clean build** → Product → Clean Build Folder

---

**Run the fix script and check Xcode console for the exact error!** 🔍

