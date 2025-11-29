# 🚀 Build iOS App - Simple Instructions

## Quick Build Command

**Run this in your terminal:**

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
eas build --platform ios --profile production
```

---

## What Happens

1. **Credentials Setup** (first time only)
   - Prompts for Apple ID: `tanstrauss@gmail.com`
   - Prompts for password (or app-specific password if 2FA enabled)

2. **Build Process** (15-30 minutes)
   - Builds app in cloud
   - Handles code signing automatically
   - Uploads to App Store Connect automatically

3. **Processing** (15-30 minutes)
   - Build appears in TestFlight
   - Status: "Processing" → "Ready to Submit"

---

## Credentials

**If you have 2FA enabled:**

1. Go to: https://appleid.apple.com/account/manage
2. Click **Security**
3. Click **App-Specific Passwords**
4. Generate password for "EAS Build"
5. Use that password when prompted

---

## Monitor Build

**Check build status:**

- **EAS Builds:** https://expo.dev/accounts/tstrauss/projects/spectit-mobile/builds
- **TestFlight:** https://appstoreconnect.apple.com/teams/c5c5f5d2-8ebe-443d-957f-b4038c7db237/apps/6755681856/testflight

---

## After Build Completes

1. Wait for "Ready to Submit" status in TestFlight
2. Go to App Store tab
3. Select the build
4. Complete submission form
5. Submit for review

---

**Run the command above to start building!** 🚀

