# 🚀 Quick Build and Push Guide

## ✅ Status

- ✅ Assets created (icon, splash, favicon)
- ✅ iOS project generated
- ✅ Ready to build!

---

## 🍎 Option 1: Build with Xcode (Easier - Recommended)

### Step 1: Open in Xcode

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
open ios/spectit-mobile.xcworkspace
```

### Step 2: Configure & Build

1. **Wait for Xcode to index** (2-5 minutes)

2. **Select Project:**
   - Click **"spectit-mobile"** (blue icon) in left sidebar
   - Select **"spectit-mobile"** under TARGETS
   - Go to **"Signing & Capabilities"** tab

3. **Configure Signing:**
   - **Team:** Select your team (or add account: `tanstrauss@gmail.com`)
   - **Bundle Identifier:** Should be `com.spectit.app`
   - Xcode will handle certificates automatically

4. **Build & Archive:**
   - Select **"Any iOS Device"** (not simulator)
   - Go to: **Product** → **Archive**
   - Wait 5-15 minutes

5. **Submit:**
   - Organizer opens automatically
   - Click **"Distribute App"**
   - Select **"App Store Connect"**
   - Follow prompts to upload

---

## ☁️ Option 2: Build with EAS (Cloud)

### Step 1: Build

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
eas build --platform ios --profile production
```

**When prompted:**
- Apple ID: `tanstrauss@gmail.com`
- Password: [Your password]
- 2FA Code: [If enabled]

**⏱️ Takes 15-30 minutes**

### Step 2: Submit

After build completes:

```bash
eas submit --platform ios --latest
```

---

## 📊 Monitor Progress

- **EAS Builds:** https://expo.dev/accounts/tstrauss/projects/spectit-mobile/builds
- **App Store Connect:** https://appstoreconnect.apple.com/apps/6755681856/distribution/ios/version/inflight

---

## ✅ Quick Commands

```bash
# Open Xcode (Easier method)
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
open ios/spectit-mobile.xcworkspace

# OR Build with EAS
eas build --platform ios --profile production
```

---

**Xcode method is easier for authentication! Try that first.**

