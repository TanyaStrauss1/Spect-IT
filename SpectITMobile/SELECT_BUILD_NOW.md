# 🎯 Quick Fix: "You must choose a build"

## ❌ Error

"Unable to Add for Review. The items below are required to start the review process: You must choose a build."

---

## ✅ Solution: Select Build in App Store Connect

### Step 1: Go to App Store Connect

**Direct Link:**
https://appstoreconnect.apple.com/apps/6755681856/distribution/ios/version/inflight

**Or navigate:**
1. Go to: https://appstoreconnect.apple.com
2. Sign in with: `tanstrauss@gmail.com`
3. Click on your app: **Spect-IT**
4. Click **"App Store"** tab (top navigation)

---

### Step 2: Check Build Status

**First, check if you have a build:**

1. **Go to "TestFlight" tab** (top navigation)
2. **Look in "iOS Builds" section**
3. **Check build status:**
   - ⏳ **"Processing"** → Wait 15-30 minutes, then check again
   - ✅ **"Ready to Submit"** → Build is ready, proceed to Step 3
   - ❌ **"Invalid"** → Build has errors, need to upload new build
   - 📭 **No builds** → Need to upload a build first (see Step 4)

---

### Step 3: Select the Build (CRITICAL STEP)

**This is the step that fixes your error!**

1. **Go to "App Store" tab** (NOT TestFlight)
   - Top navigation bar
   - Must be "App Store" tab

2. **Scroll down to "Build" section**
   - Look for section titled **"Build"**
   - Usually below "App Preview and Screenshots"

3. **Click the button/link:**
   - Button text: **"Select a build before you submit your app"**
   - OR: **"+" button** (if shown)
   - OR: **"Choose a build"** link
   - OR: **"Add Build"** button

4. **Wait for builds to load** (10-30 seconds)
   - A modal/popup will appear
   - List of available builds will show

5. **Select your build:**
   - Look for build with version: **"1.0.0 (1)"** or similar
   - Status should be: **"Ready to Submit"**
   - Click on the build to select it

6. **Click "Done" or "Save"**
   - Build is now selected
   - Error should disappear

---

### Step 4: If No Build Available - Upload One

**If you don't have a build yet, upload one:**

#### Option A: Use Xcode (Easiest)

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
open ios/SpectIT.xcworkspace
```

**In Xcode:**
1. Select **"Any iOS Device"** (not simulator)
2. **Product → Archive**
3. Wait for archive (5-15 minutes)
4. **Distribute App → App Store Connect**
5. Follow upload prompts
6. Wait 15-30 minutes for processing

#### Option B: Use EAS Build

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
eas build --platform ios --profile production
```

**Note:** You'll need an app-specific password for Apple ID (see `FIX_AUTHENTICATION_ERROR.md`)

---

## 📋 Visual Guide

### Where to Find "Select a build" Button

```
App Store Connect → Your App → App Store Tab
│
├── App Information
├── App Preview and Screenshots
├── Build  ← LOOK HERE
│   └── [Select a build before you submit your app] ← CLICK THIS
├── App Privacy
└── Version Information
```

### Build Selection Modal

When you click "Select a build", you'll see:

```
┌─────────────────────────────────────┐
│  Select a Build                     │
├─────────────────────────────────────┤
│                                     │
│  ✓ 1.0.0 (1) - Ready to Submit     │ ← SELECT THIS
│     1.0.0 (2) - Processing         │
│                                     │
│  [Cancel]  [Done]                   │ ← CLICK DONE
└─────────────────────────────────────┘
```

---

## ⚠️ Common Issues

### Issue: "No builds available"

**Causes:**
- Build still processing (wait 15-30 minutes)
- Build not uploaded yet
- Build failed processing

**Fix:**
1. Check TestFlight tab for build status
2. If processing, wait longer
3. If no build, upload one (Step 4)

---

### Issue: Build shows "Processing"

**This is normal!**

- **Wait:** 15-30 minutes typically
- **Check:** TestFlight tab periodically
- **When ready:** Status changes to "Ready to Submit"
- **Then:** Go to App Store tab and select it

---

### Issue: Can't find "Select a build" button

**Try:**
1. Make sure you're in **"App Store"** tab (not TestFlight)
2. Scroll down to "Build" section
3. Look for any button/link related to builds
4. May appear as: "Add Build", "Choose Build", "+" button, or text link

---

### Issue: Build selected but still shows error

**Check:**
1. Build status must be "Ready to Submit" (not "Processing")
2. Make sure you clicked "Done" after selecting
3. Refresh the page
4. Complete other required fields (screenshots, description, etc.)

---

## ✅ After Selecting Build

Once build is selected, complete these required fields:

- [ ] **Screenshots** (minimum 3 per device size)
- [ ] **App Description** (at least 10 characters)
- [ ] **Privacy Policy URL:** `https://tanyastrauss1.github.io/Spect-IT/privacy-policy.html`
- [ ] **Support URL:** `https://www.spect-it.com`
- [ ] **Category:** Health & Fitness or Medical
- [ ] **Age Rating:** Complete questionnaire

Then click **"Submit for Review"** button!

---

## 🔗 Quick Links

- **App Store Connect:** https://appstoreconnect.apple.com/apps/6755681856
- **Direct to App Store Tab:** https://appstoreconnect.apple.com/apps/6755681856/distribution/ios/version/inflight
- **TestFlight Tab:** https://appstoreconnect.apple.com/apps/6755681856/testflight/ios

---

## 💡 Key Points

1. ✅ **Must be in "App Store" tab** (not TestFlight)
2. ✅ **Build must be "Ready to Submit"** (not "Processing")
3. ✅ **Click "Select a build" button** in Build section
4. ✅ **Wait for builds to load** (10-30 seconds)
5. ✅ **Select your build** and click "Done"

**The error will disappear once you select a build!**

