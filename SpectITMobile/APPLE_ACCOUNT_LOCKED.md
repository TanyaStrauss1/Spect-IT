# ⚠️ Apple Account Locked

## Error Message

```
Apple Service Error -20209. This Apple Account has been locked for security reasons.
```

## 🔓 How to Unlock Your Apple Account

### Step 1: Go to Apple Account Recovery

1. Visit: **https://iforgot.apple.com**
2. Enter your Apple ID: `tanstrauss@gmail.com`
3. Click **Continue**

### Step 2: Verify Your Identity

You'll be asked to:
- Answer security questions
- Verify with a trusted device
- Or use account recovery

### Step 3: Unlock Account

Follow the on-screen instructions to unlock your account.

### Step 4: Wait for Unlock

- Usually unlocks immediately
- May take up to 24 hours in some cases
- Check email for unlock confirmation

---

## 🔄 After Account is Unlocked

### Try Build Again

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
eas build --platform ios --profile production
```

**When prompted:**
- "Do you want to log in to your Apple account?" → Type: `y`
- Apple ID: `tanstrauss@gmail.com`
- Password: [Enter your password]
- 2FA Code: [If enabled]

---

## 🔐 Why Accounts Get Locked

Common reasons:
- Multiple failed login attempts
- Unusual activity detected
- Security verification required
- Password changes from new location

---

## 📞 Need Help?

- **Apple Support:** https://support.apple.com
- **Account Recovery:** https://iforgot.apple.com
- **Apple ID Account Page:** https://appleid.apple.com

---

## ✅ Once Unlocked

1. Verify account is unlocked at: https://appleid.apple.com
2. Try build again: `eas build --platform ios --profile production`
3. Monitor build: https://expo.dev/accounts/tstrauss/projects/spectit-mobile/builds

---

**Please unlock your Apple account first, then retry the build.**

