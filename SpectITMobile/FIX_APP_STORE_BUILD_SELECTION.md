# 🔧 Fix "Unable to Add for Review - You must choose a build"

## ❌ Error Message

"Unable to Add for Review. The items below are required to start the review process: You must choose a build."

---

## ✅ Solution: Select a Build in App Store Connect

According to [Apple's documentation](https://developer.apple.com/help/app-store-connect/manage-builds/upload-builds/), you need to select a build before submitting for review.

### Step 1: Go to App Store Connect

1. **Open:** https://appstoreconnect.apple.com/apps/6755681856/distribution/ios/version/inflight

2. **Sign in** with: `tanstrauss@gmail.com`

---

### Step 2: Wait for Build to Process

After uploading a build, it needs to be processed:

- **Processing Time:** 15-30 minutes typically
- **Status:** Will show "Processing" → "Ready to Submit"

**Where to check:**
- Go to **"TestFlight"** tab first
- Build appears there initially
- Then moves to **"App Store"** tab

---

### Step 3: Select the Build

1. **Go to "App Store" tab** (not TestFlight)

2. **Scroll to "Build" section**

3. **Click:** "Select a build before you submit your app"
   - This button appears if no build is selected

4. **Wait for builds to load** (may take a moment)

5. **Select your uploaded build:**
   - Look for build number/version
   - Should show "Ready to Submit" status
   - Click on it to select

6. **Click "Done"** button

---

### Step 4: Complete Required Information

After selecting build, complete these required fields:

#### Required Fields:

- [ ] **Screenshots** (REQUIRED)
  - iPhone 6.7" Display: Minimum 3 screenshots
  - iPhone 6.5" Display: Minimum 3 screenshots
  
- [ ] **App Description** (REQUIRED)
  - At least 10 characters
  
- [ ] **Privacy Policy URL** (REQUIRED)
  - Use: `https://tanyastrauss1.github.io/Spect-IT/privacy-policy.html`
  
- [ ] **Support URL** (REQUIRED)
  - Can use: `https://www.spect-it.com` or privacy policy URL
  
- [ ] **Category** (REQUIRED)
  - Primary: Health & Fitness or Medical
  
- [ ] **Age Rating** (REQUIRED)
  - Complete questionnaire

#### Optional but Recommended:

- [ ] App Subtitle
- [ ] Keywords
- [ ] Promotional Text
- [ ] Marketing URL
- [ ] App Preview Video

---

### Step 5: Submit for Review

Once all required fields are completed:

1. **Review all information**

2. **Click "Submit for Review"** button (top right)

3. **Confirm submission**

4. **Wait for Apple's review** (typically 1-3 days)

---

## ⚠️ Common Issues

### Issue: "No builds available"

**Causes:**
- Build still processing (wait 15-30 minutes)
- Build failed processing
- Build not uploaded yet

**Solutions:**
1. Check build status in TestFlight tab
2. Wait for processing to complete
3. Upload a new build if needed

### Issue: Build shows "Invalid"

**Causes:**
- Build has errors
- Missing required capabilities
- Code signing issues

**Solutions:**
1. Check build details for error messages
2. Fix issues in Xcode
3. Upload a new build

### Issue: Build not appearing

**Causes:**
- Upload failed
- Wrong bundle ID
- Processing not complete

**Solutions:**
1. Check upload was successful
2. Verify bundle ID matches: `com.spectit.app`
3. Wait longer for processing

---

## 📋 Quick Checklist

Before submitting:

- [ ] Build uploaded successfully
- [ ] Build status: "Ready to Submit" (not "Processing")
- [ ] Build selected in App Store tab
- [ ] Screenshots uploaded (minimum 3 per device size)
- [ ] App description filled in
- [ ] Privacy Policy URL added
- [ ] Support URL added
- [ ] Category selected
- [ ] Age rating completed
- [ ] All required fields completed
- [ ] "Submit for Review" button is enabled

---

## 🔗 Reference Links

- **App Store Connect:** https://appstoreconnect.apple.com/apps/6755681856
- **Upload Builds Guide:** https://developer.apple.com/help/app-store-connect/manage-builds/upload-builds/
- **Privacy Policy:** https://tanyastrauss1.github.io/Spect-IT/privacy-policy.html

---

**The key is selecting the build in the "App Store" tab, not just uploading it!**

