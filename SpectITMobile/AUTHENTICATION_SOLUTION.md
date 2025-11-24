# 🔐 Authentication Solution

## ❌ Current Error

```
Invalid username and password combination. Used 'tanstrauss@gmail.com' as the username.
```

---

## ✅ Solutions

### Solution 1: Check if 2FA is Enabled (Most Likely)

If 2FA is enabled on your Apple ID, you **MUST** use an **app-specific password**, not your regular password.

#### Step 1: Create App-Specific Password

1. **Go to:** https://appleid.apple.com
2. **Sign in** with your Apple ID
3. **Go to:** Security section
4. **Find:** App-Specific Passwords
5. **Click:** Generate Password
6. **Label it:** "EAS Build" or "Expo Build"
7. **Copy the password** (looks like: `xxxx-xxxx-xxxx-xxxx`)

#### Step 2: Use App-Specific Password

When building, use the **app-specific password** instead of your regular password:

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
./BUILD_WITH_APP_SPECIFIC_PASSWORD.sh
```

**Or manually:**
```bash
eas build --platform ios --profile production
# When prompted for password, use the app-specific password
```

---

### Solution 2: Verify Password is Correct

1. **Test password manually:**
   - Go to: https://appleid.apple.com
   - Try logging in with: `tanstrauss@gmail.com` and your password
   - If login fails, password is wrong

2. **If password is wrong:**
   - Reset at: https://iforgot.apple.com
   - Use new password in build command

---

### Solution 3: Use Xcode Instead (Easier)

Xcode handles authentication better and may work when EAS doesn't:

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
open ios/SpectIT.xcodeproj
```

**In Xcode:**
1. Sign in to Xcode with your Apple ID
2. Select your team in Signing & Capabilities
3. Product → Archive
4. Distribute App → App Store Connect
5. Follow prompts (Xcode handles authentication better)

---

### Solution 4: Run Diagnostic Script

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
./FIX_AUTHENTICATION.sh
```

This will guide you through:
- Verifying your password
- Checking 2FA status
- Creating app-specific password if needed
- Alternative methods

---

## 🎯 Quick Fix (Most Likely Solution)

**If 2FA is enabled:**

1. **Create app-specific password:**
   - https://appleid.apple.com → Security → App-Specific Passwords

2. **Use it in build:**
   ```bash
   ./BUILD_WITH_APP_SPECIFIC_PASSWORD.sh
   ```
   - When prompted, use the **app-specific password** (NOT your regular password)

---

## 📋 Summary

- ❌ **Error:** Invalid password
- ✅ **Most likely cause:** 2FA requires app-specific password
- ✅ **Solution:** Create app-specific password and use it
- ✅ **Alternative:** Use Xcode (handles auth better)

---

**Run `./FIX_AUTHENTICATION.sh` to diagnose, or create an app-specific password if 2FA is enabled!**

