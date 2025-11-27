# 🍎 Build in Xcode → Deploy to Cloud (App Store Connect)

## 🚀 Complete Guide: Build Locally, Deploy to Cloud

This guide shows you how to build your app in Xcode and upload it to App Store Connect (cloud).

---

## ✅ Step 1: Open Xcode

**Run the script:**
```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
./BUILD_XCODE_DEPLOY_CLOUD.sh
```

**Or manually:**
```bash
open ios/SpectIT.xcworkspace
```

**Wait 2-5 minutes** for Xcode to finish indexing.

---

## ✅ Step 2: Verify Signing (Critical!)

1. **Click "SpectIT" project** (blue icon in left sidebar)
2. **Select "SpectIT" target** (under TARGETS)
3. **Go to "Signing & Capabilities" tab**

4. **Configure Signing:**
   - ✅ **CHECK "Automatically manage signing"**
   - **Team:** Select "Tanya Strauss (P7BPRR2MY3)"
   - **Bundle Identifier:** Should show `com.spectit.app`
   - **Wait for green checkmark** ✅

**If you see errors:**
- Click **"Try Again"** button
- Or: Xcode → Settings → Accounts → Download Manual Profiles
- Verify team is selected

**If team not listed:**
- Xcode → Settings → Accounts
- Click "+" → Add Apple ID: `tanstrauss@gmail.com`
- Sign in and select team

---

## ✅ Step 3: Select Destination

**In Xcode top toolbar:**
1. Click device selector (shows current device/simulator)
2. Select **"Any iOS Device"**
3. ⚠️ **NOT a simulator** - must be device for Archive

**Why:** "Any iOS Device" tells Xcode to build for App Store distribution.

---

## ✅ Step 4: Clean Build Folder

**In Xcode:**
1. **Product → Clean Build Folder** (⌘⇧K)
2. Wait for clean to complete
3. Status bar should show "Clean Succeeded"

**Why:** Removes old build artifacts that might cause issues.

---

## ✅ Step 5: Archive

**In Xcode:**
1. **Product → Archive**
2. **Wait 5-15 minutes** for build
3. Watch progress in status bar
4. **Archive window opens automatically** when done

**What happens:**
- Xcode builds your app
- Creates archive (.xcarchive file)
- Validates signing
- Ready for distribution

---

## ✅ Step 6: Distribute to App Store Connect (Cloud)

**In Archive window (Organizer):**

1. **Click "Distribute App"** button
2. **Select "App Store Connect"**
3. **Click "Next"**

4. **Choose distribution method:**
   - **"Upload"** ✅ (Recommended - uploads directly)
   - Or: "Export" (saves .ipa file locally)

5. **Select distribution options:**
   - ✅ **"Upload your app's symbols"** (for crash reports)
   - ✅ **"Manage Version and Build Number"** (if needed)
   - Click "Next"

6. **Review signing:**
   - Should show: "Automatically manage signing"
   - Team: P7BPRR2MY3
   - Click "Next"

7. **Review summary:**
   - Verify Bundle ID: com.spectit.app
   - Verify Team: P7BPRR2MY3
   - Click "Upload"

8. **Wait for upload:**
   - Progress shown in Xcode
   - Takes 5-10 minutes
   - Status: "Upload Succeeded" ✅

---

## ✅ Step 7: Verify Upload in App Store Connect

**Check App Store Connect:**

1. **Go to:** https://appstoreconnect.apple.com/apps/6755681856
2. **Navigate to:**
   - **TestFlight** tab (for testing)
   - Or **App Store** tab (for submission)

3. **Look for your build:**
   - Should appear within 10-30 minutes
   - Status: "Processing" → "Ready to Submit"

4. **If build appears:**
   - ✅ Upload successful!
   - Ready for TestFlight or App Store submission

---

## 🔍 Troubleshooting

### Issue: "No Team Selected"

**Fix:**
- Signing & Capabilities → Select Team: P7BPRR2MY3
- If not listed: Xcode → Settings → Accounts → Add Apple ID

### Issue: "Code Signing Error"

**Fix:**
- Signing & Capabilities → Click "Try Again"
- Verify "Automatically manage signing" is checked
- Wait for green checkmark

### Issue: "Archive Failed"

**Fix:**
- Product → Clean Build Folder
- Check Xcode console for exact error
- Verify signing configuration
- Try again

### Issue: "Upload Failed"

**Fix:**
- Check internet connection
- Verify Apple ID credentials
- Check App Store Connect status
- Try upload again

### Issue: "Build Not Appearing in App Store Connect"

**Fix:**
- Wait 10-30 minutes (processing takes time)
- Check TestFlight tab (not just App Store tab)
- Verify Bundle ID matches App Store Connect app
- Check email for any notifications

---

## 📱 After Successful Upload

### Option 1: TestFlight (Testing)

1. **Go to:** https://appstoreconnect.apple.com/apps/6755681856/testflight/ios
2. **Select build**
3. **Add testers** (if needed)
4. **Test the app**

### Option 2: App Store (Production)

1. **Go to:** https://appstoreconnect.apple.com/apps/6755681856
2. **App Store** tab
3. **Select version**
4. **Select build**
5. **Complete app information**
6. **Submit for review**

---

## ✅ Success Checklist

- [ ] Xcode opens without errors
- [ ] Signing shows green checkmark
- [ ] Destination: "Any iOS Device"
- [ ] Clean build folder completed
- [ ] Archive completed successfully
- [ ] Archive window opened
- [ ] "Distribute App" clicked
- [ ] "App Store Connect" selected
- [ ] "Upload" selected
- [ ] Upload completed successfully
- [ ] Build appears in App Store Connect

---

## 🚀 Quick Commands

**Open Xcode:**
```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
open ios/SpectIT.xcworkspace
```

**Or run script:**
```bash
./BUILD_XCODE_DEPLOY_CLOUD.sh
```

---

## 🔗 Important Links

- **App Store Connect:** https://appstoreconnect.apple.com/apps/6755681856
- **TestFlight:** https://appstoreconnect.apple.com/apps/6755681856/testflight/ios
- **Apple Developer:** https://developer.apple.com/account

---

**Follow the steps above in Xcode to build and deploy to cloud!** 🚀

