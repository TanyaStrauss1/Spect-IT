# 🚀 Quick Build & Submit Guide for App Store

## Using: `strausstanya93@gmail.com`

### Step 1: Login to EAS

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
eas login
```

**When prompted:**
- Email: `strausstanya93@gmail.com`
- Approve in browser or enter password

**Verify login:**
```bash
eas whoami
```

---

### Step 2: Build iOS App

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
eas build --platform ios --profile production
```

**What happens:**
- Builds iOS app (.ipa) in the cloud
- Takes 10-20 minutes
- You'll be prompted for Apple ID credentials if needed

**When prompted:**
- Apple ID: `strausstanya93@gmail.com`
- Password: [Your Apple ID password]
- 2FA Code: [If enabled]

---

### Step 3: Submit to App Store Connect

After build completes:

```bash
eas submit --platform ios --latest
```

**What happens:**
- Uploads .ipa to App Store Connect
- Makes app available for submission

---

### Step 4: Complete App Store Listing

1. **Go to App Store Connect:**
   - https://appstoreconnect.apple.com
   - Sign in with: `strausstanya93@gmail.com`

2. **Complete Required Information:**
   - App name: **Spect-IT**
   - Description
   - Screenshots (required)
   - Privacy Policy URL
   - App category
   - Age rating

3. **Submit for Review:**
   - Click "Submit for Review"
   - Wait for Apple's review (1-3 days typically)

---

## 🎯 All-in-One Script

Run the automated script:

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
./BUILD_AND_SUBMIT_IOS.sh
```

This script will:
1. Check EAS login
2. Build iOS app
3. Submit to App Store Connect
4. Guide you through next steps

---

## 📋 Prerequisites

- ✅ EAS CLI installed (`npm install -g eas-cli`)
- ✅ Expo account with `strausstanya93@gmail.com`
- ✅ Apple Developer account with `strausstanya93@gmail.com`
- ✅ App Store Connect access

---

## 🔗 Important Links

- **Expo Dashboard:** https://expo.dev
- **App Store Connect:** https://appstoreconnect.apple.com
- **Apple Developer:** https://developer.apple.com
- **Build Status:** Check at https://expo.dev/accounts/strausstanya93/projects/spectit-mobile/builds

---

## ⚠️ Troubleshooting

### "Not logged in"
```bash
eas login
# Enter: strausstanya93@gmail.com
```

### "Apple account locked"
- Go to: https://iforgot.apple.com
- Unlock account with `strausstanya93@gmail.com`

### "Build failed"
- Check build logs at: https://expo.dev
- Verify Apple Developer account is active
- Ensure bundle ID `com.spectit.app` is registered

### "Submit failed"
- Verify app exists in App Store Connect
- Check that build completed successfully
- Ensure you have App Store Connect access

---

## 📱 App Information

- **App Name:** Spect-IT
- **Bundle ID:** com.spectit.app
- **Version:** 1.0.0
- **Build Number:** 1
- **Owner:** strausstanya93

---

## ✅ Checklist

- [ ] Logged in to EAS with `strausstanya93@gmail.com`
- [ ] Apple Developer account active
- [ ] App Store Connect access confirmed
- [ ] iOS build completed successfully
- [ ] App submitted to App Store Connect
- [ ] App Store listing completed
- [ ] Screenshots uploaded
- [ ] Privacy policy URL added
- [ ] App submitted for review

