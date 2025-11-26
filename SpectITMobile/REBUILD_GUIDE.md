# 🔄 Rebuild and Submit Spect-IT App

## ❌ Problem: App Not Submitting

The app isn't submitting successfully. Let's rebuild from scratch.

---

## ✅ Solution: Clean Rebuild

### Step 1: Clean Everything

**Run the rebuild script:**
```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
chmod +x REBUILD_AND_SUBMIT.sh
./REBUILD_AND_SUBMIT.sh
```

**Or manually:**
```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
rm -rf build/ ios/build/
rm -rf ~/Library/Developer/Xcode/DerivedData/SpectIT-*
rm -rf ~/Library/Developer/Xcode/Archives/*
```

---

### Step 2: Open Xcode

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
open ios/SpectIT.xcworkspace
```

**Important:** Open `.xcworkspace`, NOT `.xcodeproj`!

---

### Step 3: Clean Build Folder

**In Xcode:**
1. **Product → Clean Build Folder** (⌘⇧K)
2. Wait for clean to complete
3. Status bar should show "Clean Succeeded"

---

### Step 4: Verify Signing

**In Xcode:**
1. **Click project** (blue icon) in left sidebar
2. **Select "SpectIT"** target
3. **"Signing & Capabilities"** tab
4. ✅ **CHECK "Automatically manage signing"**
5. **Team:** Select `UHMT4AX5T7` (or your team)
6. **Bundle Identifier:** `com.spectit.app`
7. **Wait for green checkmark** ✅

**If errors:**
- Click "Try Again"
- Make sure team is selected
- Check Bundle ID matches App Store Connect

---

### Step 5: Select Build Target

**In Xcode top toolbar:**
1. **Click device selector** (shows current device)
2. **Select "Any iOS Device"**
3. ⚠️ **NOT a simulator** - must be device for App Store
4. **Scheme:** "SpectIT"

---

### Step 6: Archive

**In Xcode:**
1. **Product → Archive**
2. **Wait 5-15 minutes** for build
3. Watch progress in status bar
4. **Organizer window** opens automatically when done

**If build fails:**
- Check error messages (red indicators)
- Common fixes:
  - **Product → Clean Build Folder** (⌘⇧K)
  - Check signing configuration
  - Verify team is selected
  - Try again

---

### Step 7: Distribute to App Store Connect

**In Organizer window:**

1. **Select your archive** (latest one at top)

2. **Click "Distribute App"**

3. **Choose "App Store Connect"**
   - Click "Next"

4. **Choose "Upload"**
   - Not "Export"
   - Click "Next"

5. **Select "Automatically manage signing"**
   - Click "Next"

6. **Review summary:**
   - App: Spect-IT
   - Bundle ID: com.spectit.app
   - Version: (your version)
   - Click "Next"

7. **Click "Upload"**

8. **Wait for upload:**
   - Takes 5-10 minutes
   - Progress shown in Xcode
   - See "Upload Successful" ✅

---

### Step 8: Verify Upload

**After upload:**

1. **Go to TestFlight:**
   https://appstoreconnect.apple.com/teams/c5c5f5d2-8ebe-443d-957f-b4038c7db237/apps/6755681856/testflight

2. **Wait 15-30 minutes** for processing:
   - Status: "Processing" → "Ready to Submit"
   - Build appears in TestFlight tab

3. **Check build status:**
   - Should show "Ready to Submit"
   - If "Invalid", check build logs

---

## 🔧 Troubleshooting

### Issue: "Archive Failed"

**Fix:**
1. **Product → Clean Build Folder** (⌘⇧K)
2. Check signing configuration
3. Verify team is selected
4. Make sure "Any iOS Device" is selected
5. Try again

### Issue: "Upload Failed"

**Fix:**
1. Check internet connection
2. Verify Apple ID credentials
3. Check App Store Connect access
4. Try again

### Issue: "Invalid Build"

**Fix:**
1. Check build logs in App Store Connect
2. Verify Bundle ID matches
3. Check version/build number
4. Rebuild with clean

### Issue: "Signing Error"

**Fix:**
1. **Product → Clean Build Folder** (⌘⇧K)
2. Go to Signing & Capabilities
3. Uncheck and recheck "Automatically manage signing"
4. Select team again
5. Wait for green checkmark
6. Try again

---

## 📋 Quick Checklist

- [ ] Cleaned build folders
- [ ] Opened `.xcworkspace` (not `.xcodeproj`)
- [ ] Cleaned build folder (⌘⇧K)
- [ ] Verified signing (Team: UHMT4AX5T7)
- [ ] Selected "Any iOS Device"
- [ ] Archived successfully
- [ ] Distributed to App Store Connect
- [ ] Upload completed
- [ ] Build processing in TestFlight

---

## 🚀 Alternative: Use EAS Build

**If Xcode build fails, use EAS:**

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
npx eas-cli build --platform ios --profile production
```

**Then:**
1. Download build from EAS
2. Upload manually to App Store Connect
3. Or use EAS Submit

---

## ✅ After Successful Upload

**Next steps:**
1. Wait for processing (15-30 minutes)
2. Go to App Store Connect
3. Select build in TestFlight
4. Submit for review
5. Complete App Store listing
6. Submit for review

---

**Follow these steps to rebuild and submit!** 🔄

