# 🚀 Quick Build Reference - Spect-IT App

## ✅ Prerequisites Met
- Xcode installed
- Node.js installed
- EAS CLI installed
- Project configured

## 🚀 Build Commands

### Option 1: EAS Cloud Build (Recommended)
```bash
# Set up credentials first (interactive)
eas credentials --platform ios
# Select: production
# Apple ID: tanstrauss@gmail.com
# Password: (app-specific if 2FA)

# Then build
eas build --platform ios --profile production
```

### Option 2: Xcode Build
```bash
# Open Xcode
open ios/SpectIT.xcworkspace

# In Xcode:
# 1. Configure signing (Team: P7BPRR2MY3)
# 2. Select "Any iOS Device"
# 3. Product → Archive
# 4. Distribute App → App Store Connect
```

## 📊 Monitor Builds
- EAS: https://expo.dev/accounts/tstrauss/projects/spectit-mobile/builds
- App Store Connect: https://appstoreconnect.apple.com/apps/6755681856

## 🔗 Important Links
- App Store Connect: https://appstoreconnect.apple.com/apps/6755681856
- TestFlight: https://appstoreconnect.apple.com/apps/6755681856/testflight/ios
- Privacy Policy: https://tanyastrauss1.github.io/Spect-IT/privacy-policy.html
