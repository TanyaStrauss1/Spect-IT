# 🚀 Build for App Store - Terminal Guide

## ✅ Yes! You can build and deploy entirely from terminal!

This guide shows you how to build your iOS app for App Store submission using only terminal commands - no Xcode GUI needed.

---

## 📋 Prerequisites

- ✅ Xcode installed
- ✅ Apple Developer account active
- ✅ Team configured (P7BPRR2MY3)
- ✅ Project built at least once in Xcode (to set up signing)

---

## 🚀 Quick Start

### Option 1: Build Only (Recommended First Time)

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
./BUILD_FOR_APP_STORE_TERMINAL.sh
```

**This will:**
- ✅ Clean build folder
- ✅ Create archive (.xcarchive)
- ✅ Export IPA file for App Store
- ✅ Save IPA to: `build/AppStore/SpectIT.ipa`

**Time:** 5-15 minutes

---

### Option 2: Build + Upload (Complete Workflow)

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
./BUILD_AND_UPLOAD_TERMINAL.sh
```

**This will:**
- ✅ Build the app (same as Option 1)
- ✅ Upload directly to App Store Connect
- ✅ Requires Apple ID credentials

---

## 📦 What Gets Created

After building, you'll have:

```
build/
├── SpectIT.xcarchive    # Archive file
├── AppStore/
│   └── SpectIT.ipa      # App Store IPA (this is what you upload)
├── archive.log          # Build logs
├── export.log           # Export logs
└── clean.log            # Clean logs
```

**The `.ipa` file is what you upload to App Store Connect.**

---

## 📤 Uploading to App Store Connect

After building, you have 3 options to upload:

### Option A: Transporter App (Easiest)

1. **Download Transporter** from Mac App Store
2. **Open Transporter**
3. **Drag** `build/AppStore/SpectIT.ipa` into Transporter
4. **Sign in** with: `tanstrauss@gmail.com`
5. **Click "Deliver"**
6. **Wait** for upload (5-10 minutes)

**Advantages:**
- ✅ Visual interface
- ✅ Progress indicator
- ✅ Easy to use

---

### Option B: Xcode Organizer

1. **Open Xcode**
2. **Window → Organizer** (`Cmd + Shift + O`)
3. **Find your archive** (should appear automatically)
4. **Click "Distribute App"**
5. **Select "App Store Connect"**
6. **Follow prompts**

**Advantages:**
- ✅ Integrated with Xcode
- ✅ Handles authentication automatically

---

### Option C: Command Line (xcrun altool)

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile

xcrun altool --upload-app \
    --type ios \
    --file build/AppStore/SpectIT.ipa \
    --username tanstrauss@gmail.com \
    --password "@keychain:Application Loader: tanstrauss@gmail.com"
```

**Note:** Requires app-specific password if 2FA is enabled.

---

## 🔧 Manual Build Steps (If Script Fails)

If the script doesn't work, you can run commands manually:

### Step 1: Clean

```bash
xcodebuild clean \
    -workspace ios/SpectIT.xcworkspace \
    -scheme SpectIT \
    -configuration Release
```

### Step 2: Archive

```bash
xcodebuild archive \
    -workspace ios/SpectIT.xcworkspace \
    -scheme SpectIT \
    -configuration Release \
    -archivePath build/SpectIT.xcarchive \
    -destination "generic/platform=iOS" \
    CODE_SIGN_STYLE="Automatic" \
    DEVELOPMENT_TEAM="P7BPRR2MY3"
```

### Step 3: Export IPA

```bash
xcodebuild -exportArchive \
    -archivePath build/SpectIT.xcarchive \
    -exportPath build/AppStore \
    -exportOptionsPlist ios/ExportOptions.plist
```

---

## ⚠️ Common Issues

### Issue: "No signing certificate found"

**Fix:**
1. Open Xcode once
2. Go to Signing & Capabilities
3. Select your team
4. Let Xcode create certificates
5. Then run terminal build again

---

### Issue: "Team not configured"

**Fix:**
The script uses team ID `P7BPRR2MY3`. If you need a different team:
1. Edit `BUILD_FOR_APP_STORE_TERMINAL.sh`
2. Change `DEVELOPMENT_TEAM="P7BPRR2MY3"` to your team ID

---

### Issue: Archive fails

**Check:**
1. `build/archive.log` for error details
2. Make sure CocoaPods are installed: `cd ios && pod install`
3. Verify workspace exists: `ios/SpectIT.xcworkspace`

---

## 📋 After Upload

Once uploaded to App Store Connect:

1. **Wait 15-30 minutes** for processing
2. **Go to:** https://appstoreconnect.apple.com/apps/6755681856
3. **Click "App Store" tab**
4. **Select your build** in Build section
5. **Complete required fields** (screenshots, description, etc.)
6. **Submit for review**

---

## ✅ Advantages of Terminal Build

- ✅ **No Xcode GUI needed** - pure command line
- ✅ **Automated** - can be scripted
- ✅ **CI/CD friendly** - works in automated pipelines
- ✅ **Faster** - no GUI overhead
- ✅ **Reproducible** - same commands every time

---

## 🔗 Files

- `BUILD_FOR_APP_STORE_TERMINAL.sh` - Build script
- `BUILD_AND_UPLOAD_TERMINAL.sh` - Build + upload script
- `ios/ExportOptions.plist` - Export configuration (auto-created)

---

## 💡 Tips

1. **First time:** Run build in Xcode once to set up signing
2. **Check logs:** If build fails, check `build/*.log` files
3. **Clean build:** Delete `build/` folder for fresh start
4. **Verify IPA:** Check that `.ipa` file exists before uploading

---

**You can build and deploy entirely from terminal! No Xcode GUI needed!**

