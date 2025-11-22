# 🚀 Quick Submit to App Stores

## Option 1: Submit Existing Builds (Fastest)

If you already have builds ready:

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
./SUBMIT_TO_STORES.sh
```

When asked "Do you have existing builds ready to submit?", answer: **y**

---

## Option 2: Build & Submit (Complete Process)

### Step 1: Login to EAS

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
eas login
# Enter: tanstrauss@gmail.com
# Approve in browser
```

### Step 2: Build Apps

**Build iOS:**
```bash
eas build --platform ios --profile production
```

**Build Android:**
```bash
eas build --platform android --profile production
```

**Monitor builds:**
https://expo.dev/accounts/tanstrauss/projects/spectit-mobile/builds

### Step 3: Submit After Builds Complete

```bash
./SUBMIT_TO_STORES.sh
```

---

## Option 3: Submit Separately

### Submit iOS Only:
```bash
eas submit --platform ios --latest
```

### Submit Android Only:
```bash
eas submit --platform android --latest
```

---

## After Submission

### iOS App Store Connect
1. Go to: https://appstoreconnect.apple.com
2. Sign in: tanstrauss@gmail.com
3. Complete listing:
   - Screenshots
   - Description
   - Privacy policy URL: https://www.spect-it.com/privacy-policy
4. Submit for review

### Google Play Console
1. Go to: https://play.google.com/console/u/0/developers/6438572372972515481
2. Create app or navigate to Spect-IT
3. Complete listing
4. Submit for review

---

## Troubleshooting

**"Not logged in to EAS"**
```bash
eas login
```

**"No builds found"**
- Build first: `eas build --platform ios --profile production`
- Wait for build to complete (10-20 minutes)
- Then submit

**"Apple ID required"**
- Already configured in `eas.json`: tanstrauss@gmail.com
- If prompted, enter: tanstrauss@gmail.com

---

**Ready? Run:** `./SUBMIT_TO_STORES.sh`

