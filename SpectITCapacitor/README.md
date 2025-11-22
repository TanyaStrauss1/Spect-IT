# 📱 Spect-IT Capacitor App

This is an alternative way to create your mobile app using **Capacitor**, which wraps your existing website as a native app.

## ✅ Advantages

- ✅ Uses your existing website code (HTML/CSS/JS)
- ✅ No need to rewrite anything
- ✅ Access to native device features (camera, GPS, etc.)
- ✅ Single codebase for iOS & Android
- ✅ Faster development
- ✅ Easier to maintain

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITCapacitor
npm install
```

### 2. Setup Capacitor

```bash
./SETUP_CAPACITOR.sh
```

Or manually:

```bash
npx cap init "Spect-IT" "com.spectit.app" --web-dir="../website"
npx cap add ios
npx cap add android
npx cap sync
```

### 3. Open in Native IDEs

**iOS:**
```bash
npx cap open ios
```
Opens in Xcode - build and run from there.

**Android:**
```bash
npx cap open android
```
Opens in Android Studio - build and run from there.

## 📦 Build for App Stores

### Using EAS (Recommended)

```bash
# Install EAS CLI if not already installed
npm install -g eas-cli

# Login
eas login

# Build iOS
eas build --platform ios

# Build Android
eas build --platform android
```

### Using Native IDEs

1. **iOS:**
   - Open in Xcode: `npx cap open ios`
   - Product → Archive
   - Distribute to App Store

2. **Android:**
   - Open in Android Studio: `npx cap open android`
   - Build → Generate Signed Bundle
   - Upload to Play Store

## 🔄 Sync Changes

After making changes to your website:

```bash
npx cap sync
```

This syncs your website files to the native projects.

## 📁 Project Structure

```
SpectITCapacitor/
├── capacitor.config.ts    # Capacitor configuration
├── package.json           # Dependencies
├── ios/                   # iOS native project
├── android/               # Android native project
└── SETUP_CAPACITOR.sh    # Setup script
```

Your website code stays in `../website/` - no changes needed!

## 🎯 How It Works

1. Capacitor wraps your website in a native WebView
2. Your website runs inside the app
3. Capacitor plugins provide access to native features
4. Everything works exactly like your website, but as an app!

## 📱 Native Features Available

- ✅ Camera access (for eye tests)
- ✅ GPS/Location (for finding specialists)
- ✅ File system (for saving results)
- ✅ Status bar control
- ✅ Splash screen
- ✅ App lifecycle events

## 🔗 Resources

- [Capacitor Docs](https://capacitorjs.com/docs)
- [Capacitor Plugins](https://capacitorjs.com/docs/plugins)

---

**This is much simpler than Expo/React Native and uses all your existing code!**

