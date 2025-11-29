# 🍎 Build Spect-IT App with Xcode

## ✅ Xcode is Now Open

Follow these steps to build your app:

---

## 📋 Step-by-Step Instructions

### 1. Wait for Xcode to Index (2-5 minutes)

- Xcode will automatically start indexing your project
- Wait until the progress bar in the top toolbar completes
- You'll see "Indexing..." in the status bar

---

### 2. Configure Signing & Capabilities

1. **Click the "SpectIT" project** (blue icon) in the left sidebar
2. **Select "SpectIT"** under TARGETS (not PROJECTS)
3. **Click the "Signing & Capabilities" tab**
4. **Check "Automatically manage signing"**
5. **Select your Team:**
   - Team: **Tanya Strauss (P7BPRR2MY3)**
   - If you see a warning, click "Try Again" or "Add Account"
6. **Verify Bundle Identifier:**
   - Should be: `com.spectit.app`
   - If different, change it to `com.spectit.app`

**If you see signing errors:**
- Click "Try Again" - Xcode will automatically create certificates and profiles
- If prompted, sign in with your Apple ID: `tanstrauss@gmail.com`

---

### 3. Select Build Target

1. **In the top toolbar**, click the device selector (next to the Play/Stop buttons)
2. **Select "Any iOS Device"** (NOT a simulator)
   - This is required for creating an archive

---

### 4. Build & Archive

1. **In the menu bar:** `Product → Archive`
   - Or press: `Cmd + B` then `Product → Archive`
2. **Wait for the build to complete** (5-15 minutes)
   - You'll see progress in the top toolbar
   - Check the "Report Navigator" (📊 icon) for detailed progress

**If build fails:**
- Check the error messages in the Issue Navigator (⚠️ icon)
- Common fixes:
  - Clean build folder: `Product → Clean Build Folder` (Shift + Cmd + K)
  - Try building again

---

### 5. Distribute to App Store Connect

Once the archive completes:

1. **Organizer window opens automatically**
   - If not, go to: `Window → Organizer`
2. **Select your archive** (most recent one)
3. **Click "Distribute App"**
4. **Select distribution method:**
   - Choose: **"App Store Connect"**
   - Click "Next"
5. **Select distribution options:**
   - Choose: **"Upload"** (recommended)
   - Click "Next"
6. **Review options:**
   - ✅ "Upload your app's symbols" (recommended)
   - ✅ "Manage Version and Build Number" (if needed)
   - Click "Next"
7. **Review and upload:**
   - Review the summary
   - Click "Upload"
   - Wait for upload to complete (5-10 minutes)

---

## 🎯 Quick Checklist

- [ ] Xcode finished indexing
- [ ] Signing configured (Team: P7BPRR2MY3)
- [ ] Bundle ID: `com.spectit.app`
- [ ] Selected "Any iOS Device"
- [ ] Archive created successfully
- [ ] Uploaded to App Store Connect

---

## 📱 After Upload

1. **Go to App Store Connect:**
   - https://appstoreconnect.apple.com
   - Sign in with your Apple ID

2. **Find your app:**
   - My Apps → Spect-IT
   - TestFlight tab

3. **Wait for processing:**
   - Build will appear in 10-30 minutes
   - Status: "Processing" → "Ready to Submit"

4. **Submit for Review:**
   - Go to App Store tab
   - Select the build
   - Submit for review

---

## 🔧 Troubleshooting

### "No signing certificate found"
- Go to Signing & Capabilities
- Click "Try Again"
- Xcode will create certificates automatically

### "Provisioning profile not found"
- Enable "Automatically manage signing"
- Select your team
- Click "Try Again"

### Build errors
- Clean build folder: `Product → Clean Build Folder`
- Check for missing dependencies
- Review error messages in Issue Navigator

### Archive button is grayed out
- Make sure "Any iOS Device" is selected (not simulator)
- Wait for indexing to complete

---

## 💡 Tips

- **First build takes longer** (15-20 minutes) - be patient!
- **Keep Xcode open** during the build
- **Check the Report Navigator** for detailed progress
- **Don't close Xcode** while building

---

**Need help?** Check the build logs in the Report Navigator (📊 icon in left sidebar)

