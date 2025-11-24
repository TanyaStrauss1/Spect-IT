# 🚀 Automatic Build & Deploy Guide

## ✅ Available Scripts

I've created **3 automatic build scripts** for you:

---

## 📋 Script 1: RUN_AUTO_BUILD_NOW.sh (Recommended)

**Simplest method - handles everything interactively**

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
./RUN_AUTO_BUILD_NOW.sh
```

**What it does:**
1. ✅ Builds iOS app (15-30 minutes)
2. ✅ Submits to App Store Connect automatically
3. ✅ Prompts for credentials when needed

**When to use:** Best for most cases - handles authentication interactively

---

## 📋 Script 2: AUTO_BUILD_AND_DEPLOY_XCODE.sh

**Full Xcode CLI method - uses xcodebuild**

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
./AUTO_BUILD_AND_DEPLOY_XCODE.sh
```

**What it does:**
1. ✅ Builds using `xcodebuild archive`
2. ✅ Exports for App Store
3. ✅ Uploads using `xcrun altool`
4. ✅ Uses Xcode's built-in authentication

**When to use:** If you want full control over the build process

**Requirements:**
- Xcode installed
- Apple ID signed into Xcode
- May need app-specific password if 2FA enabled

---

## 📋 Script 3: AUTO_DEPLOY_SIMPLE.sh

**EAS non-interactive (requires credentials setup first)**

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
./AUTO_DEPLOY_SIMPLE.sh
```

**What it does:**
1. ✅ Builds with EAS (cloud)
2. ✅ Submits automatically
3. ⚠️ Requires credentials to be set up first

**When to use:** After you've set up credentials interactively once

---

## 🎯 Quick Start (Recommended)

### Run This Now:

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
./RUN_AUTO_BUILD_NOW.sh
```

**You'll be prompted for:**
- Apple ID: `tanstrauss@gmail.com`
- Password: [Your password]
- 2FA Code: [If enabled]

**Then it will:**
- Build automatically (15-30 minutes)
- Submit automatically when done

---

## 📊 Monitor Progress

**During Build:**
- https://expo.dev/accounts/tstrauss/projects/spectit-mobile/builds

**After Submission:**
- https://appstoreconnect.apple.com/apps/6755681856/distribution/ios/version/inflight

---

## ⚠️ Troubleshooting

### "Credentials not set up"
- Run the script interactively first
- Enter credentials when prompted
- They'll be saved for future use

### "Build failed"
- Check error messages
- Verify Apple ID credentials
- Check if 2FA requires app-specific password

### "Upload failed"
- Try manual upload via Transporter app
- Or use Xcode Organizer

---

## 🔄 Complete Workflow

1. **Run script:**
   ```bash
   ./RUN_AUTO_BUILD_NOW.sh
   ```

2. **Enter credentials** when prompted

3. **Wait for build** (15-30 minutes)

4. **Wait for upload** (5-10 minutes)

5. **Go to App Store Connect:**
   - https://appstoreconnect.apple.com/apps/6755681856/distribution/ios/version/inflight

6. **Select build** (may take 10-30 minutes to appear)

7. **Complete app listing** and submit for review

---

**Run `./RUN_AUTO_BUILD_NOW.sh` to start the automatic build and deploy!**

