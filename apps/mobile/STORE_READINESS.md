# Mobile App Store Readiness Summary

## ✅ What's Ready (Merged in This PR)

### Configuration Complete
- ✅ **Privacy Policy URL**: `https://spect-it.com/privacy` (configured in app.config.js)
- ✅ **Terms of Service URL**: `https://spect-it.com/terms` (configured in app.config.js)
- ✅ **App Bundle IDs**: `com.spectit.app` (consistent for iOS and Android)
- ✅ **Build Profiles**: `development`, `preview`, `production` (eas.json)
- ✅ **Permissions Documented**: Camera, location with clear usage strings
- ✅ **Export Compliance**: ITSAppUsesNonExemptEncryption set to false (iOS)

### Store Submission Documentation
- ✅ **iOS Checklist**: Complete step-by-step guide in `APP_STORE_CHECKLIST.md`
- ✅ **Android Checklist**: Complete step-by-step guide in `PLAY_STORE_CHECKLIST.md`
- ✅ **Screening Disclaimers**: All copy emphasizes "screening only, not diagnosis"
- ✅ **Build Commands**: Documented for both platforms

### Enhanced Export Capabilities (NEW in this PR)
- ✅ **CSV Export**: Full longitudinal data export with screening disclaimers
- ✅ **Baseline + Trends CSV**: Dedicated export comparing baseline to latest screening
- ✅ **PDF Enhancements**: Vision Scan PDFs now include actual longitudinal comparison (when previous scan available)
- ✅ **Quality Metadata**: CSV exports include capability mode, quality scores, methodology details
- ✅ **Screening Language**: All exports reinforce "screening only" positioning

---

## 🚧 What Tanya Still Needs to Do

### Apple App Store (iOS)

**Prerequisites:**
- [ ] **Enroll in Apple Developer Program** ($99/year)
  - Sign up: https://developer.apple.com/programs/enroll/
  - Wait 1-2 business days for approval

**App Store Connect Setup:**
- [ ] **Create app in App Store Connect**
  - Set app name: "Spect-IT Vision Screening"
  - Set bundle ID: `com.spectit.app` (must match app.config.js)
  - Note the App Store Connect App ID (numeric)

- [ ] **Complete App Information**
  - Privacy Policy URL: `https://spect-it.com/privacy` ✅ (already in config)
  - Terms of Service: `https://spect-it.com/terms` ✅ (already in config)
  - Category: Health & Fitness
  - Age Rating: Complete questionnaire (recommend 12+ or 4+)

- [ ] **Complete App Privacy Questionnaire**
  - Data collected: Email, vision screening results, usage data, approximate location (optional)
  - Data linked to user: Yes
  - Data used for tracking: No
  - Screening only, not diagnosis (emphasize in responses)

- [ ] **Prepare Screenshots**
  - iPhone screenshots (6.7", 6.5", 5.5" required)
  - iPad screenshots (12.9", 9.7" if supporting tablets)
  - Minimum 2 per device size, recommend 4-6
  - Show actual test screens with disclaimers visible

- [ ] **Write App Description**
  - Use "screening" language throughout
  - Include disclaimers: "Not a diagnosis or prescription"
  - Emphasize professional exam recommendations
  - See `APP_STORE_CHECKLIST.md` for template

**Build and Submit:**
- [ ] **First Production Build**
  ```bash
  cd apps/mobile
  eas build -p ios --profile production
  ```
  (Wait 10-30 minutes for build to complete)

- [ ] **Submit to App Store Connect**
  ```bash
  eas submit -p ios --profile production
  ```
  (You'll need Apple ID, app-specific password, App Store Connect App ID)

- [ ] **TestFlight Testing (Highly Recommended)**
  - Add internal testers (up to 100)
  - Test on real devices
  - Validate camera permissions, test flows, disclaimers

- [ ] **Submit for App Review**
  - Complete all App Store Connect sections
  - Add App Review notes clarifying "screening only" positioning
  - Provide demo account if app requires sign-in

**Timeline:** 
- Apple enrollment: 1-2 business days
- App Store setup: 2-3 hours
- TestFlight testing: 1-2 weeks (recommended)
- App Review: 24-48 hours (can take up to 7 days)

---

### Google Play Store (Android)

**Prerequisites:**
- [ ] **Register for Google Play Console** ($25 one-time fee)
  - Sign up: https://play.google.com/console/signup

**Play Console Setup:**
- [ ] **Create app in Play Console**
  - App name: "Spect-IT Vision Screening"
  - Default language: English (South Africa or U.S.)
  - Free app

- [ ] **Complete Store Listing**
  - Short description (80 chars): "Quick vision screening tests for astigmatism, color vision, and visual acuity."
  - Full description: Emphasize "screening only, not diagnosis"
  - App icon: 512x512 PNG
  - Feature graphic: 1024x500 PNG (required)
  - Screenshots: At least 2 phone screenshots (1080x1920 or higher)

- [ ] **Complete Data Safety**
  - Data collected: Email, vision screening results, usage data, approximate location
  - Data shared: Only with service providers (Supabase, Vercel)
  - Data encrypted in transit: Yes
  - Users can request deletion: Yes

- [ ] **Complete Content Rating**
  - IARC questionnaire
  - Medical/health: "Does your app diagnose medical conditions?" → **No** (screening only)
  - Expected rating: Everyone or Teen (depending on web access)

- [ ] **Health Apps Declaration**
  - Is this a health app? Yes
  - Does it make medical claims? **No** (screening only)
  - FDA approved? No (not a medical device)

**Build and Submit:**
- [ ] **First Production Build**
  ```bash
  cd apps/mobile
  eas build -p android --profile production
  ```
  (Wait 5-20 minutes for AAB to build)

- [ ] **Internal Testing Track**
  - Upload AAB to Play Console → Internal Testing
  - Add internal testers
  - Test on real devices

- [ ] **Production Release**
  - Create production release
  - Upload AAB
  - Set rollout percentage (start with 20%, increase to 100%)
  - Submit for review

**Timeline:**
- Play Console setup: 2-3 hours
- Internal testing: 1-2 weeks (recommended)
- Review: 1-7 days (faster after first approval)

---

## 📋 Pre-Submission Testing Checklist

Before submitting to Apple/Google, test thoroughly:

**Functionality:**
- [ ] App installs successfully on iOS and Android devices
- [ ] Camera permission prompt appears and grants access
- [ ] Location permission prompt appears (optional, for practice finder)
- [ ] All vision screening tests run correctly
- [ ] Results save and sync to Supabase
- [ ] Dashboard displays test history
- [ ] Trends chart shows longitudinal data (if multiple tests)
- [ ] CSV export works (share action triggers)
- [ ] Baseline + Trends CSV export works (when 2+ tests exist)
- [ ] PDF export generates correctly (if Vision Scan available)
- [ ] Practice finder works (with location permission)
- [ ] Deep links work (`spectit://` scheme)

**Screening Language:**
- [ ] All test result screens display "screening only" disclaimers
- [ ] No use of "diagnosis" or "prescription" language
- [ ] "Refer to professional" recommendations are clear
- [ ] CSV exports include screening disclaimers
- [ ] PDF exports include prominent disclaimers

**Quality:**
- [ ] No crashes or critical bugs
- [ ] App works offline (tests that don't require sync)
- [ ] Slow network handling (loading states, error messages)
- [ ] Privacy policy link works: `https://spect-it.com/privacy`
- [ ] Terms link works: `https://spect-it.com/terms`

---

## 🔑 Secrets & Environment Variables

**Supabase Credentials (Required for Production):**

The app needs Supabase URL and anonymous key. Set these via EAS Secrets:

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Set secrets
cd apps/mobile
eas secret:create --scope project --name SUPABASE_URL --value "your-supabase-url"
eas secret:create --scope project --name SUPABASE_ANON_KEY --value "your-supabase-anon-key"
```

These secrets are injected at build time. No secrets required to merge this PR or run the app locally (use .env.local for local dev).

---

## 🚀 Quick Start Commands

### iOS Build & Submit
```bash
cd apps/mobile
eas build -p ios --profile production
eas submit -p ios --profile production
```

### Android Build & Submit
```bash
cd apps/mobile
eas build -p android --profile production
# Upload AAB manually to Play Console
# Or: eas submit -p android --profile production
```

---

## 📚 Documentation References

- **iOS Submission**: `apps/mobile/APP_STORE_CHECKLIST.md`
- **Android Submission**: `apps/mobile/PLAY_STORE_CHECKLIST.md`
- **Mobile README**: `apps/mobile/README.md`
- **Operations Guide**: `/OPS_GUIDE.md` (screening-honesty compliance, Vercel setup)
- **Product Roadmap**: `/SPECT_IT_PRODUCT_ROADMAP.md` (doctrine and principles)

---

## 💰 Estimated Costs

- **Apple Developer Program**: $99/year (required for iOS)
- **Google Play Console**: $25 one-time (required for Android)
- **Expo EAS Build**: Free tier available, or ~$29/month for unlimited builds
  - First few builds are free; upgrade if needed during active development

---

## ⚠️ Common Pitfalls to Avoid

### App Store Rejections

**Medical Claims (Apple & Google):**
- ❌ Don't say "diagnose", "prescribe", "clinical results"
- ✅ Say "screening", "screening estimates", "consult a professional"
- Add more disclaimers if rejected, update store listing copy

**Privacy Issues:**
- ❌ Don't use camera/location without clear explanation
- ✅ Update `NSCameraUsageDescription` and `NSLocationWhenInUseUsageDescription` if rejected

**Functionality Issues:**
- ❌ Don't submit if tests crash or don't work
- ✅ Test on real devices (iPhone, iPad, Android) before submission

### Build Issues

**Workspace Dependencies:**
- If EAS build fails with "Module not found" errors, ensure `package.json` workspace setup is correct
- See `PLAY_STORE_CHECKLIST.md` → Troubleshooting section

**Version Conflicts:**
- Always increment `versionCode` (Android) and `buildNumber` (iOS) for each new build
- Play Store/App Store reject duplicate version numbers

---

## ✅ Sign-Off Checklist

Before marking this PR as ready for production:

- [x] Terms URL added to app.config.js
- [x] Privacy URL already configured
- [x] CSV export implemented with screening disclaimers
- [x] Baseline + Trends CSV export implemented
- [x] PDF longitudinal comparison added (Vision Scan)
- [x] Store checklists reviewed and complete
- [x] Operations guide created with screening-honesty checklist
- [x] Deprecation notices added to legacy code
- [ ] Tanya has reviewed store submission requirements
- [ ] Supabase credentials ready for EAS Secrets
- [ ] Apple Developer account enrollment initiated (if targeting iOS first)
- [ ] Google Play Console account created (if targeting Android first)

---

**Status:** Ready for store submission workflows. All code changes complete. Tanya owns remaining console setup and submission steps.

**Next Step:** Tanya enrolls in Apple Developer Program and/or Google Play Console, then follows `APP_STORE_CHECKLIST.md` or `PLAY_STORE_CHECKLIST.md`.

---

**Document Owner:** Engineering Team  
**Last Updated:** September 2026
