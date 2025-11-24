# 🔧 Complete Fix: "You must choose a build" + Rebuild Guide

## ❌ Current Issue

"Unable to Add for Review. The items below are required to start the review process: You must choose a build."

**Possible causes:**
1. Build not uploaded yet
2. Build still processing
3. Build failed processing
4. Old "Spect" references causing issues

---

## ✅ Solution: Clean Rebuild

Since you mentioned "spect in x code old", let's do a complete clean rebuild to ensure everything is correct.

---

## 🚀 Quick Rebuild Steps

### Option 1: EAS Build (Recommended - Easiest)

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
./REBUILD_FOR_APP_STORE.sh
# Choose option 1 (EAS Build)
```

**This will:**
- Clean all build artifacts
- Verify configuration
- Build in the cloud
- Automatically upload to App Store Connect

**Time:** 15-30 minutes

---

### Option 2: Xcode Build (Local)

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
./REBUILD_FOR_APP_STORE.sh
# Choose option 2 (Xcode Build)
```

**Then in Xcode:**
1. Verify scheme shows **"SpectIT"** (not "Spect")
2. Select **"Any iOS Device"** as target
3. **Product → Archive**
4. Wait for archive (5-15 minutes)
5. **Distribute App → App Store Connect**
6. Follow upload prompts

---

## 🔍 Verify Build Configuration

Before building, verify:

### 1. Check app.json

```json
{
  "expo": {
    "name": "Spect-IT",
    "ios": {
      "bundleIdentifier": "com.spectit.app",
      "buildNumber": "1"
    }
  }
}
```

✅ Should show: `"name": "Spect-IT"` and `"bundleIdentifier": "com.spectit.app"`

### 2. Check Xcode Project

Open: `ios/SpectIT.xcodeproj/project.pbxproj`

✅ Should show: `PRODUCT_NAME = SpectIT;`
✅ Should show: `PRODUCT_BUNDLE_IDENTIFIER = com.spectit.app;`

### 3. Check Scheme

File: `ios/SpectIT.xcodeproj/xcshareddata/xcschemes/SpectIT.xcscheme`

✅ Should show: `BlueprintName = "SpectIT"`
✅ Should show: `BuildableName = "SpectIT.app"`

---

## 📤 After Build Uploads

### Step 1: Wait for Processing

- **Time:** 15-30 minutes typically
- **Check:** App Store Connect → TestFlight tab
- **Status:** "Processing" → "Ready to Submit"

### Step 2: Select Build in App Store Tab

1. **Go to:** https://appstoreconnect.apple.com/apps/6755681856
2. **Click:** "App Store" tab (NOT TestFlight)
3. **Scroll to:** "Build" section
4. **Click:** "Select a build before you submit your app"
5. **Wait** for builds to load (10-30 seconds)
6. **Select** your build (should show "Ready to Submit")
7. **Click:** "Done"

### Step 3: Complete Required Fields

- [ ] App Description (minimum 10 characters)
- [ ] Support URL: `https://www.spect-it.com`
- [ ] Privacy Policy URL: `https://tanyastrauss1.github.io/Spect-IT/privacy-policy.html`
- [ ] Category: Health & Fitness or Medical
- [ ] Age Rating: Complete questionnaire
- [ ] Screenshots: Minimum 3 per device size

### Step 4: Submit for Review

1. Click **"Submit for Review"** (top right)
2. Confirm submission
3. Wait for review (1-3 days typically)

---

## 🧹 Clean Rebuild Script

Run the automated rebuild script:

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
./REBUILD_FOR_APP_STORE.sh
```

**This script will:**
1. ✅ Clean all build artifacts
2. ✅ Verify configuration (Spect-IT, not Spect)
3. ✅ Ensure iOS project is up to date
4. ✅ Install dependencies
5. ✅ Build for App Store

---

## ⚠️ If You See "Spect" in Xcode

### Fix Scheme Name:

1. **In Xcode:**
   - Click scheme dropdown (top left)
   - Select **"SpectIT"** (not "Spect")
   - If "SpectIT" not in list:
     - Product → Scheme → Manage Schemes
     - Find "SpectIT" scheme
     - Make sure it's checked/shared

### Fix Project Name:

1. **In Xcode:**
   - Click project (blue icon) in left sidebar
   - Select "SpectIT" target
   - Go to "Build Settings"
   - Search for "Product Name"
   - Should be: `SpectIT`
   - If not, change it to `SpectIT`

---

## 🔄 Complete Rebuild Process

### 1. Clean Everything

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile

# Clean build folder
rm -rf ios/build

# Clean caches
rm -rf node_modules/.cache
rm -rf .expo

# Clean Xcode derived data (optional)
rm -rf ~/Library/Developer/Xcode/DerivedData/SpectIT-*
```

### 2. Rebuild iOS Project

```bash
# Regenerate iOS project (ensures clean state)
npx expo prebuild --platform ios --clean
```

### 3. Install Dependencies

```bash
# Install npm packages
npm install

# Install CocoaPods
cd ios
pod install
cd ..
```

### 4. Build

**EAS Build:**
```bash
eas build --platform ios --profile production
```

**Or Xcode:**
```bash
open ios/SpectIT.xcworkspace
# Then: Product → Archive
```

---

## ✅ Verification Checklist

Before submitting:

- [ ] Build uploaded successfully
- [ ] Build status: "Ready to Submit" (not "Processing")
- [ ] Build selected in "App Store" tab
- [ ] All project files use "SpectIT" (not "Spect")
- [ ] Scheme name: "SpectIT"
- [ ] Bundle ID: "com.spectit.app"
- [ ] Required fields completed
- [ ] Screenshots uploaded

---

## 🎯 Most Likely Solution

**90% of the time, the issue is:**

1. **Build not uploaded yet** → Upload a new build
2. **Build still processing** → Wait 15-30 minutes
3. **Looking in wrong tab** → Must use "App Store" tab, not TestFlight
4. **Build not selected** → Click "Select a build" button

**Quick fix:**
1. Run rebuild script: `./REBUILD_FOR_APP_STORE.sh`
2. Wait for build to process
3. Go to "App Store" tab
4. Select your build
5. Submit

---

## 📋 Summary

**The issue:** Build not selected in App Store Connect

**The solution:**
1. ✅ Clean rebuild (removes old "Spect" references)
2. ✅ Upload new build
3. ✅ Wait for processing
4. ✅ Select build in "App Store" tab
5. ✅ Submit for review

**Run the rebuild script to fix everything automatically!**

---

**Files:**
- `REBUILD_FOR_APP_STORE.sh` - Automated rebuild script
- `FIX_BUILD_SELECTION_COMPLETE.md` - This guide

