# ⚡ Quick Fix: EAS Build Failed

## 🔍 Most Common Issue: Credentials Not Configured

**90% of EAS build failures are due to missing or incorrect credentials.**

## 🚀 Quick Fix (2 Minutes)

### Step 1: Configure Credentials

**Via Web (Easiest):**
1. Go to: https://expo.dev/accounts/spect-it/settings/credentials
2. Click **"iOS"** tab
3. Click **"Set up credentials"** or **"Manage credentials"**
4. Enter:
   - **Apple ID:** `tanstrauss@gmail.com`
   - **Password:** (use app-specific password if 2FA enabled)
   - **Team:** P7BPRR2MY3
   - **Bundle ID:** com.spectit.app

### Step 2: Get App-Specific Password (If 2FA Enabled)

**If you have 2FA on your Apple ID:**

1. **Go to:** https://appleid.apple.com/account/manage
2. **Security** → **App-Specific Passwords**
3. **Generate Password** → Name: "EAS Build"
4. **Copy password** (xxxx-xxxx-xxxx-xxxx format)
5. **Use this password** in credentials (NOT your regular password)

### Step 3: Try Build Again

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
./BUILD_WITH_EAS_NOW.sh
```

## 🔍 Check Build Logs

**To see the exact error:**

1. **Go to:** https://expo.dev/accounts/spect-it/projects/spectit-mobile/builds
2. **Click on the failed build**
3. **View logs** → Look for red error messages
4. **Copy the exact error text**

## 💡 Common Errors & Fixes

### Error: "Credentials are not set up"

**Fix:**
- Configure at: https://expo.dev/accounts/spect-it/settings/credentials
- iOS → Set up credentials

### Error: "Invalid username and password"

**Fix:**
- Use app-specific password (not regular password)
- Generate at: https://appleid.apple.com/account/manage

### Error: "Bundle identifier mismatch"

**Fix:**
- Verify Bundle ID: `com.spectit.app`
- Check: `app.json` → `ios.bundleIdentifier`
- Check: App Store Connect app settings

### Error: "No provisioning profile"

**Fix:**
- Run: `eas credentials`
- Select: iOS → production
- EAS will create provisioning profile automatically

## 📋 Diagnostic

**Run diagnostic script:**
```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
./DIAGNOSE_EAS_BUILD.sh
```

## ✅ Configuration Verified

- ✅ Bundle ID: com.spectit.app
- ✅ Project ID: 8479efbf-f284-4b6f-a6f5-66eceee62c92
- ✅ Production profile: store distribution
- ✅ EAS login: Working

**Most likely issue: Credentials need to be configured!**

---

**Configure credentials at: https://expo.dev/accounts/spect-it/settings/credentials**  
**Then try building again!** 🚀

