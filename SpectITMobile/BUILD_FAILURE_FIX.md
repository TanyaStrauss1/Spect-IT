# 🔧 Fix: Build Failure - Signing Conflict

## ❌ Error Message

```
SpectIT has conflicting provisioning settings. SpectIT is automatically signed for development, 
but a conflicting code signing identity Apple Distribution has been manually specified.
```

## 🔍 What This Means

- Your project uses **automatic signing** (correct)
- But a build script tried to force **"Apple Distribution"** manually
- This creates a conflict

## ✅ Solution: Use Xcode GUI (Recommended)

Xcode handles signing automatically when you archive. Here's how:

### Step 1: Open Xcode

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
open ios/SpectIT.xcworkspace
```

### Step 2: Configure Signing

1. **Click "SpectIT" project** (blue icon) in left sidebar
2. **Select "SpectIT"** under TARGETS
3. **Go to "Signing & Capabilities" tab**
4. **Verify settings:**
   - ✅ **"Automatically manage signing"** should be CHECKED
   - **Team:** Select **"Tanya Strauss (P7BPRR2MY3)"**
   - **Bundle Identifier:** `com.spectit.app`
   - **Provisioning Profile:** Should show "Xcode Managed Profile"

5. **Wait for green checkmark ✅**
   - If you see errors, click **"Try Again"**
   - Xcode will create/update provisioning profiles automatically

### Step 3: Select Build Destination

1. **In top toolbar**, click device selector
2. **Select "Any iOS Device"**
   - ⚠️ **NOT a simulator** - must be device for Archive

### Step 4: Clean Build Folder

1. **Menu:** `Product → Clean Build Folder`
   - Or press: `Shift + Cmd + K`
2. Wait for clean to complete

### Step 5: Create Archive

1. **Menu:** `Product → Archive`
2. **Wait for build** (10-20 minutes)
   - Xcode will automatically:
     - Use correct signing certificate
     - Create App Store provisioning profile
     - Build optimized release version

### Step 6: Distribute

1. **Organizer opens automatically**
2. **Click "Distribute App"**
3. **Select "App Store Connect"**
4. **Follow prompts to upload**

---

## 🔍 Why Command Line Build Failed

**The Issue:**
- Project uses automatic signing (CODE_SIGN_STYLE = Automatic)
- Build script tried to force CODE_SIGN_IDENTITY = "Apple Distribution"
- This creates a conflict

**The Fix:**
- Xcode GUI automatically uses the correct certificate:
  - **Development builds:** Uses "Apple Development"
  - **Archive/Release builds:** Automatically uses "Apple Distribution"
- No manual override needed!

---

## ✅ Alternative: Fix Command Line Build

If you want to use command line, you need to:

1. **Remove CODE_SIGN_IDENTITY override** from build command
2. **Let automatic signing handle it**

**Correct command:**
```bash
xcodebuild archive \
  -workspace ios/SpectIT.xcworkspace \
  -scheme SpectIT \
  -configuration Release \
  -archivePath ./ios/build/SpectIT.xcarchive \
  -destination "generic/platform=iOS" \
  -allowProvisioningUpdates \
  DEVELOPMENT_TEAM=P7BPRR2MY3 \
  CODE_SIGN_STYLE=Automatic
```

**Note:** Don't specify CODE_SIGN_IDENTITY - let automatic signing choose!

---

## 🎯 Recommended Approach

**Use Xcode GUI** - it's easier and handles everything automatically:
- ✅ No signing conflicts
- ✅ Automatic certificate selection
- ✅ Visual feedback
- ✅ Easier troubleshooting

---

## 📋 Quick Checklist

- [ ] Xcode open with project
- [ ] Signing configured (Team: P7BPRR2MY3)
- [ ] "Automatically manage signing" checked
- [ ] Green checkmark ✅ visible
- [ ] Selected "Any iOS Device"
- [ ] Cleaned build folder
- [ ] Ready to Archive

---

**Follow these steps and your build will succeed!** 🚀

