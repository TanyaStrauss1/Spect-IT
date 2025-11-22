r# 🚀 Quick App Store Submission

## Fastest Path to App Store

### Step 1: Install EAS CLI

```bash
npm install -g eas-cli
```

### Step 2: Login

```bash
eas login
```

### Step 3: Configure Project

```bash
cd SpectITMobile
eas build:configure
```

### Step 4: Build iOS App

```bash
eas build --platform ios --profile production
```

⏱️ Takes 15-30 minutes

### Step 5: Submit to App Store

```bash
eas submit --platform ios --profile production
```

### Step 6: Build Android App

```bash
eas build --platform android --profile production
```

### Step 7: Submit to Play Store

```bash
eas submit --platform android --profile production
```

---

## Before Building

1. **Update app.json:**
   - Change bundle identifier to unique value
   - Update app name if needed
   - Set version to "1.0.0"

2. **Create App Store Connect App:**
   - Go to https://appstoreconnect.apple.com
   - Create new app
   - Note the App ID

3. **Update eas.json:**
   - Add your Apple ID
   - Add App Store Connect App ID
   - Add Apple Team ID

---

## Required Before Submission

✅ App icon (1024x1024 PNG)
✅ Screenshots (multiple sizes)
✅ App description
✅ Privacy policy URL
✅ Support URL
✅ Age rating

---

## Quick Checklist

- [ ] EAS CLI installed
- [ ] Logged into Expo
- [ ] App Store Connect app created
- [ ] Bundle ID configured
- [ ] App icon added
- [ ] Screenshots prepared
- [ ] Privacy policy ready
- [ ] Build completed
- [ ] Submitted for review

---

**See APP_STORE_SUBMISSION.md for detailed instructions!**

