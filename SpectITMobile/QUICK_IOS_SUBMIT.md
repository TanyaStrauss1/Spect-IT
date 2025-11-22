# 🍎 Quick iOS App Store Submission Guide

## ✅ iOS Build Status

Check your latest iOS build:
https://expo.dev/accounts/tstrauss/projects/spectit-mobile/builds

---

## 📤 Submission Methods

### Method 1: EAS Submit (Interactive - Recommended)

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
eas submit --platform ios --latest
```

**You will be prompted for:**
- Apple ID: `tanstrauss@gmail.com`
- Apple ID Password: [Your password]
- 2FA Code: [If enabled, enter code from your device]

---

### Method 2: Manual Submission via Transporter

#### Step 1: Download .ipa File

**Option A: From Expo Dashboard**
1. Go to: https://expo.dev/accounts/tstrauss/projects/spectit-mobile/builds
2. Find the latest iOS build (Status: finished)
3. Click "Download" to get the .ipa file

**Option B: Via EAS CLI**
```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
eas build:list --platform ios --limit 1
# Note the build ID, then:
eas build:download [BUILD_ID]
```

#### Step 2: Download Transporter App

1. Open **Mac App Store**
2. Search for **"Transporter"**
3. Install the app (free, by Apple)

#### Step 3: Upload via Transporter

1. Open **Transporter** app
2. Sign in with: `tanstrauss@gmail.com`
3. Drag and drop the `.ipa` file into Transporter
4. Click **"Deliver"**
5. Wait for upload to complete

---

### Method 3: Manual Submission via Xcode

1. Open **Xcode**
2. Go to **Window** → **Organizer**
3. Click **"Distribute App"**
4. Select **"App Store Connect"**
5. Upload the `.ipa` file
6. Follow the prompts

---

## 🍎 App Store Connect Setup

### Step 1: Go to App Store Connect

1. **Open App Store Connect:**
   https://appstoreconnect.apple.com

2. **Sign in:**
   - Email: `tanstrauss@gmail.com`
   - Password: [Your password]

### Step 2: Create App (if not created)

1. Click **"My Apps"** → **"+"** → **"New App"**
2. Fill in:
   - **Platform:** iOS
   - **Name:** `Spect-IT`
   - **Primary Language:** English (U.S.)
   - **Bundle ID:** `com.spectit.app` (should be registered)
   - **SKU:** `spectit-mobile-001`
   - **User Access:** Full Access
3. Click **"Create"**

### Step 3: Complete App Information

**App Information:**
- **Name:** Spect-IT
- **Subtitle:** Professional Eye Testing
- **Category:** Health & Fitness
- **Content Rights:** You have the rights to use all content

**Pricing and Availability:**
- **Price:** Free
- **Availability:** All countries (or select specific)

**Privacy Policy URL:**
- https://www.spect-it.com/privacy-policy

### Step 4: Complete Version Information

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
- **iPhone 6.7" Display:** At least 3 screenshots
- **iPhone 6.5" Display:** At least 3 screenshots
- **iPhone 5.5" Display:** At least 3 screenshots (optional)
- **iPad Pro (12.9") Display:** Optional
- **iPad Pro (11") Display:** Optional

**App Preview Video (optional):**
- Upload a video showcasing the app

### Step 5: Submit for Review

1. In App Store Connect, go to your app
2. Go to **App Store** tab
3. Under **Build**, select the uploaded build
4. Click **"Add for Review"**
5. Answer export compliance questions
6. Click **"Submit for Review"**

---

## ⏱️ Review Time

- **Typical:** 1-7 days
- **First submission:** May take longer (up to 14 days)

---

## 🔗 Quick Links

- **App Store Connect:** https://appstoreconnect.apple.com
- **Expo Builds:** https://expo.dev/accounts/tstrauss/projects/spectit-mobile/builds
- **Privacy Policy:** https://www.spect-it.com/privacy-policy
- **App Store Content:** See `APP_STORE_CONTENT.md`

---

## ✅ That's It!

Your app will be reviewed and published to the Apple App Store!

