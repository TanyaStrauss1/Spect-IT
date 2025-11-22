# 🚀 Development Commands - Terminal

## Quick Start

### Start Development Server
```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
npm start
```

This starts the Expo development server with:
- Hot reload enabled
- QR code for device testing
- Options for iOS/Android simulators

---

## Development Commands

### Start Development Server
```bash
npm start
```
or
```bash
expo start
```

**Options:**
- Press `i` - Open iOS simulator
- Press `a` - Open Android emulator
- Press `w` - Open in web browser
- Scan QR code - Open in Expo Go app on your phone

---

### Run on iOS Simulator
```bash
npm run ios
```
or
```bash
expo start --ios
```

---

### Run on Android Emulator
```bash
npm run android
```
or
```bash
expo start --android
```

---

### Run on Web
```bash
npm run web
```
or
```bash
expo start --web
```

---

## Testing on Physical Device

1. **Install Expo Go app:**
   - iOS: https://apps.apple.com/app/expo-go/id982107779
   - Android: https://play.google.com/store/apps/details?id=host.exp.exponent

2. **Start development server:**
   ```bash
   npm start
   ```

3. **Scan QR code** with:
   - iOS: Camera app
   - Android: Expo Go app

---

## Useful Development Commands

### Clear Cache
```bash
expo start --clear
```

### Run in Production Mode
```bash
expo start --no-dev --minify
```

### Check Project Status
```bash
npx expo-doctor
```

### Install Dependencies
```bash
npm install
```

---

## File Structure

```
SpectITMobile/
├── App.js              # Main app entry
├── app.json            # Expo configuration
├── package.json         # Dependencies
├── assets/             # Images, fonts, etc.
├── src/
│   ├── screens/        # App screens
│   ├── navigation/     # Navigation setup
│   ├── services/       # API services
│   └── components/     # Reusable components
```

---

## Hot Reload

Changes to your code will automatically reload:
- ✅ JavaScript changes - Instant reload
- ✅ Style changes - Instant reload
- ⚠️  Native changes - May require restart

---

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 8081
lsof -ti:8081 | xargs kill -9
```

### Clear Metro Cache
```bash
expo start --clear
```

### Reset Expo
```bash
expo start --reset-cache
```

---

## Development Tips

1. **Keep terminal open** - Development server must stay running
2. **Use Expo Go** - Fastest way to test on physical device
3. **Check console** - Errors appear in terminal
4. **Hot reload** - Save files to see changes instantly

---

## Next Steps

After development:
- Build for production: `eas build --platform ios`
- Test on device: Use Expo Go app
- Deploy: Follow build guides

