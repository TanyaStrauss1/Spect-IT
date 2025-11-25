# 📤 Upload to App Store with Transporter (Option 1)

## ✅ Step-by-Step Guide

### Prerequisites

- ✅ IPA file created (from build script)
- ✅ Transporter app installed (from Mac App Store)
- ✅ Apple ID credentials ready

---

## 📦 Step 1: Build the App

**First, create the IPA file:**

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
./BUILD_FOR_APP_STORE_TERMINAL.sh
```

**Wait for build to complete** (5-15 minutes)

**IPA will be at:** `build/AppStore/SpectIT.ipa`

---

## 📥 Step 2: Install Transporter

1. **Open Mac App Store**
2. **Search for:** "Transporter"
3. **Install** the app (it's free, by Apple)
4. **Open Transporter** from Applications

---

## 🚀 Step 3: Upload with Transporter

### 3.1: Open Transporter

- **Launch Transporter** app
- Sign in with: `tanstrauss@gmail.com`
- Enter password (or app-specific password if 2FA enabled)

### 3.2: Add IPA File

**Method A: Drag & Drop**
1. **Open Finder**
2. **Navigate to:** `/Users/tanyastrauss/Spect-IT/SpectITMobile/build/AppStore/`
3. **Find:** `SpectIT.ipa`
4. **Drag** the IPA file into Transporter window

**Method B: Click Add**
1. **Click "+" button** in Transporter
2. **Browse** to: `build/AppStore/SpectIT.ipa`
3. **Select** the file
4. **Click "Open"**

### 3.3: Verify Information

Transporter will show:
- ✅ **App Name:** Spect-IT
- ✅ **Version:** 1.0.0
- ✅ **Build:** 1
- ✅ **Bundle ID:** com.spectit.app

**Verify these are correct!**

### 3.4: Deliver

1. **Click "Deliver"** button (bottom right)
2. **Wait** for upload (5-10 minutes)
3. **Progress bar** will show upload status

---

## ✅ Step 4: Verify Upload

### Check App Store Connect

1. **Go to:** https://appstoreconnect.apple.com/apps/6755681856
2. **Click "TestFlight" tab**
3. **Look for your build** in "iOS Builds" section
4. **Status will show:** "Processing" → "Ready to Submit"

**Processing time:** 15-30 minutes typically

---

## 📋 After Upload Completes

### Step 5: Select Build in App Store

1. **Go to "App Store" tab** (not TestFlight)
2. **Scroll to "Build" section**
3. **Click "Select a build before you submit your app"**
4. **Wait** for builds to load
5. **Select** your build (should show "Ready to Submit")
6. **Click "Done"**

### Step 6: Complete Required Fields

- [ ] Screenshots (minimum 3 per device size)
- [ ] App Description
- [ ] Privacy Policy URL: `https://tanyastrauss1.github.io/Spect-IT/privacy-policy.html`
- [ ] Support URL: `https://www.spect-it.com`
- [ ] Category: Health & Fitness or Medical
- [ ] Age Rating: Complete questionnaire

### Step 7: Submit for Review

1. **Click "Submit for Review"** button (top right)
2. **Confirm submission**
3. **Wait for Apple's review** (typically 1-3 days)

---

## ⚠️ Common Issues

### Issue: "Invalid Bundle"

**Causes:**
- Build errors
- Missing required files
- Code signing issues

**Fix:**
1. Check build logs: `build/archive.log` and `build/export.log`
2. Rebuild the app
3. Verify signing in Xcode

---

### Issue: Upload Fails

**Causes:**
- Network issues
- Authentication problems
- File corruption

**Fix:**
1. Check internet connection
2. Verify Apple ID credentials
3. Try uploading again
4. If still fails, use Xcode Organizer instead

---

### Issue: Build Not Appearing

**Causes:**
- Still processing (wait 15-30 minutes)
- Upload failed silently
- Wrong bundle ID

**Fix:**
1. Wait longer (can take up to 1 hour)
2. Check Transporter for error messages
3. Verify bundle ID matches: `com.spectit.app`

---

## 💡 Tips

1. **Keep Transporter open** during upload
2. **Don't close** until upload completes
3. **Check progress bar** for status
4. **Save IPA file** as backup before uploading
5. **Check email** for App Store Connect notifications

---

## 🔗 Quick Links

- **Transporter:** Mac App Store
- **App Store Connect:** https://appstoreconnect.apple.com/apps/6755681856
- **TestFlight:** https://appstoreconnect.apple.com/apps/6755681856/testflight/ios

---

## 📋 Checklist

- [ ] IPA file created (`build/AppStore/SpectIT.ipa`)
- [ ] Transporter app installed
- [ ] Signed in to Transporter
- [ ] IPA file added to Transporter
- [ ] Information verified
- [ ] Upload started
- [ ] Upload completed
- [ ] Build appears in TestFlight (15-30 min wait)
- [ ] Build selected in App Store tab
- [ ] Required fields completed
- [ ] Submitted for review

---

**Transporter is the easiest way to upload your app to App Store Connect!**

