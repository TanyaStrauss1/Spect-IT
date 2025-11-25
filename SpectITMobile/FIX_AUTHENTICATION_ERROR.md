# 🔧 Fix: "Invalid username and password combination"

## ❌ Error Found

**Error:** `Invalid username and password combination. Used 'tanstrauss@gmail.com' as the username.`

**Location:** EAS build authentication

**Cause:** Apple ID authentication failed during EAS build

---

## ✅ Solution 1: Use App-Specific Password (Recommended)

If you have 2FA enabled on your Apple ID, you **must** use an app-specific password, not your regular password.

### Steps:

1. **Go to Apple ID Management:**
   - https://appleid.apple.com/account/manage
   - Sign in with: `tanstrauss@gmail.com`

2. **Generate App-Specific Password:**
   - Under **"Security"** section
   - Find **"App-Specific Passwords"**
   - Click **"Generate Password..."**
   - Name it: `EAS Build` (or any name)
   - Click **"Create"**

3. **Copy the Password:**
   - It will look like: `xxxx-xxxx-xxxx-xxxx`
   - **Copy it immediately** (you can't see it again!)

4. **Use in EAS Build:**
   ```bash
   cd /Users/tanyastrauss/Spect-IT/SpectITMobile
   eas build --platform ios --profile production
   ```
   - When prompted for **Apple ID:** `tanstrauss@gmail.com`
   - When prompted for **Password:** Use the app-specific password (xxxx-xxxx-xxxx-xxxx)
   - **NOT your regular Apple ID password!**

---

## ✅ Solution 2: Clear Stored Credentials

If you've entered the wrong password before, clear it:

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
eas credentials
# Select iOS → production → clear credentials
```

Then try building again with the correct password.

---

## ✅ Solution 3: Use Xcode Build (No EAS Auth)

If EAS authentication continues to fail, use Xcode instead:

### Steps:

1. **Open Xcode:**
   ```bash
   cd /Users/tanyastrauss/Spect-IT/SpectITMobile
   open ios/SpectIT.xcworkspace
   ```

2. **Configure Signing:**
   - Select project → Target → "Signing & Capabilities"
   - ✅ Check "Automatically manage signing"
   - Select your team
   - Xcode handles authentication automatically!

3. **Build & Archive:**
   - Select "Any iOS Device"
   - Product → Archive
   - Wait for archive (5-15 minutes)

4. **Distribute:**
   - Click "Distribute App"
   - Select "App Store Connect"
   - Follow prompts

**Xcode handles Apple ID authentication automatically - no password needed!**

---

## 🔍 Why This Happens

- **2FA Enabled:** Apple requires app-specific passwords for CLI tools
- **Wrong Password:** Regular password won't work with EAS
- **Stored Credentials:** Old incorrect password stored in keychain

---

## 📋 Quick Checklist

- [ ] Generate app-specific password at https://appleid.apple.com/account/manage
- [ ] Copy the password (xxxx-xxxx-xxxx-xxxx format)
- [ ] Run: `eas build --platform ios --profile production`
- [ ] Use app-specific password when prompted
- [ ] OR use Xcode build (no password needed)

---

## 💡 Recommended Approach

**Use Xcode Build** - it's easier:
- ✅ No password needed
- ✅ Handles authentication automatically
- ✅ Visual interface
- ✅ Direct upload to App Store Connect

**Or use EAS with app-specific password:**
- ✅ Cloud build (no local Xcode needed)
- ✅ Automatic upload
- ✅ Requires app-specific password

---

**The error is just authentication - both solutions work!**

