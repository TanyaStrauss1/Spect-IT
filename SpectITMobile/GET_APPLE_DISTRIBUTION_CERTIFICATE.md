# 🎫 Get Apple Distribution Certificate

## 📋 What You Need

An **App Store distribution certificate** is required to distribute your app to the App Store.

**Current Setup:**
- **Team ID:** P7BPRR2MY3
- **Bundle ID:** com.spectit.app
- **Purpose:** App Store distribution

## 🚀 Method 1: Create via Apple Developer Portal (Recommended)

### Step 1: Sign In to Apple Developer

1. **Go to:** https://developer.apple.com/account
2. **Sign in with:** `tanstrauss@gmail.com`
3. **Enter password** (or use 2FA if enabled)

### Step 2: Navigate to Certificates

1. **Click:** "Certificates, Identifiers & Profiles" (or go directly to: https://developer.apple.com/account/resources/certificates/list)
2. **Click:** "Certificates" in left sidebar
3. **Click:** "+" button (top left) to create new certificate

### Step 3: Select Certificate Type

1. **Under "Services":**
   - Select: **"App Store and Ad Hoc"** ✅
   - **NOT** "Apple Development" (that's for testing)
   - **NOT** "Apple Distribution" (legacy, use App Store and Ad Hoc)

2. **Click:** "Continue"

### Step 4: Create Certificate Signing Request (CSR)

**On your Mac:**

1. **Open Keychain Access:**
   - Applications → Utilities → Keychain Access
   - Or: Spotlight → "Keychain Access"

2. **Create CSR:**
   - **Keychain Access** → **Certificate Assistant** → **Request a Certificate From a Certificate Authority**
   - **User Email Address:** `tanstrauss@gmail.com`
   - **Common Name:** `Tanya Strauss` (or your name)
   - **CA Email Address:** (leave empty)
   - **Request is:** Select **"Saved to disk"**
   - **Click:** "Continue"
   - **Save location:** Desktop (or easy to find)
   - **Click:** "Done"

3. **You now have:** `CertificateSigningRequest.certSigningRequest` file

### Step 5: Upload CSR

1. **Back in Apple Developer portal:**
   - **Click:** "Choose File"
   - **Select:** The CSR file you just created
   - **Click:** "Continue"

### Step 6: Download Certificate

1. **Certificate is created** ✅
2. **Click:** "Download" button
3. **Save:** `distribution_certificate.cer` file

### Step 7: Install Certificate

1. **Double-click** the downloaded `.cer` file
2. **Keychain Access opens automatically**
3. **Certificate is installed** in "My Certificates" ✅

**Verify:**
- Open Keychain Access
- Click "My Certificates" in left sidebar
- Look for: "Apple Distribution: [Your Name] (P7BPRR2MY3)"
- Should show: ✅ Valid certificate

## 🚀 Method 2: Let EAS Create It Automatically

**EAS Build can create the certificate automatically:**

1. **Configure credentials:**
   ```bash
   cd /Users/tanyastrauss/Spect-IT/SpectITMobile
   eas credentials
   # Select: iOS
   # Select: production
   # Choose: "Set up new credentials"
   # EAS will create certificate automatically
   ```

2. **Or via web:**
   - https://expo.dev/accounts/spect-it/settings/credentials
   - iOS → Set up credentials
   - EAS handles certificate creation

## 🚀 Method 3: Let Xcode Create It Automatically

**Xcode can create certificates automatically:**

1. **Open Xcode:**
   ```bash
   cd /Users/tanyastrauss/Spect-IT/SpectITMobile
   open ios/SpectIT.xcworkspace
   ```

2. **Configure Signing:**
   - Project → Target → Signing & Capabilities
   - ✅ Check "Automatically manage signing"
   - Select Team: P7BPRR2MY3
   - Xcode creates certificate automatically ✅

## ✅ Verify Certificate Exists

### Check in Apple Developer Portal

1. **Go to:** https://developer.apple.com/account/resources/certificates/list
2. **Look for:**
   - Type: **"App Store and Ad Hoc"**
   - Team: **P7BPRR2MY3**
   - Status: **Valid** ✅

### Check in Keychain Access

1. **Open Keychain Access**
2. **Click:** "My Certificates"
3. **Look for:** "Apple Distribution: [Your Name] (P7BPRR2MY3)"
4. **Should show:** ✅ Valid

### Check via Terminal

```bash
security find-identity -v -p codesigning | grep "Distribution"
```

Should show: `Apple Distribution: [Your Name] (P7BPRR2MY3)`

## 🔧 If Certificate Already Exists

**If you already have a certificate:**

1. **Check if it's valid:**
   - Apple Developer → Certificates
   - Look for "App Store and Ad Hoc" certificate
   - Check expiration date

2. **If expired:**
   - Create new certificate (follow Method 1)
   - Or let EAS/Xcode create new one

3. **If valid:**
   - You're all set! ✅
   - Use it in EAS or Xcode

## 💡 Recommended Approach

**For EAS Build:**
- Let EAS create it automatically (easiest)
- Configure at: https://expo.dev/accounts/spect-it/settings/credentials

**For Xcode Build:**
- Let Xcode create it automatically
- Enable "Automatically manage signing"

**Manual Creation:**
- Only if automatic methods fail
- Follow Method 1 above

## 📋 Certificate Details

**What you need:**
- ✅ **Type:** App Store and Ad Hoc
- ✅ **Team:** P7BPRR2MY3
- ✅ **Purpose:** App Store distribution
- ✅ **Status:** Valid (not expired)

## 🔗 Important Links

- **Apple Developer:** https://developer.apple.com/account
- **Certificates:** https://developer.apple.com/account/resources/certificates/list
- **EAS Credentials:** https://expo.dev/accounts/spect-it/settings/credentials

---

**Easiest: Let EAS or Xcode create it automatically!** 🚀

