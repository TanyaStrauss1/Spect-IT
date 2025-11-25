# 🔧 Quick Fix: EAS Build Not Working

## ✅ Solution 1: Set Up Credentials First

**The most common issue is credentials not being set up.**

### Step 1: Set Up Credentials

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
eas credentials
```

**Then:**
1. Select: **iOS**
2. Select: **production**
3. Choose: **"Set up new credentials"** or **"Use existing"**
4. Enter Apple ID: `tanstrauss@gmail.com`
5. Enter password (or app-specific password if 2FA enabled)

### Step 2: Build

```bash
eas build --platform ios --profile production
```

---

## ✅ Solution 2: Use Xcode Build (If EAS Fails)

**If EAS continues to have issues, use Xcode:**

### Steps:

1. **Open Xcode:**
   ```bash
   cd /Users/tanyastrauss/Spect-IT/SpectITMobile
   open ios/SpectIT.xcworkspace
   ```

2. **Configure Signing:**
   - Click project → Select "SpectIT" target
   - "Signing & Capabilities" tab
   - ✅ Check "Automatically manage signing"
   - Select Team: "Tanya Strauss (P7BPRR2MY3)"

3. **Archive:**
   - Select "Any iOS Device"
   - **Product → Archive**
   - Wait 5-15 minutes

4. **Distribute:**
   - Click **"Distribute App"**
   - Select **"App Store Connect"**
   - Choose **"Upload"** (or Export for Transporter)

---

## 🔍 Common EAS Build Errors

### Error: "Credentials are not set up"

**Fix:**
```bash
eas credentials
# Set up iOS → production credentials
```

---

### Error: "Invalid username and password"

**Fix:**
- Use app-specific password (not regular password)
- Generate at: https://appleid.apple.com/account/manage
- Security → App-Specific Passwords

---

### Error: "No profiles found"

**Fix:**
- Run `eas credentials` to set up provisioning
- Or use Xcode build (handles automatically)

---

## 💡 Recommended Approach

**For first build:**
1. Use Xcode (easiest, handles everything)
2. Archive and upload directly

**For future builds:**
1. Set up EAS credentials once
2. Then use EAS for automated builds

---

## 📋 Quick Commands

**Set up credentials:**
```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
eas credentials
```

**Build:**
```bash
eas build --platform ios --profile production
```

**Or use Xcode:**
```bash
open ios/SpectIT.xcworkspace
```

---

**Try setting up credentials first, then build!**

