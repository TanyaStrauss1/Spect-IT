# 📤 Submit App from Xcode to App Store Connect

## ✅ Prerequisites

Before submitting from Xcode, ensure you have:

- ✅ App built and archived in Xcode
- ✅ Apple Developer Program membership active
- ✅ App Store Connect app created
- ✅ Bundle ID: `com.spectit.app`
- ✅ Team ID: `P7BPRR2MY3`

---

## 🚀 Step-by-Step: Submit from Xcode

### Step 1: Open Your Project in Xcode

1. **Open Xcode**
2. **Open your project:**
   - If using Expo: Open `SpectITMobile/ios` folder (after running `npx expo prebuild`)
   - Or open the `.xcworkspace` file

### Step 2: Archive Your App

1. **Select "Any iOS Device" or "Generic iOS Device"** in the device selector (top toolbar)
2. **Go to:** Product → Archive
3. **Wait for archive to complete** (5-10 minutes)

### Step 3: Upload to App Store Connect

1. **Organizer window opens automatically** (Window → Organizer if it doesn't)
2. **Select your archive** (latest one)
3. **Click "Distribute App"**
4. **Choose distribution method:**
   - Select: **"App Store Connect"**
   - Click **"Next"**

5. **Choose distribution options:**
   - Select: **"Upload"**
   - Click **"Next"**

6. **Select distribution options:**
   - ✅ **"Upload your app's symbols"** (recommended)
   - ✅ **"Manage Version and Build Number"** (if needed)
   - Click **"Next"**

7. **Review and upload:**
   - Review the summary
   - Click **"Upload"**
   - Wait for upload to complete (5-15 minutes)

---

## 📋 After Upload

### Step 4: Complete App Listing in App Store Connect

1. **Go to App Store Connect:**
   - https://appstoreconnect.apple.com/apps/6755681856

2. **Wait for processing:**
   - Build will appear in "TestFlight" tab first
   - Then move to "App Store" tab (15-30 minutes)

3. **Complete app information:**
   - Screenshots
   - Description
   - Privacy Policy URL: `https://tanyastrauss1.github.io/Spect-IT/privacy-policy.html`
   - Keywords
   - Support URL

4. **Submit for review:**
   - Go to "App Store" tab
   - Click "Submit for Review"

---

## 🔄 Alternative: Use EAS Submit (Recommended)

If you built with EAS, use this instead:

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
eas submit --platform ios --latest
```

This is easier and handles credentials automatically.

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

---

## 📊 Check Upload Status

**In App Store Connect:**
- Go to: https://appstoreconnect.apple.com/apps/6755681856/testflight/ios
- Check "Builds" section
- Status will show: "Processing" → "Ready to Submit"

---

## ✅ Quick Checklist

- [ ] App archived in Xcode
- [ ] Apple Developer account signed in
- [ ] Archive distributed to App Store Connect
- [ ] Upload completed successfully
- [ ] Build appears in App Store Connect
- [ ] App listing information completed
- [ ] Privacy policy URL added
- [ ] Screenshots uploaded
- [ ] Submitted for review

---

**Your app will be available in TestFlight within 15-30 minutes after upload!**

