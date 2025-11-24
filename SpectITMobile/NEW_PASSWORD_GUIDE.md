# 🔐 New Password Guide

## ✅ Password Updated

Your Apple ID password for `tanstrauss@gmail.com` has been changed.

---

## 🚀 Using New Password

### Option 1: Xcode (Recommended - Easier)

Xcode is already open. When prompted for credentials:

1. **In Xcode Signing:**
   - If asked to sign in, use: `tanstrauss@gmail.com`
   - **Password:** Enter your **NEW password**
   - 2FA code if prompted

2. **During Archive/Upload:**
   - Xcode will prompt for Apple ID if needed
   - Use: `tanstrauss@gmail.com`
   - **Password:** Enter your **NEW password**

---

### Option 2: EAS Build (Terminal)

When building with EAS:

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
eas build --platform ios --profile production
```

**When prompted:**
- Apple ID: `tanstrauss@gmail.com`
- **Password:** Enter your **NEW password**
- 2FA Code: [If enabled, enter code from device]

---

### Option 3: If 2FA is Enabled

If 2FA is enabled, you may still need an **app-specific password**:

1. **Create App-Specific Password:**
   - Go to: https://appleid.apple.com
   - Sign in with your **NEW password**
   - Security → App-Specific Passwords
   - Generate Password
   - Label: "EAS Build"
   - Copy the password

2. **Use App-Specific Password:**
   - When building, use the app-specific password
   - NOT your regular password

---

## 🔄 Clear Old Credentials

If old credentials are cached:

### Clear Keychain:
```bash
# Remove old Apple ID password from keychain
security delete-internet-password -s appleid.apple.com -a tanstrauss@gmail.com 2>/dev/null || echo "No old password found"
```

### Clear EAS Credentials:
```bash
# EAS credentials are stored remotely, but you can re-authenticate
eas logout
eas login
# Then use your NEW password
```

---

## ✅ Next Steps

1. **In Xcode (if still open):**
   - If signing fails, re-enter credentials with NEW password
   - Go to: Xcode → Preferences → Accounts
   - Remove and re-add your Apple ID if needed
   - Use NEW password when signing in

2. **Try Building Again:**
   - Product → Archive
   - Use NEW password when prompted

---

## 📋 Quick Checklist

- [ ] Password changed: ✅
- [ ] Use NEW password in Xcode
- [ ] Use NEW password in EAS build commands
- [ ] If 2FA enabled, consider app-specific password
- [ ] Clear old cached credentials if needed

---

## 🎯 Recommended: Use Xcode

Since Xcode is already open:

1. **Re-authenticate if needed:**
   - Xcode → Preferences → Accounts
   - Remove account if present
   - Add account again with NEW password

2. **Build:**
   - Product → Archive
   - Use NEW password when prompted

---

**Use your NEW password in Xcode or build commands. The old password won't work anymore!**

