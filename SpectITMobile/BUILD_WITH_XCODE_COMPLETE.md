# 🍎 Build with Xcode - Complete Guide

## ✅ Why Xcode Build Works

Xcode uses different authentication than EAS and may work even if your Apple account has issues with CLI tools.

---

## 🚀 Step-by-Step: Build in Xcode

### Step 1: Open Xcode

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
open ios/SpectIT.xcworkspace
```

**Wait 2-5 minutes** for Xcode to finish indexing.

---

### Step 2: Configure Signing

1. **Click project name** (blue icon) in left sidebar
2. **Select "SpectIT" target** under TARGETS
3. **Click "Signing & Capabilities" tab**

4. **Enable Automatic Signing:**
   - ✅ **CHECK** "Automatically manage signing"
   - **Team:** Click dropdown → Select "Tanya Strauss (P7BPRR2MY3)"
   - If team not listed:
     - Click **"Add Account..."**
     - Apple ID: `tanstrauss@gmail.com`
     - Password: `Lily57048576!`
     - Xcode handles 2FA automatically

5. **Verify Settings:**
   - Bundle Identifier: `com.spectit.app`
   - Provisioning Profile: "Xcode Managed Profile" (automatic)

6. **If you see errors:**
   - Click **"Try Again"** button
   - Xcode will create certificates/profiles automatically

---

### Step 3: Select Build Target

1. **In top toolbar:**
   - Click device selector (shows current device)
   - Select **"Any iOS Device"**
   - ⚠️ **NOT a simulator** - must be device for App Store

---

### Step 4: Build & Archive

1. **Go to menu:**
   - **Product → Archive**
   - Or keyboard shortcut: `Cmd + Shift + B` (build) then `Cmd + B` (archive)

2. **Wait for Build:**
   - Takes 5-15 minutes
   - Progress shown in Xcode
   - Watch status bar for progress

3. **If Build Fails:**
   - Check error messages (red indicators)
   - Common fix: **Product → Clean Build Folder** (`Cmd + Shift + K`)
   - Try again

---

### Step 5: Distribute to App Store Connect

1. **Organizer Opens Automatically:**
   - After archive completes
   - Shows your archive

2. **Distribute App:**
   - Click **"Distribute App"** button
   - Select **"App Store Connect"**
   - Click **"Next"**

3. **Distribution Options:**
   - Select **"Upload"**
   - Click **"Next"**

4. **App Thinning:**
   - Select **"All compatible device variants"**
   - Click **"Next"**

5. **Review & Upload:**
   - Review summary
   - Click **"Upload"**

6. **Authentication:**
   - Xcode prompts for Apple ID if needed
   - Sign in with: `tanstrauss@gmail.com`
   - Password: `Lily57048576!`
   - Xcode handles 2FA automatically

7. **Wait for Upload:**
   - Takes 5-10 minutes
   - Progress shown in Xcode

---

## ✅ After Upload Completes

### Step 1: Wait for Processing

1. **Go to:** https://appstoreconnect.apple.com/apps/6755681856
2. **Click "TestFlight" tab**
3. **Wait 15-30 minutes** for processing
4. **Status:** "Processing" → "Ready to Submit"

### Step 2: Select Build

1. **Click "App Store" tab** (NOT TestFlight)
2. **Scroll to "Build" section**
3. **Click "Select a build before you submit your app"**
4. **Wait for builds to load** (10-30 seconds)
5. **Select your build** (should show "Ready to Submit")
6. **Click "Done"**

### Step 3: Complete Required Fields

- [ ] **Screenshots** (minimum 3 per device size)
- [ ] **App Description** (at least 10 characters)
- [ ] **Privacy Policy URL:** `https://tanyastrauss1.github.io/Spect-IT/privacy-policy.html`
- [ ] **Support URL:** `https://www.spect-it.com`
- [ ] **Category:** Health & Fitness or Medical
- [ ] **Age Rating:** Complete questionnaire

### Step 4: Submit for Review

1. **Click "Submit for Review"** button (top right)
2. **Confirm submission**
3. **Wait for Apple's review** (typically 1-3 days)

---

## ⚠️ Common Issues

### Issue: "No team found"

**Fix:**
1. Xcode → Settings → Accounts
2. Click "+" button
3. Add Apple ID: `tanstrauss@gmail.com`
4. Enter password: `Lily57048576!`
5. Go back to Signing & Capabilities
6. Team should now appear

---

### Issue: "Provisioning profile not found"

**Fix:**
1. Make sure "Automatically manage signing" is checked
2. Select your team
3. Click "Try Again" button
4. Xcode will create profile automatically

---

### Issue: Build fails

**Fix:**
1. **Product → Clean Build Folder** (`Cmd + Shift + K`)
2. Close Xcode
3. Delete derived data:
   ```bash
   rm -rf ~/Library/Developer/Xcode/DerivedData/SpectIT-*
   ```
4. Reopen Xcode
5. Try building again

---

## 💡 Advantages of Xcode Build

- ✅ Uses Xcode's built-in authentication (different from CLI)
- ✅ Visual interface - easier to see what's happening
- ✅ Handles signing automatically
- ✅ Direct upload to App Store Connect
- ✅ May work even if EAS doesn't

---

## 📋 Quick Checklist

- [ ] Xcode opened
- [ ] Project loaded (no red errors)
- [ ] Signing configured (Team: P7BPRR2MY3)
- [ ] "Any iOS Device" selected
- [ ] Archive created successfully
- [ ] Uploaded to App Store Connect
- [ ] Build processing (wait 15-30 min)
- [ ] Build selected in App Store tab
- [ ] Required fields completed
- [ ] Submitted for review

---

## 🔗 Important Links

- **App Store Connect:** https://appstoreconnect.apple.com/apps/6755681856
- **TestFlight:** https://appstoreconnect.apple.com/apps/6755681856/testflight/ios

---

**Xcode build is the most reliable method when EAS has authentication issues!**

