# 🔐 Set Up EAS Credentials with New Password

## ✅ Your New Password

You've reset your Apple account password. Now set up EAS credentials.

---

## 🚀 Step 1: Set Up Credentials

**Run this command:**

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
eas credentials
```

**Follow prompts:**

1. **Select:** iOS
2. **Select:** production
3. **Choose:** "Set up new credentials" or "Use existing"
4. **Apple ID:** `tanstrauss@gmail.com`
5. **Password:** `Lily57048576!` (your new password)

---

## 🔒 Recommended: Use App-Specific Password

**To prevent account locking, use app-specific password instead:**

### Generate App-Specific Password:

1. **Go to:** https://appleid.apple.com/account/manage
2. **Sign in** with: `tanstrauss@gmail.com` and new password
3. **Security** → **App-Specific Passwords**
4. **Generate Password** → Name: "EAS Build"
5. **Copy the password** (format: `xxxx-xxxx-xxxx-xxxx`)

### Use App-Specific Password:

When EAS asks for password, use the app-specific password (not your regular password).

**This prevents account locking!**

---

## ✅ After Credentials Are Set Up

**Then build:**

```bash
eas build --platform ios --profile production
```

**Time:** 15-30 minutes

**What happens:**
- Builds in cloud
- Handles signing automatically
- Uploads to App Store Connect automatically

---

## 🍎 Alternative: Use Xcode

**If EAS still has issues, use Xcode:**

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
open ios/SpectIT.xcworkspace
```

**Then:**
- Configure signing (Team: P7BPRR2MY3)
- Product → Archive
- Distribute App → App Store Connect

**Xcode uses different authentication and may work better.**

---

## 📋 Quick Checklist

- [ ] Account unlocked with new password
- [ ] Sign in to https://appleid.apple.com to verify
- [ ] Generate app-specific password (recommended)
- [ ] Run: `eas credentials`
- [ ] Enter Apple ID and password (or app-specific password)
- [ ] Build: `eas build --platform ios --profile production`

---

## 🔗 Important Links

- **Apple ID Management:** https://appleid.apple.com/account/manage
- **App-Specific Passwords:** https://appleid.apple.com/account/manage (Security section)
- **App Store Connect:** https://appstoreconnect.apple.com/apps/6755681856

---

**Set up credentials now, then build!**

