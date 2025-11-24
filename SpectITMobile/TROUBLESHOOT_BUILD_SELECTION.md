# 🔧 Troubleshoot "You must choose a build" Error

## ❌ Error Message

"Unable to Add for Review. The items below are required to start the review process: You must choose a build."

---

## 🔍 Step-by-Step Troubleshooting

### Step 1: Verify Build Was Uploaded

**Check if build exists:**

1. **Go to App Store Connect:**
   - https://appstoreconnect.apple.com/apps/6755681856

2. **Click "TestFlight" tab** (top navigation)

3. **Check for builds:**
   - Look in "iOS Builds" section
   - Should see your build listed
   - Status will be: "Processing" or "Ready to Submit"

**If no builds appear:**
- Build may not have been uploaded
- Upload a new build first
- See: Upload build instructions below

---

### Step 2: Wait for Build Processing

**Builds need time to process:**

- **Processing Time:** 15-30 minutes typically
- **Can take up to:** 1 hour in some cases

**Check build status:**
1. Go to **TestFlight** tab
2. Find your build
3. Status will show:
   - ⏳ **"Processing"** - Still being processed (wait)
   - ✅ **"Ready to Submit"** - Ready to use
   - ❌ **"Invalid"** - Build has errors (check details)

**Action:**
- If status is "Processing" → **Wait 15-30 minutes**
- Refresh the page periodically
- Build will move to "App Store" tab when ready

---

### Step 3: Select Build in App Store Tab

**Important:** Build must be selected in **"App Store"** tab, not TestFlight!

1. **Go to "App Store" tab** (top navigation)
   - NOT "TestFlight" tab
   - NOT "App Information" tab
   - Must be **"App Store"** tab

2. **Scroll down to "Build" section**
   - Look for section titled "Build"
   - Should be below "App Preview and Screenshots"

3. **Click the button:**
   - Button text: **"Select a build before you submit your app"**
   - OR: **"+" button** (if no build selected)
   - OR: **"Choose a build"** link

4. **Wait for builds to load**
   - May take 10-30 seconds
   - Builds list will appear in modal/popup

5. **Select your build:**
   - Look for build number (e.g., "1.0.0 (1)")
   - Status should be "Ready to Submit"
   - Click on the build to select it

6. **Click "Done" or "Save"**
   - Build should now appear in "Build" section
   - Status should show "Ready to Submit"

---

### Step 4: Verify Build is Selected

**After selecting build, verify:**

1. **In "App Store" tab:**
   - Scroll to "Build" section
   - Should see your build listed
   - Should NOT see "Select a build" button anymore

2. **Build information should show:**
   - Build number (e.g., "1.0.0 (1)")
   - Status: "Ready to Submit"
   - Date uploaded

**If build is selected:**
- ✅ You can now proceed to submit
- ✅ "Submit for Review" button should be enabled (after completing other required fields)

---

## ⚠️ Common Issues & Solutions

### Issue 1: "No builds available" in selection

**Causes:**
- Build still processing
- Build failed processing
- Build not uploaded

**Solutions:**

1. **Check TestFlight tab:**
   - Go to TestFlight tab
   - See if build is there
   - Check status

2. **If build is "Processing":**
   - Wait 15-30 minutes
   - Refresh page
   - Try again

3. **If build is "Invalid":**
   - Check build details for errors
   - Fix issues
   - Upload new build

4. **If no build exists:**
   - Upload a new build
   - See upload instructions below

---

### Issue 2: Build appears in TestFlight but not in App Store tab

**This is normal!**

**Solution:**
1. Wait for build to finish processing
2. Build will automatically appear in "App Store" tab when ready
3. Processing takes 15-30 minutes typically
4. Check back later

---

### Issue 3: Build selected but still shows error

**Causes:**
- Build not fully selected
- Page needs refresh
- Other required fields missing

**Solutions:**

1. **Refresh the page:**
   - Press Cmd + R (Mac) or Ctrl + R (Windows)
   - Check if build is still selected

2. **Re-select the build:**
   - Click on build in "Build" section
   - Select again
   - Click "Done"

3. **Check other required fields:**
   - Screenshots (minimum 3)
   - App description
   - Privacy Policy URL
   - Support URL
   - Category
   - Age rating

---

### Issue 4: Can't find "Select a build" button

**Possible locations:**

1. **In "Build" section:**
   - Scroll down in "App Store" tab
   - Look for "Build" section header
   - Button should be below it

2. **As a link:**
   - May appear as text link: "Choose a build"
   - Or: "Select build"

3. **As "+" button:**
   - May appear as "+" icon
   - Click to add build

4. **Already selected:**
   - If build is already selected, button won't appear
   - Check if build is listed in "Build" section

---

## 📤 Upload a New Build (If Needed)

**If no build exists or build failed:**

### Option 1: Using EAS Build

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
eas build --platform ios --profile production
```

### Option 2: Using Xcode

1. **Open project in Xcode:**
   ```bash
   cd /Users/tanyastrauss/Spect-IT/SpectITMobile
   open ios/SpectIT.xcworkspace
   ```

2. **Archive:**
   - Product → Archive
   - Wait for archive to complete

3. **Distribute:**
   - Click "Distribute App"
   - Choose "App Store Connect"
   - Follow prompts
   - Upload build

---

## ✅ Quick Checklist

Before submitting:

- [ ] Build uploaded successfully
- [ ] Build status: "Ready to Submit" (not "Processing")
- [ ] Build appears in "App Store" tab (not just TestFlight)
- [ ] Build selected in "Build" section
- [ ] Build shows in "Build" section (not "Select a build" button)
- [ ] All other required fields completed
- [ ] "Submit for Review" button is enabled

---

## 🎯 Most Common Solution

**90% of the time, the issue is:**

1. **Build is still processing** → Wait 15-30 minutes
2. **Looking in wrong tab** → Must be "App Store" tab, not TestFlight
3. **Build not selected** → Click "Select a build" button and choose build

**Try this:**
1. Go to **"App Store"** tab
2. Scroll to **"Build"** section
3. Click **"Select a build before you submit your app"**
4. Wait for builds to load
5. Select your build
6. Click **"Done"**

---

## 🔗 Reference Links

- **App Store Connect:** https://appstoreconnect.apple.com/apps/6755681856
- **TestFlight:** https://appstoreconnect.apple.com/apps/6755681856/testflight/ios
- **App Store Tab:** https://appstoreconnect.apple.com/apps/6755681856/appstore/ios

---

**Still having issues? Check:**
1. Build status in TestFlight tab
2. Make sure you're in "App Store" tab (not TestFlight)
3. Wait for processing to complete
4. Try refreshing the page

