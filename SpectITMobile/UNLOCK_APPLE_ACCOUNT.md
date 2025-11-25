# 🔓 Unlock Apple Account - Step-by-Step Guide

## ❌ Error

**Error -20209:** "This Apple Account has been locked for security reasons"

**Cause:** Apple locked your account due to:
- Multiple failed login attempts
- Suspicious activity
- Security concerns

---

## ✅ Solution: Unlock Your Account

### Step 1: Go to iForgot

**Direct Link:**
https://iforgot.apple.com

**Or navigate:**
1. Go to: https://appleid.apple.com
2. Click **"Forgot Apple ID or password?"**
3. Or go directly to: https://iforgot.apple.com

---

### Step 2: Enter Apple ID

**Enter your Apple ID:**
```
tanstrauss@gmail.com
```

**Click "Continue"**

---

### Step 3: Choose Unlock Method

Apple will offer options to unlock:

**Option A: Email**
- Apple sends unlock email to your email address
- Check email: `tanstrauss@gmail.com`
- Click unlock link in email

**Option B: Security Questions**
- Answer your security questions
- If correct, account unlocks

**Option C: Two-Factor Authentication**
- Use trusted device
- Enter verification code

---

### Step 4: Follow Unlock Instructions

1. **Complete the unlock process** using chosen method
2. **Wait for confirmation** that account is unlocked
3. **May need to reset password** if required

---

### Step 5: Verify Account is Unlocked

1. **Try signing in:**
   - Go to: https://appleid.apple.com
   - Sign in with: `tanstrauss@gmail.com`
   - Enter password

2. **If successful:** Account is unlocked ✅

---

## 🔄 After Unlocking

### Option 1: Retry EAS Build

Once account is unlocked:

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
eas credentials
```

**Then:**
- Select: iOS → production
- Set up credentials again
- Should work now!

---

### Option 2: Use Xcode Build Instead

**If EAS continues to have issues, use Xcode:**

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
open ios/SpectIT.xcworkspace
```

**Then:**
- Configure signing
- Archive
- Distribute to App Store Connect

**Xcode handles authentication differently and may work even if EAS doesn't.**

---

## ⚠️ Why Accounts Get Locked

Common reasons:
- Multiple failed login attempts
- Using wrong password repeatedly
- Suspicious activity detected
- Security policy violations

**Prevention:**
- Use correct password
- Use app-specific passwords for CLI tools
- Don't share credentials
- Enable 2FA properly

---

## 🔐 Use App-Specific Password (Recommended)

**After unlocking, use app-specific password for EAS:**

1. **Go to:** https://appleid.apple.com/account/manage
2. **Security** → **App-Specific Passwords**
3. **Generate Password** → Name: "EAS Build"
4. **Copy password** (format: `xxxx-xxxx-xxxx-xxxx`)
5. **Use this password** when EAS asks (not your regular password)

**This prevents account locking!**

---

## 📋 Quick Checklist

- [ ] Go to: https://iforgot.apple.com
- [ ] Enter Apple ID: `tanstrauss@gmail.com`
- [ ] Choose unlock method (email/security questions/2FA)
- [ ] Complete unlock process
- [ ] Verify account unlocked (sign in to appleid.apple.com)
- [ ] Generate app-specific password
- [ ] Retry EAS credentials or use Xcode

---

## 🔗 Important Links

- **iForgot:** https://iforgot.apple.com
- **Apple ID Management:** https://appleid.apple.com/account/manage
- **App-Specific Passwords:** https://appleid.apple.com/account/manage (Security section)

---

## 💡 Alternative: Use Xcode

**While waiting to unlock, you can use Xcode:**

Xcode uses different authentication and may work even if EAS doesn't:

1. **Open Xcode:**
   ```bash
   open ios/SpectIT.xcworkspace
   ```

2. **Build and upload** directly from Xcode
3. **No EAS credentials needed**

---

**Unlock your account first, then retry building!**

