# 🍎 Build in Xcode - Step-by-Step (Fixed for Your Issue)

## ✅ Why Xcode Build Works Better

Xcode's automatic signing can create provisioning profiles even when EAS fails. This is often more reliable for first-time builds.

---

## 📋 Complete Step-by-Step Guide

### Step 1: Open Xcode Project

Xcode should be opening now. If not:

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
open ios/SpectIT.xcworkspace
```

**Wait 2-5 minutes** for Xcode to finish indexing.

---

### Step 2: Fix Signing (CRITICAL - This Fixes Your Issue)

1. **Click project name** (blue icon) in left sidebar
2. **Select target** under TARGETS (usually "SpectIT")
3. **Click "Signing & Capabilities"** tab
4. **Enable Automatic Signing:**
   - ✅ **CHECK** "Automatically manage signing"
   - **Team:** Click dropdown → Select your team
   - If team not listed:
     - Click **"Add Account..."**
     - Apple ID: `tanstrauss@gmail.com`
     - Password: [Your password]
     - Xcode handles 2FA automatically
   - **Bundle Identifier:** Should be `com.spectit.app`
   - If different, change it to `com.spectit.app`

5. **Xcode will automatically:**
   - Create provisioning profile
   - Generate certificates if needed
   - Handle all signing requirements
   - **This fixes the "no profiles found" error!**

6. **If you see errors:**
   - Click **"Try Again"** button
   - Or go to **Xcode → Preferences → Accounts**
   - Select your Apple ID
   - Click **"Download Manual Profiles"**

---

### Step 3: Select Build Target

1. **In top toolbar:**
   - Click device selector (shows current device/simulator)
   - Select **"Any iOS Device"**
   - ⚠️ **NOT a simulator** - must be "Any iOS Device" for App Store

---

### Step 4: Build & Archive

1. **Go to menu:**
   - **Product** → **Archive**
   - Or press: `Cmd + Shift + B` (build) then `Cmd + B` (archive)

2. **Wait for build:**
   - Takes 5-15 minutes
   - Progress shown in Xcode
   - Watch status bar for progress

3. **If build fails:**
   - Check error messages (red indicators)
   - Common fix: **Product** → **Clean Build Folder** (`Cmd + Shift + K`)
   - Try again

---

### Step 5: Upload to App Store Connect

1. **Organizer opens automatically:**
   - After archive completes
   - If not: **Window** → **Organizer**

2. **Select archive:**
   - Find latest archive (top of list)
   - Click **"Distribute App"**

3. **Choose distribution method:**
   - Select: **"App Store Connect"**
   - Click **"Next"**

4. **Distribution options:**
   - Select: **"Upload"**
   - Click **"Next"**

5. **Distribution options:**
   - ✅ **"Upload your app's symbols"** (recommended)
   - ✅ **"Manage Version and Build Number"** (if needed)
   - Click **"Next"**

6. **Review and upload:**
   - Review the summary
   - Click **"Upload"**

7. **Authentication:**
   - Xcode prompts for Apple ID if needed
   - Sign in with: `tanstrauss@gmail.com`
   - Enter password
   - 2FA code if prompted

8. **Wait for upload:**
   - Takes 5-10 minutes
   - Progress shown in Organizer
   - You'll see "Upload Successful" when done

---

## ✅ After Upload

### Step 6: Complete App Listing

1. **Go to App Store Connect:**
   - https://appstoreconnect.apple.com/apps/6755681856

2. **Wait for processing:**
   - Build will appear in "TestFlight" tab first
   - Then move to "App Store" tab (15-30 minutes)

3. **Select build:**
   - Go to "App Store" tab
   - Scroll to "Build" section
   - Click "Select a build before you submit your app"
   - Choose your uploaded build
   - Click "Done"

4. **Complete app information:**
   - Screenshots (required)
   - Description
   - Privacy Policy URL: `https://tanyastrauss1.github.io/Spect-IT/privacy-policy.html`
   - Keywords
   - Support URL
   - Category: Health & Fitness

5. **Submit for review:**
   - Click "Submit for Review"
   - Wait for Apple's review (1-3 days typically)

---

## ⚠️ Common Issues & Fixes

### Issue: "No team found"
**Fix:**
1. Xcode → Preferences → Accounts
2. Add Apple ID: `tanstrauss@gmail.com`
3. Sign in and select your team

### Issue: "Bundle ID not found"
**Fix:**
1. Go to: https://developer.apple.com/account/resources/identifiers/list
2. Create App ID: `com.spectit.app`
3. Or let Xcode create it automatically (if you have permissions)

### Issue: "Provisioning profile error"
**Fix:**
1. Make sure "Automatically manage signing" is checked
2. Select your team
3. Click "Try Again"
4. Xcode will create the profile automatically

### Issue: Build fails with errors
**Fix:**
1. Product → Clean Build Folder (`Cmd + Shift + K`)
2. Close and reopen Xcode
3. Try again

---

## 🎯 Key Points

- ✅ **"Automatically manage signing"** fixes the provisioning profile issue
- ✅ **No device registration needed** for App Store builds
- ✅ **Xcode handles everything** automatically
- ✅ **More reliable** than EAS for first-time builds

---

## 📊 Check Upload Status

**In App Store Connect:**
- Go to: https://appstoreconnect.apple.com/apps/6755681856/testflight/ios
- Check "Builds" section
- Status will show: "Processing" → "Ready to Submit"

---

**Xcode's automatic signing should fix your provisioning profile issue!**

