# Google Play Store Submission Checklist

This document outlines the exact steps required to submit Spect-IT to Google Play Store.

---

## Prerequisites

### 1. Expo Account & EAS CLI
```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to your Expo account
eas login

# Configure project (run from apps/mobile)
cd apps/mobile
eas build:configure
```

When prompted, Expo will create a project and add the `projectId` to `app.config.js`. Replace `"your-project-id-here"` with the actual project ID.

### 2. Google Play Console Account
- **Cost**: $25 one-time registration fee
- **Sign up**: https://play.google.com/console/signup
- **Account type**: Individual or Organization (choose based on business structure)

---

## Build Configuration

### Android Version Management
- **Version name**: `1.0.0` (semantic, user-facing in app.config.js)
- **Version code**: `1` (integer, increments with each release in app.config.js)
- **Increment versionCode** for every new build submitted to Play Store

### Build Profiles (apps/mobile/eas.json)
- **development**: APK for testing with development client
- **preview**: APK for internal testing without dev tools
- **production**: AAB (Android App Bundle) for Play Store submission

---

## Building for Play Store

### 1. Create Production Build
```bash
cd apps/mobile

# Build production AAB
eas build -p android --profile production

# Wait for build to complete (5-20 minutes)
# Build artifacts are hosted by Expo and can be downloaded
```

### 2. Download the AAB
After the build completes, EAS will provide:
- Download URL for the `.aab` file
- Build ID and build details
- QR code for installation (not applicable for AAB)

---

## Google Play Console Setup

### 1. Create App
1. Go to https://play.google.com/console
2. Click **Create app**
3. Fill in:
   - **App name**: Spect-IT Vision Screening
   - **Default language**: English (South Africa) or English (United States)
   - **App or game**: App
   - **Free or paid**: Free
4. Accept declarations and create app

### 2. Store Listing
Navigate to **Dashboard → Store presence → Main store listing**

**App details:**
- **App name**: Spect-IT Vision Screening
- **Short description** (80 chars):
  ```
  Quick vision screening tests for astigmatism, color vision, and visual acuity.
  ```
- **Full description** (4000 chars):
  ```
  Spect-IT provides mobile vision screening tools for early detection of common vision issues. 
  
  🔍 SCREENING TESTS:
  • Astigmatism screening (grid pattern analysis)
  • Color vision screening (Ishihara-style plates)
  • Visual acuity screening (letter chart)
  • Near vision screening
  
  📱 FEATURES:
  • Camera calibration for accurate screening
  • Save and track results over time
  • Find nearby optical practices
  • Book appointments with specialists
  • Export screening reports (PDF)
  
  ⚠️ IMPORTANT DISCLAIMER:
  Spect-IT provides SCREENING ONLY, not medical diagnosis or dispensable prescriptions. 
  Results should be confirmed by a licensed optometrist or ophthalmologist. 
  This app does not replace professional eye examinations.
  
  🔐 PRIVACY:
  • Results stored locally and optionally synced to secure cloud
  • Camera used only for test calibration
  • Location access optional (for finding nearby practices)
  • Full privacy policy: https://spect-it.com/privacy
  
  Spect-IT helps you monitor your vision health between professional check-ups.
  ```

**Graphics:**
- **App icon**: 512x512 PNG (use assets/adaptive-icon.png as reference)
- **Feature graphic**: 1024x500 PNG (required for Play Store)
- **Phone screenshots**: At least 2 screenshots (1080x1920 or higher)
  - Take screenshots of key screens: home, test selection, test in progress, results
- **7-inch tablet screenshots**: Optional but recommended
- **10-inch tablet screenshots**: Optional

**Categorization:**
- **App category**: Health & Fitness
- **Tags**: vision, eye test, screening, health
- **Content rating**: See section 3 below
- **Target audience**: Adults (13+)
- **Store presence**: All countries or specific regions (recommend South Africa initially)

**Contact details:**
- **Email**: support@spect-it.com (or your support email)
- **Website**: https://spect-it.com
- **Privacy policy**: https://spect-it.com/privacy (REQUIRED)
- **Terms of service**: https://spect-it.com/terms

### 3. Content Rating
Navigate to **Dashboard → Policy → App content → Content ratings**

Complete the IARC questionnaire:
- **App category**: Select "Health & Fitness" or "Medical"
- **Medical/health questions**:
  - "Does your app provide medical information?": **No** (screening only)
  - "Does your app diagnose medical conditions?": **No**
  - "Does your app provide treatment recommendations?": **No**
- **Violence, sexual content, etc.**: All **No**

After completion, you'll receive ratings for different regions (ESRB, PEGI, etc.)

### 4. Data Safety
Navigate to **Dashboard → Policy → App content → Data safety**

**Data collection:**
- ✅ **Personal information**: Email address
- ✅ **Health and fitness**: Vision screening results
- ✅ **App activity**: Test history, timestamps
- ✅ **Device or other IDs**: Device type, browser info
- ✅ **Approximate location**: Optional, only for practice finder

**Data usage:**
- Purpose: App functionality, analytics
- Data encrypted in transit: **Yes**
- Users can request deletion: **Yes** (via privacy@spect-it.com)
- Data shared with third parties: **Only service providers** (Supabase, Vercel)
- No data sold to third parties

### 5. Medical App Declaration
Navigate to **Dashboard → Policy → App content**

Complete the **Health apps** declaration:
- **Is this a health app?**: Yes
- **Does it make medical claims?**: No (screening only, not diagnosis)
- **Is it FDA approved or equivalent?**: No (not a medical device)
- **Privacy policy provided**: Yes (https://spect-it.com/privacy)

### 6. Target Audience & News Apps
- **Target age**: 13+ or 18+ (health content)
- **News app**: No

---

## Upload and Testing

### 1. Internal Testing Track
Navigate to **Dashboard → Release → Testing → Internal testing**

1. Click **Create new release**
2. Upload the `.aab` file downloaded from EAS
3. Add release notes:
   ```
   Initial release v1.0.0
   - Astigmatism screening
   - Color vision screening
   - Visual acuity screening
   - Practice finder and booking
   ```
4. Review and roll out to internal testing
5. Add testers (email addresses with Google accounts)
6. Testers receive invite link to install via Play Store

**Testing checklist:**
- [ ] App installs successfully
- [ ] Camera permission granted and works
- [ ] All screening tests run correctly
- [ ] Results save and display properly
- [ ] Practice finder works (location permission optional)
- [ ] No crashes or critical bugs

### 2. Closed Testing (Alpha)
After internal testing, promote to closed testing with a larger group (50-100 testers).

### 3. Open Testing (Beta)
Optional: Open to any Google user for broader feedback.

### 4. Production Release
Once testing is complete:
1. Navigate to **Dashboard → Release → Production**
2. Create new production release
3. Upload the same `.aab` (or rebuild if changes were made)
4. Set rollout percentage (start with 20%, increase to 100%)
5. Review and publish

**Review time**: 1-7 days (first submission typically takes longer)

---

## App Updates

### Version Bump Process
1. Update `android.versionCode` in `app.config.js` (increment by 1)
2. Update `version` if needed (semantic versioning)
3. Build new AAB:
   ```bash
   eas build -p android --profile production
   ```
4. Upload to Play Console production track
5. Add release notes describing changes

---

## Monorepo Considerations

**EAS Build Behavior:**
- EAS builds run in an isolated environment
- Workspace dependencies (@spect-it/cv) should install automatically via npm/yarn workspaces
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

### CAMERA
**Usage**: Vision test calibration and face detection for screening accuracy
**User prompt**: "Spect-IT uses your camera to calibrate screening tests on your device."

### ACCESS_COARSE_LOCATION
**Usage**: Finding nearby optical practices (optional)
**User prompt**: "Spect-IT can use your location to sort nearby optical stores. Location is optional."
**Note**: Removed `ACCESS_FINE_LOCATION` as coarse location is sufficient for practice finder

---

## Troubleshooting

### Build Fails with "workspaces" Error
Add workspace installation hook (see Monorepo Considerations above)

### "Invalid package name"
Ensure `android.package` in `app.config.js` is `com.spectit.app`

### "Version code already exists"
Increment `android.versionCode` in `app.config.js`

### Play Console rejects app
- Verify privacy policy is accessible at https://spect-it.com/privacy
- Complete all required sections in Data Safety
- Ensure medical disclaimers are clear (screening not diagnosis)

### App rejected for medical claims
Update store listing to emphasize "screening" and "not a medical diagnosis"

---

## Resources

- **EAS Build docs**: https://docs.expo.dev/build/introduction/
- **EAS Submit docs**: https://docs.expo.dev/submit/introduction/
- **Play Console help**: https://support.google.com/googleplay/android-developer
- **Expo forums**: https://forums.expo.dev/

---

## Summary of One-Time Costs

- Google Play Console registration: **$25 USD**
- Expo EAS Build: **Free tier includes limited builds** (check https://expo.dev/pricing)
  - Production account recommended for unlimited builds (~$29/month)

---

## Next Steps

After this PR is merged:

1. **Tanya's tasks**:
   - [ ] `eas login` (create Expo account if needed)
   - [ ] `cd apps/mobile && eas build:configure` (get project ID)
   - [ ] Update `app.config.js` with real project ID
   - [ ] `eas build -p android --profile production` (first build)
   - [ ] Register Google Play Console ($25)
   - [ ] Complete Play Console setup (store listing, content rating, data safety)
   - [ ] Upload AAB to internal testing track
   - [ ] Test with internal testers
   - [ ] Submit for production review

2. **Blockers**:
   - Expo account (free, create at expo.dev)
   - Google Play Console account ($25 one-time)
   - App screenshots (take from running app)
   - Feature graphic 1024x500 (can create from existing branding)

3. **Estimated timeline**:
   - Setup and first build: 1-2 hours
   - Play Console configuration: 2-3 hours
   - Internal testing: 1-2 weeks
   - Review and approval: 1-7 days

Good luck with the launch! 🚀
