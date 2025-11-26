# 🚀 Build and Upload iOS App - Complete Guide

## Current Status

**No builds found in TestFlight** - We need to build and upload the app first.

---

## 🎯 Two Build Options

### Option 1: EAS Cloud Build (Recommended) ⭐

**Best for:**
- ✅ No local Xcode setup needed
- ✅ Automatic code signing
- ✅ Automatic upload to App Store Connect
- ✅ Faster setup

**Time:** 15-30 minutes

#### Steps:

1. **Run the build script:**
   ```bash
   cd /Users/tanyastrauss/Spect-IT/SpectITMobile
   ./BUILD_AND_UPLOAD_NOW.sh
   ```
   Select option 1

2. **Set up credentials:**
   - Apple ID: `tanstrauss@gmail.com`
   - Password: Your password or app-specific password
   - If 2FA enabled, get app-specific password:
     - Go to: https://appleid.apple.com/account/manage
     - Security → App-Specific Passwords
     - Generate password for "EAS Build"

3. **Build starts automatically:**
   - Builds in cloud
   - Handles signing
   - Uploads to App Store Connect

4. **Monitor progress:**
   - Terminal shows progress
   - Or: https://expo.dev/accounts/tstrauss/projects/spectit-mobile/builds

5. **Wait for processing:**
   - Build uploads automatically
   - Takes 15-30 minutes to process
   - Check: https://appstoreconnect.apple.com/teams/c5c5f5d2-8ebe-443d-957f-b4038c7db237/apps/6755681856/testflight

---

### Option 2: Xcode Build (Local)

**Best for:**
- ✅ More control over build
- ✅ See build progress locally
- ✅ Familiar Xcode interface

**Time:** 10-20 minutes (build) + 15-30 minutes (processing)

#### Steps:

1. **Run the build script:**
   ```bash
   cd /Users/tanyastrauss/Spect-IT/SpectITMobile
   ./BUILD_AND_UPLOAD_NOW.sh
   ```
   Select option 2

2. **Xcode opens automatically**

3. **Configure Signing:**
   - Click **"SpectIT"** project (blue icon) in left sidebar
   - Select **"SpectIT"** under TARGETS
   - Go to **"Signing & Capabilities"** tab
   - ✅ Check **"Automatically manage signing"**
   - Select **Team:** "Tanya Strauss (UHMT4AX5T7)"
   - Verify **Bundle ID:** `com.spectit.app`

4. **Select Device:**
   - In top toolbar, select **"Any iOS Device"** (not simulator)

5. **Archive:**
   - **Product → Archive**
   - Wait 5-15 minutes for archive

6. **Distribute:**
   - Organizer window opens automatically
   - Click **"Distribute App"**
   - Select **"App Store Connect"**
   - Click **"Next"**
   - Select **"Upload"**
   - Click **"Next"**
   - Review options, click **"Next"**
   - Sign in with: `tanstrauss@gmail.com`
   - Wait for upload (5-10 minutes)

7. **Wait for processing:**
   - Takes 15-30 minutes
   - Check: https://appstoreconnect.apple.com/teams/c5c5f5d2-8ebe-443d-957f-b4038c7db237/apps/6755681856/testflight

---

## 📊 After Build Uploads

### Step 1: Wait for Processing

**Status Timeline:**
- ⏳ **Processing** → Wait 15-30 minutes
- ✅ **Ready to Submit** → Can proceed with submission
- ❌ **Invalid** → Need to fix issues and rebuild

**Check Status:**
- TestFlight: https://appstoreconnect.apple.com/teams/c5c5f5d2-8ebe-443d-957f-b4038c7db237/apps/6755681856/testflight
- Email updates: tanstrauss@gmail.com

### Step 2: Verify Build Appears

1. Go to TestFlight tab
2. Check **"iOS Builds"** section
3. Look for your build:
   - Version: 1.0
   - Build: 1
   - Status: "Ready to Submit"

### Step 3: Proceed with Submission

Once build is "Ready to Submit":
1. Go to App Store tab
2. Select the build
3. Complete submission form
4. Submit for review

---

## 🔧 Troubleshooting

### Build Fails

**EAS Build:**
- Check error message in terminal
- Verify credentials are correct
- Try: `eas credentials --platform ios` to reconfigure

**Xcode Build:**
- Check signing configuration
- Verify team is selected
- Check Bundle ID matches: `com.spectit.app`
- Try cleaning build: **Product → Clean Build Folder**

### Upload Fails

**Xcode:**
- Check internet connection
- Verify Apple ID credentials
- Try signing out and back in
- Check for Xcode updates

### Build Not Appearing

- Wait longer (can take up to 1 hour)
- Check email for error notifications
- Verify bundle ID matches App Store Connect
- Check team ID is correct: `UHMT4AX5T7`

---

## ✅ Quick Start

**Easiest method:**

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
./BUILD_AND_UPLOAD_NOW.sh
```

Select option 1 (EAS Cloud Build) and follow prompts.

---

## 📱 Important Links

- **TestFlight:** https://appstoreconnect.apple.com/teams/c5c5f5d2-8ebe-443d-957f-b4038c7db237/apps/6755681856/testflight
- **App Store Connect:** https://appstoreconnect.apple.com/teams/c5c5f5d2-8ebe-443d-957f-b4038c7db237/apps/6755681856/appstore
- **EAS Builds:** https://expo.dev/accounts/tstrauss/projects/spectit-mobile/builds
- **Apple ID Management:** https://appleid.apple.com/account/manage

---

**Ready to build? Run the script and follow the prompts!** 🚀

