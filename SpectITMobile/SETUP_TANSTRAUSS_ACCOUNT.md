# 🔧 Setup Using tanstrauss@gmail.com

## ✅ Configuration Updated

I've updated all configuration files to use `tanstrauss@gmail.com`:

- ✅ **app.json** - Owner set to `tanstrauss`
- ✅ **eas.json** - Apple ID set to `tanstrauss@gmail.com`
- ✅ **Build script** - Created `build_with_tanstrauss.exp`

---

## 🔍 Step 1: Check Account Status

### Test Account Access

1. **Try to sign in:**
   - Go to: https://appleid.apple.com
   - Enter: `tanstrauss@gmail.com`
   - Enter password (try these in order):
     - `SoniKim1979!` (most recent)
     - `Lottie1802!` (if first doesn't work)
     - `Kiara1403!` (original)

2. **Check if account is locked:**
   - If you see "Account locked" message
   - Go to: https://iforgot.apple.com
   - Follow account recovery steps

3. **Verify Developer Program access:**
   - Go to: https://developer.apple.com/account
   - Sign in with `tanstrauss@gmail.com`
   - Check if you have Developer Program access

---

## 🔓 Step 2: Unlock Account (If Needed)

### If Account is Locked:

1. **Go to:** https://iforgot.apple.com
2. **Enter:** `tanstrauss@gmail.com`
3. **Choose recovery method:**
   - Mobile number (if you have one linked)
   - Recovery email (if set up)
   - Security questions (if set up)
4. **Follow recovery steps**
5. **Set new password** (save it securely!)

---

## 🔐 Step 3: Provide Password

### After Checking/Unlocking Account:

**Tell me the current password for `tanstrauss@gmail.com`**

I will then:
- ✅ Update `build_with_tanstrauss.exp` with the password
- ✅ Prepare everything for building
- ✅ Ready to start the build process

---

## 📋 Step 4: Verify Account Setup

### Before Building, Verify:

- [ ] Can sign in to https://appleid.apple.com
- [ ] Account is not locked
- [ ] Two-Factor Authentication is enabled
- [ ] Can access https://developer.apple.com/account
- [ ] Apple Developer Program is enrolled ($99/year)
- [ ] Can access https://appstoreconnect.apple.com

---

## 🚀 Step 5: After Password is Configured

Once I have the password and update the script:

1. **Login to EAS:**
   ```bash
   cd /Users/tanyastrauss/Spect-IT/SpectITMobile
   eas login
   ```
   - Enter: `tanstrauss@gmail.com`
   - Approve in browser

2. **Run automated build:**
   ```bash
   ./build_with_tanstrauss.exp
   ```

---

## ⚠️ Important Notes

- **Password Security:** Password will be stored in `build_with_tanstrauss.exp` (protected by .gitignore)
- **2FA:** If 2FA is enabled, you'll need to enter the code when prompted
- **Account Status:** Make sure account is unlocked before building
- **Developer Program:** Must be enrolled ($99/year) to submit to App Store

---

## 🆘 Troubleshooting

### "Account is locked"
- Go to: https://iforgot.apple.com
- Follow recovery steps
- May need mobile number for verification

### "Password incorrect"
- Try the password history:
  1. `SoniKim1979!`
  2. `Lottie1802!`
  3. `Kiara1403!`
- Or reset password at https://iforgot.apple.com

### "No Developer Program access"
- Enroll at: https://developer.apple.com/programs/
- Pay $99/year
- Wait 24-48 hours for approval

---

## 📝 Quick Checklist

Before building:
- [ ] Account unlocked
- [ ] Password confirmed
- [ ] 2FA enabled
- [ ] Developer Program enrolled
- [ ] Can access App Store Connect
- [ ] Password provided to me
- [ ] EAS login completed

---

**Next Step: Check account status and provide the current password!**

