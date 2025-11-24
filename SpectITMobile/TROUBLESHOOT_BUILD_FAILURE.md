# 🔧 Troubleshoot Build Failure

## ❌ Build Failed - Common Causes & Solutions

---

## 🔍 Step 1: Check Build Logs

### View Latest Build Status:

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
eas build:list --platform ios --limit 1
```

### View Detailed Build Logs:

1. Go to: https://expo.dev/accounts/tstrauss/projects/spectit-mobile/builds
2. Click on the failed build
3. Check the error messages in the logs

---

## ✅ Solution 1: Verify Apple Developer Account

### Check Account Status:

1. **Go to:** https://developer.apple.com/account
2. **Sign in with:** tanstrauss@gmail.com
3. **Verify:**
   - Account is active
   - Apple Developer Program membership is paid
   - Can access Certificates, Identifiers & Profiles

### If Account Not Active:

1. **Complete enrollment:**
   - Go to: https://developer.apple.com/programs/enroll/
   - Complete payment ($99/year)
   - Wait 24-48 hours for activation

---

## ✅ Solution 2: Verify Apple ID Credentials

### Common Issues:

- **Wrong password**
- **2FA code expired** (codes expire quickly)
- **Account locked** (too many failed attempts)

### Fix:

1. **Test login:**
   - Go to: https://appleid.apple.com
   - Sign in with: tanstrauss@gmail.com
   - Verify you can access account

2. **Reset password if needed:**
   - Go to: https://appleid.apple.com/account/manage
   - Reset password if you can't sign in

3. **Check 2FA:**
   - Make sure you have access to your trusted device
   - Get a fresh 2FA code (they expire in minutes)

---

## ✅ Solution 3: Create App ID Manually

Sometimes the App ID needs to be created first:

### Step 1: Create App ID

1. **Go to:** https://developer.apple.com/account/resources/identifiers/list

2. **Click:** "+" button

3. **Select:** "App IDs" → "Continue"

4. **Fill in:**
   - **Description:** Spect-IT
   - **Bundle ID:** `com.spectit.app` (Explicit)
   - **Capabilities:**
     - ✅ Camera
     - ✅ Location Services
     - ✅ Photo Library

5. **Click:** "Continue" → "Register"

### Step 2: Retry Build

After creating App ID, try building again:

```bash
eas build --platform ios --profile production
```

---

## ✅ Solution 4: Use App-Specific Password

If 2FA is causing issues, use an app-specific password:

### Step 1: Create App-Specific Password

1. **Go to:** https://appleid.apple.com/account/manage

2. **Sign in** with your Apple ID

3. **Go to:** "Security" section

4. **Click:** "Generate Password" under "App-Specific Passwords"

5. **Label it:** "EAS Build"

6. **Copy the password** (you won't see it again!)

### Step 2: Use in Build

When prompted for password during build, use the **app-specific password** (not your regular password).

---

## ✅ Solution 5: Check Team ID

Verify your Team ID is correct:

### Check Team ID:

1. **Go to:** https://developer.apple.com/account
2. **Click:** Membership
3. **Note your Team ID** (should be: `P7BPRR2MY3`)

### Verify in app.json:

```json
{
  "ios": {
    "appleTeamId": "P7BPRR2MY3"
  }
}
```

---

## ✅ Solution 6: Clean and Retry

Sometimes cached credentials cause issues:

### Clear EAS Credentials:

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
eas credentials
```

Then:
1. Select "iOS"
2. Select "production"
3. Choose to regenerate credentials

### Retry Build:

```bash
eas build --platform ios --profile production
```

---

## ✅ Solution 7: Use Non-Interactive Mode

If interactive prompts are failing:

```bash
eas build --platform ios --profile production --non-interactive
```

You'll need to set credentials first:
```bash
eas credentials
```

---

## 🔍 Common Error Messages

### "Invalid credentials"
- **Fix:** Verify Apple ID and password
- **Try:** App-specific password

### "Team not found"
- **Fix:** Verify Team ID in app.json
- **Check:** Apple Developer account access

### "App ID not found"
- **Fix:** Create App ID manually (see Solution 3)

### "Certificate expired"
- **Fix:** EAS will regenerate automatically
- **Or:** Clear credentials and retry

### "Provisioning profile error"
- **Fix:** EAS should handle this automatically
- **Or:** Enable automatic signing in Xcode first

---

## 📋 Quick Checklist

Before retrying build:

- [ ] Apple Developer account is active
- [ ] Can sign in to https://developer.apple.com/account
- [ ] App ID `com.spectit.app` exists
- [ ] Team ID `P7BPRR2MY3` is correct
- [ ] Apple ID credentials are correct
- [ ] 2FA code is fresh (if using 2FA)
- [ ] App-specific password created (if 2FA issues)

---

## 🚀 Retry Build

After fixing issues:

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
eas build --platform ios --profile production
```

---

## 📊 Monitor Build

**Check build status:**
https://expo.dev/accounts/tstrauss/projects/spectit-mobile/builds

**View detailed logs:**
Click on the build to see full error messages

---

## 💡 Alternative: Build Locally

If EAS continues to fail, build locally in Xcode:

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
./BUILD_AND_UPLOAD_XCODE.sh
```

Then enable automatic signing in Xcode (see XCODE_BUILD_GUIDE.md)

---

**Check the build logs first to see the specific error, then apply the appropriate solution!**

