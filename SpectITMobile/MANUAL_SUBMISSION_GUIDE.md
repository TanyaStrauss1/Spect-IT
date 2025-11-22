# 📤 Manual App Store Submission Guide

## ✅ Build Status

### Android Build
- **Status:** ✅ Finished
- **Build ID:** e53ca738-bd80-4318-952d-a5f624c9be6d
- **Download URL:** https://expo.dev/artifacts/eas/uiPgexbzUL4kpsQhc8Z4PB.aab
- **View Build:** https://expo.dev/accounts/tstrauss/projects/spectit-mobile/builds/e53ca738-bd80-4318-952d-a5f624c9be6d

### iOS Build
- Check status: https://expo.dev/accounts/tstrauss/projects/spectit-mobile/builds

---

## 🤖 Google Play Store Submission

### Step 1: Download Android App Bundle (.aab)

**Option A: Download from Expo Dashboard**
1. Go to: https://expo.dev/accounts/tstrauss/projects/spectit-mobile/builds
2. Find the latest Android build (Status: finished)
3. Click "Download" to get the .aab file

**Option B: Download via EAS CLI**
```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
eas build:download e53ca738-bd80-4318-952d-a5f624c9be6d
```

### Step 2: Go to Google Play Console

1. **Open Play Console:**
   https://play.google.com/console/u/0/developers/6438572372972515481

2. **Create App (if not created):**
   - Click "Create app"
   - App name: `Spect-IT`
   - Default language: `English (US)`
   - App or game: `App`
   - Free or paid: `Free`
   - Accept policies
   - Click "Create app"

### Step 3: Complete Store Listing

**Main Store Listing:**
- **App name:** Spect-IT
- **Short description (80 chars):** Professional eye testing made simple. Comprehensive vision assessments, prescription measurements, and eye health monitoring.
- **Full description:** (See `APP_STORE_CONTENT.md` for full text)
- **App icon:** Upload 512x512 icon (from `assets/icon.png`)
- **Feature graphic:** 1024x500 (create or use screenshot)
- **Screenshots:** At least 2 for phone (6.5" display), optional for tablet
- **Privacy policy URL:** https://www.spect-it.com/privacy-policy

**App Content:**
- Privacy policy: https://www.spect-it.com/privacy-policy
- Content rating: Complete questionnaire
- Target audience: All ages
- Data safety: Complete form

### Step 4: Upload App Bundle

1. Go to **Release** → **Production**
2. Click **Create new release**
3. Upload the downloaded `.aab` file
4. Add release notes:
   ```
   Initial release of Spect-IT mobile app with comprehensive eye testing features:
   - Snellen Visual Acuity Test
   - Color Blindness Test (Ishihara)
   - Astigmatism Test
   - Contrast Sensitivity Test
   - Visual Field Test
   - Prescription Measurement
   - E-commerce shop
   - Specialist finder
   - Virtual try-on
   ```
5. Click **Save**
6. Click **Review release**
7. Click **Start rollout to Production**

### Step 5: Submit for Review

1. Review all sections are complete
2. Click **Submit for review**
3. Wait for review (typically 1-3 days)

---

## 🍎 Apple App Store Submission

### Step 1: Check iOS Build Status

1. Go to: https://expo.dev/accounts/tstrauss/projects/spectit-mobile/builds
2. Find the latest iOS build
3. Wait for status: **finished**

### Step 2: Download iOS App (.ipa)

**Option A: Download from Expo Dashboard**
1. Go to: https://expo.dev/accounts/tstrauss/projects/spectit-mobile/builds
2. Find the latest iOS build (Status: finished)
3. Click "Download" to get the .ipa file

**Option B: Download via EAS CLI**
```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
eas build:download [BUILD_ID]
```

### Step 3: Go to App Store Connect

1. **Open App Store Connect:**
   https://appstoreconnect.apple.com

2. **Sign in:**
   - Email: `tanstrauss@gmail.com`
   - Password: [Your password]

### Step 4: Create App (if not created)

1. Click **My Apps** → **+** → **New App**
2. Fill in:
   - Platform: iOS
   - Name: `Spect-IT`
   - Primary Language: English (U.S.)
   - Bundle ID: `com.spectit.app` (should be registered)
   - SKU: `spectit-mobile-001`
   - User Access: Full Access
3. Click **Create**

### Step 5: Complete App Information

**App Information:**
- Name: Spect-IT
- Subtitle: Professional Eye Testing
- Category: Health & Fitness
- Content Rights: You have the rights to use all content

**Pricing and Availability:**
- Price: Free
- Availability: All countries (or select specific)

**Privacy Policy URL:**
- https://www.spect-it.com/privacy-policy

### Step 6: Complete Version Information

**What's New in This Version:**
```
Initial release of Spect-IT mobile app with comprehensive eye testing features:
- Snellen Visual Acuity Test
- Color Blindness Test (Ishihara)
- Astigmatism Test
- Contrast Sensitivity Test
- Visual Field Test
- Prescription Measurement
- E-commerce shop
- Specialist finder
- Virtual try-on
```

**Description:**
(See `APP_STORE_CONTENT.md` for full description)

**Keywords:**
```
eye test, vision, optometry, health, medical, spectacles, contact lenses, eye care, visual acuity, color blindness
```

**Support URL:**
- https://www.spect-it.com

**Marketing URL (optional):**
- https://www.spect-it.com

**Screenshots:**
- iPhone 6.7" Display: At least 3 screenshots
- iPhone 6.5" Display: At least 3 screenshots
- iPhone 5.5" Display: At least 3 screenshots (optional)
- iPad Pro (12.9") Display: Optional
- iPad Pro (11") Display: Optional

**App Preview Video (optional):**
- Upload a video showcasing the app

### Step 7: Upload Build

**Option A: Using Transporter App (Recommended)**
1. Download **Transporter** from Mac App Store
2. Open Transporter
3. Sign in with: `tanstrauss@gmail.com`
4. Drag and drop the `.ipa` file
5. Click **Deliver**

**Option B: Using Xcode**
1. Open Xcode
2. Go to **Window** → **Organizer**
3. Click **Distribute App**
4. Select **App Store Connect**
5. Upload the `.ipa` file

**Option C: Using EAS Submit (Interactive)**
```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
eas submit --platform ios --latest
```
(You'll be prompted for Apple ID credentials)

### Step 8: Submit for Review

1. In App Store Connect, go to your app
2. Go to **App Store** tab
3. Under **Build**, select the uploaded build
4. Click **Add for Review**
5. Answer export compliance questions
6. Click **Submit for Review**

---

## 📋 Quick Checklist

### Android (Play Store)
- [ ] App created in Play Console
- [ ] Store listing completed
- [ ] .aab file uploaded
- [ ] Privacy policy added
- [ ] Screenshots uploaded
- [ ] App submitted for review

### iOS (App Store)
- [ ] App created in App Store Connect
- [ ] App information completed
- [ ] Version information completed
- [ ] Screenshots uploaded
- [ ] .ipa file uploaded
- [ ] Build selected for review
- [ ] App submitted for review

---

## 🔗 Important Links

- **Expo Builds:** https://expo.dev/accounts/tstrauss/projects/spectit-mobile/builds
- **Play Console:** https://play.google.com/console/u/0/developers/6438572372972515481
- **App Store Connect:** https://appstoreconnect.apple.com
- **Privacy Policy:** https://www.spect-it.com/privacy-policy
- **App Store Content:** See `APP_STORE_CONTENT.md`

---

## ⏱️ Review Times

- **Google Play Store:** 1-3 days typically
- **Apple App Store:** 1-7 days typically

---

## ✅ After Approval

Once approved:
- Apps will be live in stores
- Users can download and install
- Monitor reviews and ratings
- Update as needed

