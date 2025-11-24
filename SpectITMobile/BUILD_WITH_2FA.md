# 🔐 Building with 2FA Enabled

## ✅ Account Status

Your Apple account is enabled and ready for build.

---

## 🔑 If 2FA is Enabled

You have two options:

### Option 1: Use App-Specific Password (Recommended)

1. **Generate App-Specific Password:**
   - Go to: https://appleid.apple.com
   - Sign in
   - Go to: **Security** section
   - Find: **App-Specific Passwords**
   - Click: **Generate Password**
   - Label it: "EAS Build" or "Expo Build"
   - Copy the generated password (it looks like: `xxxx-xxxx-xxxx-xxxx`)

2. **Use in Build:**
   - When prompted for password, use the app-specific password
   - NOT your regular Apple ID password

### Option 2: Enter 2FA Code When Prompted

1. **Start Build:**
   - Use your regular password: `Kiara1403!`
   - When 2FA code is requested, enter code from your device

---

## 🚀 Start Build Now

### In Your Terminal:

1. **If build is waiting for retry:**
   - Type: `yes`
   - Enter Apple ID: `tanstrauss@gmail.com`
   - Enter Password: 
     - App-specific password (if generated), OR
     - Regular password `Kiara1403!` (if using 2FA code)
   - Enter 2FA code if prompted

2. **If starting fresh:**
   ```bash
   cd /Users/tanyastrauss/Spect-IT/SpectITMobile
   eas build --platform ios --profile production
   ```

---

## 📊 After Build Starts

- Monitor at: https://expo.dev/accounts/tstrauss/projects/spectit-mobile/builds
- Time: 15-30 minutes
- Status: Will show "in progress" then "finished"

---

## ✅ Quick Checklist

- [ ] Account is enabled ✅
- [ ] Check if 2FA is enabled
- [ ] Generate app-specific password (if 2FA enabled)
- [ ] Start build command
- [ ] Enter credentials when prompted
- [ ] Enter 2FA code if needed
- [ ] Monitor build progress

---

**Your account is ready! Proceed with the build in your terminal.**

