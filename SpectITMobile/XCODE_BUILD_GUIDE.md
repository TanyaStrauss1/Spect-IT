# 🍎 Build & Upload App from Xcode - Complete Guide

## ✅ Quick Start

Run this script to open Xcode:
```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
./BUILD_AND_UPLOAD_XCODE.sh
```

---

## 📋 Step-by-Step in Xcode

### Step 1: Wait for Indexing (2-5 minutes)

- Xcode is opening your project
- Wait until status bar shows "Ready"
- Look for any red error indicators

---

### Step 2: Configure Signing & Capabilities

1. **Click project name** (blue icon) in left sidebar
2. **Select target** under TARGETS (usually "SpectIT" or "spectit-mobile")
3. **Click "Signing & Capabilities"** tab
4. **Configure Team:**
   - **Team:** Click dropdown → Select your team
   - If not signed in:
     - Click **"Add Account..."**
     - Apple ID: `tanstrauss@gmail.com`
     - Password: [Your Apple ID password]
     - Xcode handles 2FA automatically
5. **Verify Bundle ID:**
   - Should be: `com.spectit.app`
   - If different, change it
6. **Provisioning Profile:**
   - Should show: "Xcode Managed Profile"
   - Xcode creates this automatically

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
   - Or keyboard shortcut: `Cmd + Shift + B` (build) then `Cmd + B` (archive)

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

### Step 6: Complete App Listing in App Store Connect

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

## ⚠️ Common Issues

### Issue: "No accounts found"
**Solution:**
1. Xcode → Preferences → Accounts
2. Add your Apple ID: `tanstrauss@gmail.com`
3. Sign in and select your team

### Issue: "Bundle ID not found"
**Solution:**
1. Go to: https://developer.apple.com/account/resources/identifiers/list
2. Create App ID: `com.spectit.app`
3. Or use existing one

### Issue: "Provisioning profile missing"
**Solution:**
1. Xcode will auto-generate if you have Developer Program access
2. Or create manually in Apple Developer Portal

### Issue: Build fails
**Solution:**
1. Product → Clean Build Folder (`Cmd + Shift + K`)
2. Close and reopen Xcode
3. Try again

---

## 📊 Check Upload Status

**In App Store Connect:**
- Go to: https://appstoreconnect.apple.com/apps/6755681856/testflight/ios
- Check "Builds" section
- Status will show: "Processing" → "Ready to Submit"

---

## ✅ Quick Checklist

- [ ] Xcode project opened
- [ ] Signing configured (Team selected)
- [ ] Bundle ID: `com.spectit.app`
- [ ] Build target: "Any iOS Device"
- [ ] Archive created successfully
- [ ] Uploaded to App Store Connect
- [ ] Build appears in App Store Connect
- [ ] App listing information completed
- [ ] Privacy policy URL added
- [ ] Screenshots uploaded
- [ ] Submitted for review

---

**Your app will be available in TestFlight within 15-30 minutes after upload!**

