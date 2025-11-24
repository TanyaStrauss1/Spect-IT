# 🍎 Xcode Build & Deploy Steps

## ✅ Xcode is Opening...

The Xcode project should be opening now. Follow these steps:

---

## 📋 Step-by-Step Build Process

### Step 1: Wait for Xcode to Load (2-5 minutes)

- Xcode will index the project
- Wait until status bar shows "Ready"
- Check for any red error indicators

---

### Step 2: Configure Signing & Capabilities

1. **Select Project:**
   - Click **"SpectIT"** (blue icon) in the left sidebar

2. **Select Target:**
   - Click **"SpectIT"** under TARGETS

3. **Go to Signing & Capabilities Tab:**
   - Click **"Signing & Capabilities"** tab at the top

4. **Configure Team:**
   - **Team:** Click dropdown and select your team
   - If not signed in:
     - Click **"Add Account..."**
     - Sign in with: `tanstrauss@gmail.com`
     - Enter password
     - Xcode will handle 2FA automatically

5. **Verify Bundle Identifier:**
   - Should be: `com.spectit.app`
   - If different, change it to match

6. **Provisioning Profile:**
   - Xcode will automatically create/manage this
   - Should show: "Xcode Managed Profile"

---

### Step 3: Select Build Target

1. **In Top Toolbar:**
   - Click device selector (next to "SpectIT" scheme)
   - Select **"Any iOS Device"** (NOT a simulator)
   - This is required for App Store builds

---

### Step 4: Build & Archive

1. **Create Archive:**
   - Go to menu: **Product** → **Archive**
   - Or press: `Cmd + Shift + B` (build) then `Cmd + B` (archive)
   - Wait for build to complete (5-15 minutes)

2. **If Build Fails:**
   - Check error messages in Xcode
   - Common fixes:
     - Update signing certificates
     - Clean build: **Product** → **Clean Build Folder** (`Cmd + Shift + K`)
     - Try again

---

### Step 5: Submit to App Store Connect

1. **Organizer Opens:**
   - After archive completes, **Organizer** window opens automatically
   - If not, go to: **Window** → **Organizer**

2. **Select Archive:**
   - Find your latest archive (should be at top)
   - Click **"Distribute App"** button

3. **Distribution Method:**
   - Select: **"App Store Connect"**
   - Click **"Next"**

4. **Distribution Options:**
   - Select: **"Upload"**
   - Click **"Next"**

5. **App Thinning:**
   - Select: **"All compatible device variants"**
   - Click **"Next"**

6. **Review:**
   - Review the summary
   - Click **"Upload"**

7. **Authentication:**
   - Xcode will prompt for Apple ID if needed
   - Sign in with: `tanstrauss@gmail.com`
   - Enter password
   - 2FA code if prompted (Xcode handles this better than terminal)

8. **Upload:**
   - Wait for upload to complete (5-10 minutes)
   - You'll see progress in Organizer
   - Success message when done

---

### Step 6: Complete in App Store Connect

1. **Go to App Store Connect:**
   - https://appstoreconnect.apple.com/apps/6755681856/distribution/ios/version/inflight

2. **Wait for Build:**
   - Build may take 10-30 minutes to appear
   - Refresh the page periodically

3. **Select Build:**
   - Scroll to **"Build"** section
   - Click **"Select a build before you submit your app"**
   - Select your uploaded build
   - Click **"Done"**

4. **Complete App Information:**
   - Add screenshots (required)
   - Fill in description
   - Add keywords
   - Complete all required fields

5. **Submit for Review:**
   - Click **"Submit for Review"**

---

## ✅ Advantages of Xcode Method

- ✅ **Better Authentication** - Xcode handles Apple ID login smoothly
- ✅ **Visual Interface** - See what's happening clearly
- ✅ **Automatic Certificates** - Xcode manages signing automatically
- ✅ **Direct Upload** - No need for separate submit command
- ✅ **Error Messages** - Clear visual feedback

---

## ⚠️ Troubleshooting

### "No signing certificate found"
- Go to: **Xcode** → **Preferences** → **Accounts**
- Select your Apple ID
- Click **"Download Manual Profiles"**

### "Bundle identifier already exists"
- Make sure Bundle ID is: `com.spectit.app`
- This should match your App Store Connect app

### "Archive failed"
- Clean build: **Product** → **Clean Build Folder** (`Cmd + Shift + K`)
- Try again
- Check for specific error messages in Xcode

### "Upload failed"
- Check internet connection
- Try again
- Verify Apple ID credentials

---

## 📊 Monitor Progress

- **During Upload:** Progress shown in Xcode Organizer
- **After Upload:** Check App Store Connect:
  - https://appstoreconnect.apple.com/apps/6755681856/distribution/ios/version/inflight

---

## 🎯 Quick Reference

- **Open Project:** `open ios/SpectIT.xcodeproj`
- **Clean Build:** `Cmd + Shift + K`
- **Archive:** `Product` → `Archive`
- **Organizer:** `Window` → `Organizer`

---

**Xcode should be opening now. Follow the steps above to build and deploy!**

