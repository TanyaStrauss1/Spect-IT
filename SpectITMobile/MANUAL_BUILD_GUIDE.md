# 🔨 Manual Build Guide

## ⚠️ Why Manual Build?

The automated build script is having authentication issues. Running the build manually in your terminal allows you to:
- Handle 2FA codes if required
- See real-time prompts
- Enter credentials securely

---

## 🚀 Step-by-Step Build Instructions

### 1. Open Terminal

Open a new Terminal window.

### 2. Navigate to Project

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
```

### 3. Start Build

```bash
eas build --platform ios --profile production
```

### 4. Answer Prompts

When prompted, enter:

**Prompt 1:** "Do you want to log in to your Apple account?"
- **Answer:** Type `y` and press Enter

**Prompt 2:** "Apple ID:"
- **Answer:** Type `tanstrauss@gmail.com` and press Enter

**Prompt 3:** "Password:"
- **Answer:** Type your password `Kiara1403!` and press Enter
- ⚠️ **Note:** If this fails, your password may have changed or 2FA is required

**Prompt 4:** (If 2FA is enabled)
- **Answer:** Enter the 2FA code from your device

---

## ✅ After Build Starts

Once the build starts, you'll see:
- "Building..." or "Queued..."
- A build ID
- Link to monitor progress

### Monitor Build:
- **Expo Dashboard:** https://expo.dev/accounts/tstrauss/projects/spectit-mobile/builds
- **Time:** 15-30 minutes

---

## 🔐 Troubleshooting Authentication

### If Password Fails:

1. **Verify Password:**
   - Check if password is correct: `Kiara1403!`
   - Try logging into https://appleid.apple.com manually

2. **Check 2FA:**
   - If 2FA is enabled, you'll need to enter the code
   - Code appears on your trusted device

3. **Reset Password (if needed):**
   - Go to: https://iforgot.apple.com
   - Reset password if necessary

---

## 📤 After Build Completes

Once build shows "finished" in Expo dashboard:

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
eas submit --platform ios --latest
```

---

## 🔗 Important Links

- **Monitor Builds:** https://expo.dev/accounts/tstrauss/projects/spectit-mobile/builds
- **App Store Connect:** https://appstoreconnect.apple.com/apps/6755681856/distribution/ios/version/inflight
- **Apple ID:** https://appleid.apple.com

---

**Run the build command in your terminal to handle authentication interactively!**

