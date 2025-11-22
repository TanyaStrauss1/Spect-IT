# 📱 Google Play Store Configuration

## ✅ Developer Account Information

**Developer Account ID:** `6438572372972515481`

**Account URL:** https://play.google.com/console/u/0/developers/6438572372972515481

---

## 🚀 Android App Submission

### Step 1: Build Android App Bundle (.aab)

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
eas login
eas build --platform android --profile production
```

**This will:**
- Create Android App Bundle (.aab) file
- Take 10-20 minutes
- Upload to EAS Build servers
- Provide download link when complete

---

### Step 2: Download .aab File

1. Go to: https://expo.dev/accounts/tanstrauss/projects/spectit-mobile/builds
2. Find your Android build
3. Download the .aab file

---

### Step 3: Submit to Google Play Console

1. **Go to Play Console:**
   - https://play.google.com/console/u/0/developers/6438572372972515481/apps

2. **Create New App (if not created):**
   - Click "Create app"
   - App name: **Spect-IT**
   - Default language: **English (South Africa)**
   - App or game: **App**
   - Free or paid: **Free**
   - Click "Create"

3. **Upload .aab File:**
   - Go to: **Production** → **Create new release**
   - Upload your .aab file
   - Add release notes
   - Click "Save"

4. **Complete Store Listing:**
   - Go to: **Store presence** → **Main store listing**
   - Add app description (see `APP_STORE_CONTENT.md`)
   - Upload screenshots
   - Add privacy policy URL: `https://www.spect-it.com/privacy-policy`
   - Complete all required fields

5. **Content Rating:**
   - Go to: **Content rating**
   - Complete questionnaire
   - Submit for rating

6. **Submit for Review:**
   - Go to: **Production** → **Review**
   - Click "Start rollout to Production"
   - Submit for review

---

## 📋 App Information

**Package Name:** `com.spectit.app`

**App Name:** Spect-IT

**Version:** 1.0.0

**Version Code:** 1

---

## 🔗 Quick Links

- **Play Console:** https://play.google.com/console/u/0/developers/6438572372972515481
- **Create App:** https://play.google.com/console/u/0/developers/6438572372972515481/apps/create
- **EAS Builds:** https://expo.dev/accounts/tanstrauss/projects/spectit-mobile/builds

---

## ✅ Checklist

- [ ] Build Android .aab file
- [ ] Download .aab file
- [ ] Create app in Play Console
- [ ] Upload .aab file
- [ ] Complete store listing
- [ ] Add screenshots
- [ ] Add privacy policy
- [ ] Complete content rating
- [ ] Submit for review

---

**Developer Account ID:** `6438572372972515481` ✅

