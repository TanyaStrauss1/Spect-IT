# 🚀 Start Build Process

## Quick Start

Since EAS login requires interactive browser authentication, please run these commands in your terminal:

### 1. Login to EAS

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
eas login
```

**When prompted:**
- Enter: `strausstanya93@gmail.com`
- A browser will open - approve the login

### 2. Verify Login

```bash
eas whoami
```

Should show: `strausstanya93@gmail.com`

### 3. Build iOS App

```bash
eas build --platform ios --profile production
```

**During build, you may be prompted for:**
- Apple ID: `strausstanya93@gmail.com`
- Apple ID password
- 2FA code (if enabled)

### 4. Submit to App Store (After Build Completes)

```bash
eas submit --platform ios --latest
```

---

## Or Use Automated Script

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
./login_and_build.sh
```

---

## Build Status

Monitor your build at:
https://expo.dev/accounts/strausstanya93/projects/spectit-mobile/builds

---

## Need Help?

See `QUICK_BUILD_GUIDE.md` for detailed instructions.

