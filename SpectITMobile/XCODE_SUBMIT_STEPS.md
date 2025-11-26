# 🚀 Xcode to App Store - Complete Steps

## Quick Start

Run this script to open Xcode:
```bash
./CREATE_AND_SUBMIT_XCODE.sh
```

---

## 📋 Step-by-Step Guide

### Step 1: Configure Signing in Xcode

1. **Open Xcode** (should open automatically)
2. **Click the project** (blue icon) in the left sidebar
3. **Select "SpectIT" target**
4. **Go to "Signing & Capabilities" tab**
5. **✅ CHECK "Automatically manage signing"**
6. **Under "Team", select:** "Tanya Strauss (P7BPRR2MY3)"
   - If not listed: Xcode → Settings → Accounts → Add Apple ID
   - Sign in with: tanstrauss@gmail.com
7. **Wait for green checkmark** (provisioning profile created)

### Step 2: Select Build Target

1. **At the top toolbar**, click the device selector
2. **Select "Any iOS Device"** (NOT a simulator)
3. **Scheme should be:** "SpectIT"

### Step 3: Archive the App

1. **Product → Archive**
2. **Wait for archive to complete** (5-15 minutes)
   - You'll see progress in the activity viewer
   - Archive will appear in Organizer when done

### Step 4: Distribute to App Store Connect

1. **Window → Organizer** (or Product → Archive → Distribute App)
2. **Select your archive** (should show version 1.0.0, build 1)
3. **Click "Distribute App"**
4. **Choose "App Store Connect"**
5. **Click "Next"**
6. **Choose "Upload"** (not Export)
7. **Click "Next"**
8. **Select "Automatically manage signing"**
9. **Click "Next"**
10. **Review the summary**
11. **Click "Upload"**
12. **Wait for upload to complete** (5-10 minutes)
    - You'll see progress in Xcode
    - Upload completes when you see "Upload Successful"

### Step 5: Submit in App Store Connect

1. **Go to:** https://appstoreconnect.apple.com
2. **Sign in** with: tanstrauss@gmail.com
3. **Click "My Apps"**
4. **Find "Spect-IT"** (or create new if needed)
5. **Click on the app**
6. **Go to "App Store" tab**
7. **Wait for build to process** (15-30 minutes)
   - Status will show "Processing" then "Ready to Submit"
8. **Scroll to "Build" section**
9. **Click "Select a build before you submit your app"**
10. **Select your build** (version 1.0.0, build 1)
11. **Complete required information:**
    - Description (see COMPLETE_SUBMISSION_GUIDE.md)
    - Keywords
    - Screenshots (minimum 3 per device size)
    - Support URL: https://www.spect-it.com
    - Privacy Policy URL: https://www.spect-it.com/privacy-policy
12. **Review all sections** (should show green checkmarks)
13. **Click "Submit for Review"**
14. **Answer export compliance:**
    - Does your app use encryption? → No
15. **Confirm submission**

---

## ✅ Checklist

### Before Archiving
- [ ] Signing configured with Team P7BPRR2MY3
- [ ] Green checkmark in Signing & Capabilities
- [ ] Selected "Any iOS Device" (not simulator)
- [ ] Scheme is "SpectIT"

### After Uploading
- [ ] Upload successful in Xcode
- [ ] Build appears in App Store Connect
- [ ] Build status: "Ready to Submit"

### Before Submitting
- [ ] Build selected in App Store tab
- [ ] Description completed (at least 10 characters)
- [ ] Keywords added
- [ ] Screenshots uploaded (minimum 3 per device size)
- [ ] Support URL provided
- [ ] Privacy Policy URL provided
- [ ] Age Rating completed
- [ ] App Privacy completed
- [ ] All sections show green checkmarks

---

## 🆘 Troubleshooting

### "No profiles found"
- Make sure "Automatically manage signing" is checked
- Select Team: P7BPRR2MY3
- Wait for Xcode to create provisioning profile

### "Unable to log in"
- Xcode → Settings → Accounts
- Add Apple ID: tanstrauss@gmail.com
- Sign in with password or app-specific password

### "Build failed"
- Product → Clean Build Folder (Cmd + Shift + K)
- Try archiving again

### "Upload failed"
- Check internet connection
- Verify signing is correct
- Try uploading again

---

## 📞 Support

**App Store Connect:** https://appstoreconnect.apple.com
**Apple Developer:** https://developer.apple.com/account
**Your Team ID:** P7BPRR2MY3

---

**Good luck with your submission!** 🎉

