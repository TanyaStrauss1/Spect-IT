# 🔒 Fix Apple Account Locked Error

## ❌ Error Message

```
Authentication with Apple Developer Portal failed!
Apple Service Error -20209. This Apple Account has been locked for security reasons.
```

---

## 🔓 How to Unlock Your Account

### Step 1: Visit iForgot

**Go to:** https://iforgot.apple.com

**This will:**
- Unlock your account
- Reset your password if needed
- Verify your identity

### Step 2: Sign In to Apple ID

1. **Enter your Apple ID:** `tanstrauss@gmail.com`
2. **Follow the prompts** to verify your identity
3. **Reset password** if required
4. **Unlock the account**

### Step 3: Verify Account Status

**Check account status:**
- Go to: https://appleid.apple.com/account/manage
- Sign in with your Apple ID
- Verify account is unlocked

---

## 🔐 After Unlocking

### Option 1: Use App-Specific Password (Recommended)

**If you have 2FA enabled, use an app-specific password:**

1. **Go to:** https://appleid.apple.com/account/manage
2. **Click "Security"**
3. **Click "App-Specific Passwords"**
4. **Generate password** for "EAS Build"
5. **Use that password** when building

**This prevents account lockouts!**

### Option 2: Wait Before Retrying

**If you just unlocked:**
- Wait **15-30 minutes** before trying to build again
- Apple may need time to sync the unlock status

---

## 🚀 Alternative Build Methods

### Method 1: Xcode Build (No Apple ID Login Required)

**Build locally with Xcode:**

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
open ios/SpectIT.xcworkspace
```

**Then in Xcode:**
1. Select **"SpectIT"** target
2. **"Signing & Capabilities"** tab
3. Select Team: **P7BPRR2MY3**
4. **Product → Archive**
5. **Distribute App → App Store Connect**

**This uses your existing certificates, no login needed!**

### Method 2: Wait and Retry EAS Build

**After unlocking and waiting:**
```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
eas build --platform ios --profile production
```

---

## 🛡️ Prevent Future Lockouts

### Use App-Specific Passwords

**Always use app-specific passwords for:**
- EAS Build
- Xcode Cloud
- Any automated tools

**Never use your main Apple ID password for automated tools!**

### Enable 2FA

**If not already enabled:**
1. Go to: https://appleid.apple.com/account/manage
2. Enable Two-Factor Authentication
3. Generate app-specific passwords for tools

---

## ⏱️ Timeline

**After unlocking:**
- **Immediate:** Account unlocked
- **15-30 minutes:** Wait before retrying EAS Build
- **Alternative:** Use Xcode build immediately (no wait needed)

---

## ✅ Recommended Next Steps

1. **Unlock account:** https://iforgot.apple.com
2. **Generate app-specific password** (if 2FA enabled)
3. **Use Xcode build** (fastest, no login issues)
   OR
4. **Wait 30 minutes, then retry EAS Build** with app-specific password

---

## 🔗 Important Links

- **iForgot:** https://iforgot.apple.com
- **Apple ID Management:** https://appleid.apple.com/account/manage
- **App-Specific Passwords:** https://appleid.apple.com/account/manage → Security → App-Specific Passwords

---

**Unlock your account first, then use Xcode build for fastest results!** 🚀

