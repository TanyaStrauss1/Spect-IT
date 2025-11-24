# 🔨 Xcode Build - Step by Step Guide

**You selected: Option 2 - Xcode Build (Local)**

---

## 📋 Step-by-Step Instructions

### Step 1: Xcode is Opening

Xcode should be opening now. Wait for it to fully load (2-5 minutes).

**What to check:**
- Xcode window appears
- Project loads in left sidebar
- No red error indicators
- Status bar shows "Ready"

---

### Step 2: Verify Scheme

**In Xcode top toolbar:**

1. **Look at scheme dropdown** (top left, next to device selector)
2. **Should show:** `SpectIT`
3. **If it shows "Spect" or something else:**
   - Click the scheme dropdown
   - Select `SpectIT` from the list
   - If `SpectIT` not in list:
     - Product → Scheme → Manage Schemes
     - Find `SpectIT` scheme
     - Make sure it's checked/shared

---

### Step 3: Select Build Target

**In Xcode top toolbar:**

1. **Click device selector** (next to scheme)
2. **Select:** `Any iOS Device` (NOT a simulator)
   - This is required for App Store builds
   - Simulators won't work for App Store submission

---

### Step 4: Configure Signing & Capabilities

1. **Click project** (blue icon) in left sidebar
2. **Select "SpectIT" target** (under TARGETS)
3. **Go to "Signing & Capabilities" tab**
4. **Verify:**
   - **Team:** Should show your team (P7BPRR2MY3)
   - **Bundle Identifier:** `com.spectit.app`
   - **Provisioning Profile:** Should be "Xcode Managed Profile"

**If team is missing:**
- Click "Add Account..."
- Sign in with: `tanstrauss@gmail.com`
- Xcode will handle 2FA automatically

---

### Step 5: Clean Build Folder

**Before building, clean everything:**

1. **Menu:** Product → Clean Build Folder
2. **Keyboard:** `Cmd + Shift + K`
3. **Wait** for cleanup to complete

---

### Step 6: Create Archive

1. **Menu:** Product → Archive
2. **Keyboard:** `Cmd + B` (build) then Product → Archive
3. **Wait** for build to complete (5-15 minutes)

**What you'll see:**
- Build progress in top status bar
- Build log in bottom panel
- "Archive Succeeded" when done

**If build fails:**
- Check error messages
- Common fixes:
  - Clean build folder again
  - Check signing/certificates
  - Verify all dependencies installed

---

### Step 7: Distribute to App Store Connect

**After archive completes:**

1. **Organizer window opens automatically**
   - If not: Window → Organizer
2. **Select your archive** (should be at top, latest one)
3. **Click "Distribute App"** button
4. **Choose:** "App Store Connect"
5. **Click "Next"**
6. **Choose:** "Upload"
7. **Click "Next"**
8. **Distribution options:**
   - Leave defaults
   - Click "Next"
9. **Review:**
   - Check all information
   - Click "Upload"
10. **Wait for upload** (5-10 minutes)

**During upload:**
- Progress bar shows upload status
- Don't close Xcode
- Wait for "Upload Succeeded" message

---

### Step 8: Wait for Processing

**After upload:**

1. **Go to App Store Connect:**
   - https://appstoreconnect.apple.com/apps/6755681856
2. **Click "TestFlight" tab**
3. **Check build status:**
   - ⏳ "Processing" - Still being processed (wait 15-30 minutes)
   - ✅ "Ready to Submit" - Ready to use
   - ❌ "Invalid" - Build has errors (check details)

---

### Step 9: Select Build in App Store Tab

**Once build shows "Ready to Submit":**

1. **Go to "App Store" tab** (NOT TestFlight)
2. **Scroll to "Build" section**
3. **Click:** "Select a build before you submit your app"
4. **Wait** for builds to load (10-30 seconds)
5. **Select your build:**
   - Look for build number/version
   - Status: "Ready to Submit"
   - Click on it to select
6. **Click "Done"**

---

### Step 10: Complete Required Fields

**After selecting build, complete:**

- [ ] **App Description** (minimum 10 characters)
- [ ] **Support URL:** `https://www.spect-it.com`
- [ ] **Privacy Policy URL:** `https://tanyastrauss1.github.io/Spect-IT/privacy-policy.html`
- [ ] **Category:** Health & Fitness or Medical
- [ ] **Age Rating:** Complete questionnaire
- [ ] **Screenshots:** Minimum 3 per device size

---

### Step 11: Submit for Review

1. **Review all information**
2. **Click "Submit for Review"** (top right, blue button)
3. **Confirm submission**
4. **Wait for review** (1-3 days typically)

---

## ⚠️ Troubleshooting

### Issue: Scheme shows "Spect" instead of "SpectIT"

**Fix:**
1. Click scheme dropdown
2. Select "SpectIT"
3. If not in list: Product → Scheme → Manage Schemes → Add "SpectIT"

### Issue: Build fails with signing errors

**Fix:**
1. Go to Signing & Capabilities
2. Check Team is selected
3. Verify Bundle ID: `com.spectit.app`
4. Try: Product → Clean Build Folder
5. Try again

### Issue: Archive button is grayed out

**Fix:**
1. Make sure "Any iOS Device" is selected (not simulator)
2. Clean build folder
3. Close and reopen Xcode
4. Try again

### Issue: Upload fails

**Fix:**
1. Check internet connection
2. Verify Apple ID credentials
3. Try uploading again
4. Check App Store Connect for errors

---

## ✅ Quick Checklist

Before archiving:
- [ ] Scheme: "SpectIT" (not "Spect")
- [ ] Target: "Any iOS Device"
- [ ] Team: Selected (P7BPRR2MY3)
- [ ] Bundle ID: com.spectit.app
- [ ] Clean build folder completed
- [ ] No red errors in project

After archiving:
- [ ] Archive created successfully
- [ ] Upload to App Store Connect completed
- [ ] Build appears in TestFlight tab
- [ ] Build status: "Ready to Submit"
- [ ] Build selected in App Store tab
- [ ] Required fields completed
- [ ] Submitted for review

---

## 📊 Expected Timeline

- **Xcode load:** 2-5 minutes
- **Build/Archive:** 5-15 minutes
- **Upload:** 5-10 minutes
- **Processing:** 15-30 minutes
- **Total:** ~30-60 minutes

---

## 🔗 Quick Links

- **App Store Connect:** https://appstoreconnect.apple.com/apps/6755681856
- **TestFlight:** https://appstoreconnect.apple.com/apps/6755681856/testflight/ios
- **App Store Tab:** https://appstoreconnect.apple.com/apps/6755681856/appstore/ios

---

**Follow these steps in Xcode, and you'll have your app uploaded to App Store Connect! 🚀**

