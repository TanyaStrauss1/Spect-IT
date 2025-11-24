# 📱 How to Add Build to App Store Connect

## Your App Store Connect Link
**App ID:** 6755681856  
**URL:** https://appstoreconnect.apple.com/apps/6755681856/distribution/ios/version/inflight

---

## 🚀 Method 1: Build and Submit via Terminal (Recommended)

### Step 1: Build iOS App

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
eas build --platform ios --profile production
```

**⏱️ Takes 15-30 minutes**

**When prompted:**
- Apple ID: `tanstrauss@gmail.com`
- Password: [Your Apple ID password]
- 2FA Code: [If enabled]

---

### Step 2: Submit Build to App Store Connect

After build completes:

```bash
eas submit --platform ios --latest
```

**What this does:**
- Uploads the `.ipa` file to App Store Connect
- Automatically links it to your app (ID: 6755681856)
- Makes it available for selection in the version page

---

### Step 3: Complete App Listing in App Store Connect

1. **Go to your app:**
   - https://appstoreconnect.apple.com/apps/6755681856/distribution/ios/version/inflight

2. **Select the uploaded build:**
   - Scroll to **"Build"** section
   - Click **"Select a build before you submit your app"**
   - Choose the build you just uploaded
   - Click **"Done"**

3. **Complete required information:**
   - **Screenshots** (Required):
     - iPhone 6.7" Display: At least 3 screenshots
     - iPhone 6.5" Display: At least 3 screenshots
     - iPhone 5.5" Display: Optional
   
   - **App Description:**
     ```
     Spect-IT is a professional-grade eye testing platform that provides comprehensive vision assessments using advanced AI technology. 
     
     Features:
     - Snellen Visual Acuity Test
     - Color Blindness Test (Ishihara)
     - Astigmatism Test
     - Contrast Sensitivity Test
     - Visual Field Test
     - Prescription Measurement
     - E-commerce shop for eyewear
     - Specialist finder
     - Virtual try-on
     ```
   
   - **Keywords:**
     ```
     eye test, vision, optometry, health, medical, spectacles, contact lenses, eye care, visual acuity, color blindness
     ```
   
   - **Support URL:**
     - https://www.spect-it.com
   
   - **Privacy Policy URL:**
     - https://www.spect-it.com/privacy-policy
   
   - **Marketing URL (optional):**
     - https://www.spect-it.com

4. **Complete App Information:**
   - **Category:** Health & Fitness
   - **Secondary Category:** Medical (optional)
   - **Age Rating:** Complete questionnaire
   - **Content Rights:** You have the rights to use all content

5. **Pricing and Availability:**
   - **Price:** Free
   - **Availability:** All countries (or select specific)

---

### Step 4: Submit for Review

1. Scroll to bottom of the page
2. Review all sections are complete (green checkmarks)
3. Click **"Add for Review"** or **"Submit for Review"**
4. Answer export compliance questions:
   - **Does your app use encryption?** → No (or Yes, then select "No, it does not use encryption")
   - **Does your app use third-party encryption?** → No
5. Click **"Submit for Review"**

---

## 🎯 Method 2: Manual Upload via Transporter

If you already have a `.ipa` file:

### Step 1: Download Transporter App

1. Open **Mac App Store**
2. Search for **"Transporter"**
3. Install (free, by Apple)

### Step 2: Upload Build

1. Open **Transporter** app
2. Sign in with: `tanstrauss@gmail.com`
3. Drag and drop your `.ipa` file
4. Click **"Deliver"**
5. Wait for upload to complete

### Step 3: Select Build in App Store Connect

1. Go to: https://appstoreconnect.apple.com/apps/6755681856/distribution/ios/version/inflight
2. Wait 5-10 minutes for build to appear
3. Click **"Select a build"**
4. Choose your uploaded build
5. Complete app listing (see Step 3 above)
6. Submit for review

---

## 📋 Quick Checklist

Before submitting:

- [ ] Build completed successfully
- [ ] Build uploaded to App Store Connect
- [ ] Build selected in version page
- [ ] Screenshots added (at least 3 for each required size)
- [ ] App description completed
- [ ] Keywords added
- [ ] Support URL added
- [ ] Privacy Policy URL added
- [ ] Category selected
- [ ] Age rating completed
- [ ] Pricing set
- [ ] Export compliance answered
- [ ] All sections show green checkmarks

---

## 🔗 Important Links

- **Your App:** https://appstoreconnect.apple.com/apps/6755681856/distribution/ios/version/inflight
- **App Store Connect:** https://appstoreconnect.apple.com
- **Expo Builds:** https://expo.dev/accounts/tstrauss/projects/spectit-mobile/builds
- **Apple Developer:** https://developer.apple.com

---

## ⏱️ Timeline

- **Build:** 15-30 minutes
- **Upload:** 5-10 minutes
- **Processing:** 5-10 minutes (build appears in App Store Connect)
- **Review:** 1-7 days (typically)

---

## 🆘 Troubleshooting

### Build not appearing?
- Wait 10-15 minutes after upload
- Refresh the page
- Check build status in Expo dashboard

### Can't select build?
- Make sure build status is "Ready to Submit"
- Check that build version matches app version
- Verify bundle ID matches: `com.spectit.app`

### Missing required fields?
- Screenshots are mandatory
- Privacy Policy URL is required
- Support URL is required
- Age rating must be completed

---

## 💡 Pro Tips

1. **Prepare screenshots before building** - Saves time
2. **Test the build first** - Use TestFlight before submitting
3. **Complete all fields** - Incomplete listings delay review
4. **Check export compliance** - Answer correctly to avoid delays
5. **Monitor review status** - Check App Store Connect daily

---

**Ready to build? Run:**
```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile && ./BUILD_AND_SUBMIT_NOW.sh
```

