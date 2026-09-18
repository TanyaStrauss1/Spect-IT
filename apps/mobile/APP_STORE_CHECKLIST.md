# Apple App Store Submission Checklist

This document outlines the exact steps required to submit Spect-IT to Apple's App Store.

---

## Prerequisites

### 1. Apple Developer Program
- **Cost**: $99 USD per year (subscription)
- **Required for**: App Store distribution, TestFlight, push notifications
- **Enroll at**: https://developer.apple.com/programs/enroll/
- **Account types**: 
  - **Individual**: Personal Apple ID
  - **Organization**: D-U-N-S Number required (free from Dun & Bradstreet)
- **Approval time**: 1-2 business days (can take up to 2 weeks for organizations)

### 2. Expo Account & EAS CLI
```bash
# Install EAS CLI globally (if not already installed)
npm install -g eas-cli

# Login to your Expo account
eas login

# Configure project (if not already done for Android)
cd apps/mobile
eas build:configure
```

The `projectId` should already be set in `app.config.js` from the Android setup. If not, EAS will generate one.

### 3. Development Setup
- **Mac required**: Xcode and iOS Simulator (for local testing)
- **Physical iOS device**: Recommended for final testing before submission
- **EAS Build**: Can build iOS apps without a Mac (cloud builds)

---

## Apple Developer Account Setup

### 1. Create App in App Store Connect
1. Go to https://appstoreconnect.apple.com
2. Navigate to **My Apps** → **Add Apps** (+ button)
3. Fill in app information:
   - **Platform**: iOS
   - **Name**: Spect-IT Vision Screening
   - **Primary Language**: English (South Africa) or English (U.S.)
   - **Bundle ID**: `com.spectit.app` (must match `app.config.js`)
   - **SKU**: `spect-it-app` (unique identifier, not shown to users)
   - **User Access**: Full Access

### 2. Record App Store Connect App ID
After creating the app, note the **App ID** (numeric, e.g., `1234567890`) from the App Information page. You'll need this for `eas submit`.

### 3. Certificates & Provisioning (Managed by EAS)
EAS Build handles all code signing automatically:
- Distribution certificate
- Provisioning profiles
- Push notification certificates (if needed later)

No manual certificate management required unless using manual signing.

---

## Build Configuration

### iOS Version Management
- **Version**: `1.0.0` (semantic, user-facing in `app.config.js`)
- **Build number**: `1` (increments with each TestFlight/App Store build in `app.config.js`)
- **Increment `buildNumber`** for every new build submitted to TestFlight or App Store

### Build Profiles (apps/mobile/eas.json)
- **development**: Simulator build for local testing
- **preview**: Ad hoc or internal distribution build for device testing
- **production**: App Store archive (IPA) for TestFlight and App Store submission

---

## Building for App Store

### 1. Create Production Build
```bash
cd apps/mobile

# Build production archive for App Store
eas build -p ios --profile production

# Wait for build to complete (10-30 minutes)
# EAS will handle code signing automatically
```

### 2. Download the IPA
After the build completes, EAS provides:
- Download URL for the `.ipa` file (App Store archive)
- Build ID and build details
- QR code for installation (not applicable for production builds)

### 3. Submit to App Store Connect
```bash
# Submit to TestFlight and App Store Connect
eas submit -p ios --profile production

# You'll be prompted for:
# - Apple ID (your developer account email)
# - App-specific password (generate at appleid.apple.com)
# - App Store Connect App ID (numeric ID from step 2 above)
```

**Alternative submission methods:**
- **Transporter app** (macOS): Download IPA and upload manually
- **App Store Connect web**: Upload via browser (less reliable)

---

## App Store Connect Configuration

### 1. App Information
Navigate to **App Store Connect → My Apps → Spect-IT Vision Screening → App Information**

**General Information:**
- **Name**: Spect-IT Vision Screening (max 30 characters)
- **Subtitle**: Quick vision screening tests (optional, max 30 characters)
- **Privacy Policy URL**: https://spect-it.com/privacy (REQUIRED)
- **Category**: 
  - **Primary**: Health & Fitness
  - **Secondary**: Medical (optional)
- **Content Rights**: Check if your app contains third-party content

**App Store Promotion (Optional):**
- **Promotional Text**: Short description for app updates (max 170 characters)

### 2. Pricing and Availability
Navigate to **Pricing and Availability**

- **Price**: Free
- **Availability**: All territories (or select specific countries)
  - Recommend starting with South Africa, U.S., U.K.
- **Pre-Order**: Not applicable for v1.0.0

### 3. App Privacy
Navigate to **App Privacy**

Complete the **App Privacy** questionnaire (similar to Google's Data Safety):

**Data Collection:**
- ✅ **Contact Info**: Email address (for account creation)
- ✅ **Health & Fitness**: Vision screening results
- ✅ **Usage Data**: Test history, timestamps, app interactions
- ✅ **Identifiers**: Device ID
- ✅ **Location**: Approximate location (optional, for practice finder)

**Data Usage:**
- **Linked to user**: Yes (results tied to account)
- **Used for tracking**: No (not shared with third parties for ads)
- **Purpose**: App functionality, analytics

**Privacy practices:**
- [ ] Data used to track you: **No**
- [x] Data linked to you: **Yes** (email, test results)
- [x] Data collected: See above

Apple may ask for detailed explanations. Emphasize:
- Results are for **screening only**, not diagnosis
- Users control data sharing
- Privacy policy explains data handling: https://spect-it.com/privacy

### 4. Age Rating
Navigate to **Age Rating** and complete the questionnaire:

**Made for Kids?** No

**Age Rating Questionnaire:**
- **Medical/treatment information**: Yes (vision screening)
  - "Does your app provide diagnosed medical information?": **No** (screening only)
  - "Does your app provide treatment instructions?": **No**
- **Unrestricted web access**: Yes (links to optical practices, privacy/terms pages)
- **Alcohol, tobacco, drugs**: No
- **Contests, gambling**: No
- **Violence**: No
- **Sexual content**: No
- **Profanity or crude humor**: No
- **Horror or fear themes**: No

**Expected rating**: 4+ or 12+ (depending on web access interpretation)

### 5. App Review Information
Navigate to **App Review Information** (under version)

**Contact Information:**
- **First Name**: Tanya (or your name)
- **Last Name**: Strauss (or your last name)
- **Phone Number**: Your contact number with country code
- **Email**: support@spect-it.com (or your support email)

**Sign-in Required:**
- **Sign-in required?**: Yes (if tests require account) or No (if basic tests work without login)
- If yes, provide **demo account credentials**:
  - Username: `demo@spect-it.com`
  - Password: `DemoPassword123!`
  - Notes: "Demo account has pre-saved screening results for review."

**Notes:**
```
Spect-IT provides VISION SCREENING ONLY, not medical diagnosis or prescriptions.

KEY FEATURES FOR REVIEW:
1. Vision screening tests: astigmatism, color vision, visual acuity
2. Camera permission requested for test calibration and face detection
3. Location permission requested ONLY for practice finder (optional)
4. Results are screening estimates, not final prescriptions
5. Privacy policy: https://spect-it.com/privacy
6. Terms of service: https://spect-it.com/terms

CAMERA USAGE:
- Face detection for measurement distance calibration
- Grid pattern display for astigmatism screening
- NO photos or videos stored

LOCATION USAGE:
- Completely optional
- Only for sorting nearby optical practices
- User can skip location access

NOT A MEDICAL DEVICE:
This app does NOT diagnose medical conditions, prescribe treatments, or claim medical accuracy. 
Users are advised to consult licensed optometrists for professional examinations.
```

### 6. Version Information
Navigate to **App Store → [Version Number] → Version Information**

**What's New in This Version** (Release Notes):
```
Initial Release v1.0.0

✨ Features:
• Astigmatism screening with grid pattern analysis
• Color vision screening with Ishihara-style plates
• Visual acuity screening with letter charts
• Near vision screening
• Camera calibration for accurate measurements
• Save and track screening results
• Find nearby optical practices
• Book appointments with specialists
• Export screening reports as PDF

⚠️ Important:
Spect-IT provides SCREENING ONLY, not medical diagnosis. 
All results should be confirmed by a licensed optometrist or ophthalmologist.

🔐 Privacy:
Full privacy policy at https://spect-it.com/privacy
```

**Promotional Text** (Optional, can update without review):
```
Quick vision screening for astigmatism, color vision, and visual acuity. Results are screening estimates — see a professional for diagnosis.
```

### 7. Screenshots and Previews
Navigate to **App Store → [Version] → Screenshots**

**iPhone Screenshots (REQUIRED):**
- **6.7" Display** (iPhone 14 Pro Max, 15 Plus, 15 Pro Max): 1290 x 2796 pixels
- **6.5" Display** (iPhone 11 Pro Max, XS Max): 1242 x 2688 pixels
- **5.5" Display** (iPhone 8 Plus): 1242 x 2208 pixels

**Minimum screenshots:** 2 per device size (recommend 4-6)

**Recommended screenshots:**
1. Home screen showing test options
2. Astigmatism screening test in progress
3. Color vision test with Ishihara plate
4. Results summary with screening values
5. Practice finder map (optional)
6. Clinical summary / trends (optional)

**iPad Screenshots (REQUIRED if supportsTablet: true):**
- **12.9" Display**: 2048 x 2732 pixels
- **9.7" Display** (older iPads): 1536 x 2048 pixels

**App Preview Videos (OPTIONAL):**
- Max 30 seconds per video
- Showcase key features (screening tests, results, practice finder)
- Must be actual app footage (no mockups)

**Design Tips:**
- Use real app screenshots (no mockups or artistic renderings)
- Show actual test screens, not just marketing text
- Include status bar and safe areas
- Avoid showing personal data in screenshots

### 8. App Store Description
Navigate to **App Store → [Version] → Description**

**Description** (Max 4000 characters):
```
Spect-IT provides mobile vision screening tools for early detection of common vision issues. Perfect for monitoring your eye health between professional check-ups.

🔍 SCREENING TESTS:
• Astigmatism Screening: Grid pattern analysis to detect astigmatism
• Color Vision Screening: Ishihara-style plates to check color blindness
• Visual Acuity Screening: Letter charts to measure clarity of vision
• Near Vision Screening: Check reading vision at close range

📱 KEY FEATURES:
• Camera calibration for accurate screening measurements
• Face detection to ensure proper test distance
• Save and track your screening results over time
• View trends and history of your vision health
• Find nearby optical practices with location search
• Book appointments with optometrists and ophthalmologists
• Export screening reports as PDF for professional review
• Secure cloud sync (optional)

⚠️ IMPORTANT MEDICAL DISCLAIMER:
Spect-IT provides SCREENING ONLY, not medical diagnosis or dispensable prescriptions. 

Results are ESTIMATES to help you monitor your vision and decide if you need a professional exam. This app does NOT replace licensed optometrists, ophthalmologists, or professional eye examinations.

All screening results should be confirmed by a qualified eye care professional before making any vision care decisions.

🔐 PRIVACY & SECURITY:
• Results stored securely (locally + optional cloud sync)
• Camera used ONLY for test calibration and face detection
• No photos or videos stored
• Location access is OPTIONAL (only for finding nearby practices)
• Full privacy policy: https://spect-it.com/privacy
• Terms of service: https://spect-it.com/terms

📋 WHO IS THIS FOR?
• Anyone wanting to monitor vision health between professional exams
• Parents tracking children's vision development
• Schools conducting preliminary vision screenings
• Individuals with family history of vision issues
• People experiencing vision changes who want initial screening

🚫 NOT FOR:
• Medical diagnosis of eye conditions
• Prescription glasses or contact lens fitting
• Emergency eye care
• Replacing professional eye exams

Spect-IT helps you stay informed about your vision health. Regular professional check-ups are essential for comprehensive eye care.

For questions or support: support@spect-it.com
```

**Keywords** (Max 100 characters, comma-separated):
```
vision,eye test,screening,astigmatism,color blind,visual acuity,eye health,optometrist
```

**Support URL**: https://spect-it.com (or dedicated support page)

**Marketing URL** (Optional): https://spect-it.com

### 9. Build Selection
Navigate to **App Store → [Version] → Build**

1. Click **Select a build before you submit your app**
2. Select the build uploaded via `eas submit` or Transporter
3. Wait for build processing (5-30 minutes)
4. Once processed, the build will show:
   - Version: 1.0.0
   - Build: 1
   - Upload date
   - Processing status: "Ready to Submit"

**Export Compliance:**
When selecting the build, Apple may ask:
- **Does your app use encryption?** 
  - Select **No** (standard HTTPS/TLS doesn't require declaration)
  - `ITSAppUsesNonExemptEncryption: false` in `app.config.js` handles this automatically

---

## TestFlight Testing (Highly Recommended)

### 1. Internal Testing
After uploading a build to App Store Connect, it's automatically available in TestFlight.

**Internal Testers:**
- Up to 100 internal testers (App Store Connect users)
- No review required
- Install via TestFlight app on iOS

**Add Internal Testers:**
1. Navigate to **TestFlight → Internal Testing**
2. Add testers by email (must have Apple IDs)
3. Testers receive invite link to install TestFlight app
4. Build installs directly (no review delay)

### 2. External Testing
**External Testers:**
- Up to 10,000 external testers
- Requires App Review approval (1-2 days)
- Great for broader beta testing

**Add External Testers:**
1. Navigate to **TestFlight → External Testing**
2. Create a new external testing group
3. Add tester emails or generate public link
4. Submit for review (include test notes)

### 3. Testing Checklist
Test thoroughly before submitting for App Store review:
- [ ] App installs successfully on multiple devices (iPhone, iPad)
- [ ] Camera permission prompt appears and works
- [ ] All screening tests run correctly (astigmatism, color, acuity)
- [ ] Results save and display properly
- [ ] Trends and history work
- [ ] Practice finder works (location permission optional)
- [ ] PDF export generates correctly
- [ ] No crashes or critical bugs
- [ ] Disclaimers are clear (screening not diagnosis)
- [ ] Privacy policy and terms links work
- [ ] App works offline (if applicable)
- [ ] Deep links work (`spectit://` scheme)

---

## App Review Submission

### 1. Submit for Review
Once all information is complete and TestFlight testing is done:

1. Navigate to **App Store → [Version]**
2. Review all sections (green checkmarks = complete)
3. Click **Add for Review**
4. Click **Submit to App Review**

### 2. Review Timeline
- **Initial review**: 24-48 hours (can take up to 7 days)
- **Subsequent updates**: Usually faster (24-48 hours)
- **Rejections**: Common on first submission; fix and resubmit

### 3. Common Rejection Reasons
**Medical Claims:**
- **Issue**: App appears to diagnose or prescribe
- **Fix**: Emphasize "screening only" in all copy, add disclaimers

**Privacy:**
- **Issue**: Camera/location usage not clearly explained
- **Fix**: Update `NSCameraUsageDescription` and `NSLocationWhenInUseUsageDescription` to be more specific

**Functionality:**
- **Issue**: App crashes or doesn't work as described
- **Fix**: Test thoroughly on real devices, fix bugs

**Incomplete Information:**
- **Issue**: Missing screenshots, demo account doesn't work, privacy policy inaccessible
- **Fix**: Verify all links work, test demo account, upload all required screenshots

**2.5.13 - Medical Apps:**
- **Issue**: Apple considers app a medical device
- **Fix**: Clarify this is a screening tool, not a medical device. Cite FDA guidance on wellness apps vs. medical devices.

### 4. If Rejected
1. Read rejection message carefully in Resolution Center
2. Make required changes to app or metadata
3. Respond to reviewer in Resolution Center
4. Resubmit for review (no need to upload new build unless code changes)

### 5. If Approved
- App goes live in App Store within 24 hours of approval
- Users can search and download
- App appears in your developer account's App Store listing

---

## App Updates

### Version Bump Process
1. Update `buildNumber` in `app.config.js` (increment by 1)
   - **Always increment `buildNumber`** for every TestFlight or App Store upload
2. Update `version` if needed (semantic versioning: 1.0.1, 1.1.0, 2.0.0)
3. Build new IPA:
   ```bash
   eas build -p ios --profile production
   ```
4. Submit to App Store Connect:
   ```bash
   eas submit -p ios --profile production
   ```
5. In App Store Connect, create new version (if version changed)
6. Add "What's New" release notes
7. Select new build
8. Submit for review

**Note**: Minor metadata changes (promotional text, screenshots) can be updated without review.

---

## Monorepo Considerations

**EAS Build Behavior:**
- EAS builds run in an isolated macOS environment
- Workspace dependencies (`@spect-it/cv`) should install automatically via npm/yarn workspaces
- If builds fail with workspace errors, add `eas-build-pre-install` hook in `package.json`:
  ```json
  "scripts": {
    "eas-build-pre-install": "npm install -g npm@latest && cd ../.. && npm install"
  }
  ```

**No secrets required** for the initial build. Supabase URL/keys can be added later via:
```bash
eas secret:create --scope project --name SUPABASE_URL --value "your-url"
eas secret:create --scope project --name SUPABASE_ANON_KEY --value "your-key"
```

Then reference in `app.config.js`:
```js
extra: {
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
}
```

---

## Permissions Documentation

### NSCameraUsageDescription
**Usage**: Vision test calibration, face detection for measurement distances, astigmatism grid pattern analysis  
**User prompt**: "Spect-IT uses your camera to calibrate and perform vision screening tests. This includes face detection for accurate measurement distances and grid pattern analysis for astigmatism screening."  
**Privacy impact**: High - camera access is core functionality

### NSLocationWhenInUseUsageDescription
**Usage**: Finding nearby optical practices (completely optional)  
**User prompt**: "Spect-IT can use your location to find nearby optical practices and help you book appointments. Location access is completely optional."  
**Privacy impact**: Low - optional feature, not core functionality

### ITSAppUsesNonExemptEncryption
**Value**: `false`  
**Reason**: App uses standard HTTPS/TLS encryption only (no custom cryptography)  
**Impact**: No export compliance documentation required

---

## Troubleshooting

### Build Fails with Code Signing Error
- Ensure you're logged in with correct Apple ID: `eas build -p ios --profile production`
- EAS should handle signing automatically
- Check EAS dashboard for detailed error logs

### "Bundle identifier already exists"
- Ensure `ios.bundleIdentifier` in `app.config.js` is `com.spectit.app`
- Verify bundle ID matches the one registered in App Store Connect

### "Build number already exists"
- Increment `ios.buildNumber` in `app.config.js`
- Build number must be unique for each upload to App Store Connect

### "Invalid provisioning profile"
- EAS manages provisioning automatically
- If using manual signing, regenerate profiles in Apple Developer account
- Check EAS credentials: `eas credentials -p ios`

### App Store Connect rejects app
- Verify privacy policy is accessible at https://spect-it.com/privacy
- Complete all required sections in App Privacy
- Ensure medical disclaimers are clear (screening not diagnosis)
- Provide working demo account if app requires sign-in

### App rejected for medical claims (2.5.13)
Update all copy to emphasize:
- "Screening" not "diagnosis"
- "Estimates" not "results"
- "Consult a professional" disclaimers everywhere
- Reference FDA guidance on wellness apps vs. medical devices

### TestFlight build not appearing
- Wait 5-30 minutes for build processing
- Check build status in App Store Connect → Activity
- Ensure build has "Processing" or "Ready to Submit" status
- If "Invalid Binary", check build logs for errors

---

## Resources

- **EAS Build docs**: https://docs.expo.dev/build/introduction/
- **EAS Submit docs**: https://docs.expo.dev/submit/introduction/
- **App Store Connect help**: https://developer.apple.com/support/app-store-connect/
- **App Store Review Guidelines**: https://developer.apple.com/app-store/review/guidelines/
- **Expo forums**: https://forums.expo.dev/
- **Apple Developer Portal**: https://developer.apple.com/account/

---

## Summary of Costs

- **Apple Developer Program**: $99 USD per year (required)
- **Expo EAS Build**: Free tier includes limited builds (check https://expo.dev/pricing)
  - Production account recommended for unlimited builds (~$29/month, already covered for Android)

---

## Next Steps for Tanya

### Prerequisites
1. **Enroll in Apple Developer Program** ($99/year): https://developer.apple.com/programs/enroll/
   - Individual: Use personal Apple ID
   - Organization: Requires D-U-N-S Number
   - Wait 1-2 business days for approval
2. **Expo account** (free, already set up for Android)
3. **Update eas.json** with Apple account details after enrollment

### Commands to Run
```bash
# 1. Ensure EAS CLI is installed (already done for Android)
npm install -g eas-cli

# 2. Login to Expo (already done for Android)
eas login

# 3. Build production archive for App Store
cd apps/mobile
eas build -p ios --profile production
# Wait 10-30 minutes, then download the .ipa file

# 4. Submit to App Store Connect
eas submit -p ios --profile production
# You'll be prompted for:
# - Apple ID: your-apple-id@example.com
# - App-specific password: generate at appleid.apple.com
# - App Store Connect App ID: numeric ID from App Store Connect
```

### Then in App Store Connect
1. Create app in App Store Connect (https://appstoreconnect.apple.com)
2. Complete app information (name, privacy URL, category)
3. Complete App Privacy questionnaire
4. Complete Age Rating questionnaire
5. Upload screenshots for iPhone and iPad
6. Write app description and keywords
7. Select build and submit for review
8. **Highly recommended**: Test with TestFlight first (internal testers)
9. Submit for App Store review (24-48 hours typical)

### Blockers
- **Apple Developer Program enrollment**: $99/year, 1-2 business days approval
- **App Store Connect app creation**: Requires Apple Developer Program
- **App screenshots**: Need iPhone and iPad screenshots (take from TestFlight builds)
- **Demo account**: If app requires sign-in, provide demo credentials for reviewers

### Estimated Timeline
- Apple Developer Program enrollment: 1-2 business days (up to 2 weeks for organizations)
- First iOS build: 10-30 minutes
- App Store Connect setup: 2-3 hours
- TestFlight internal testing: 1-2 weeks (recommended)
- App Review: 24-48 hours (can take up to 7 days)
- Total: 2-4 weeks from enrollment to App Store approval

---

## Cross-Platform Notes

See `PLAY_STORE_CHECKLIST.md` for Android Google Play Store submission.

**Key Differences:**
- **Apple**: $99/year subscription, stricter review, TestFlight for beta testing
- **Google**: $25 one-time fee, faster review, internal testing tracks
- **Both**: Require privacy policies, medical disclaimers, and thorough testing

**Bundle/Package ID**: `com.spectit.app` (same for both platforms)  
**Privacy Policy**: https://spect-it.com/privacy (same for both platforms)  
**Terms of Service**: https://spect-it.com/terms (same for both platforms)

Good luck with the iOS launch! 🚀
