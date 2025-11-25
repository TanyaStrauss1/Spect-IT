# 🚀 Run EAS Build Now - Terminal Instructions

## ✅ Quick Start

**Run this command in your terminal:**

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
eas build --platform ios --profile production
```

---

## 📋 Step-by-Step

### Step 1: Open Terminal

Open your terminal (or use Cursor's terminal).

### Step 2: Navigate to Project

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
```

### Step 3: Run EAS Build

```bash
eas build --platform ios --profile production
```

### Step 4: Answer Prompts

**Prompt 1:** "Do you want to log in to your Apple account?"
- Answer: **yes**

**Prompt 2:** "Apple ID:"
- Enter: **tanstrauss@gmail.com**

**Prompt 3:** "Password:"
- Enter your Apple ID password
- **OR** app-specific password (if 2FA enabled)

### Step 5: Wait for Build

- Build runs in cloud (15-30 minutes)
- Progress shown in terminal
- Automatically uploads when complete

---

## 🔐 If Authentication Fails

### Generate App-Specific Password

1. **Go to:** https://appleid.apple.com/account/manage
2. **Sign in** with: `tanstrauss@gmail.com`
3. **Security** → **App-Specific Passwords**
4. **Generate Password** → Name it: "EAS Build"
5. **Copy the password** (format: `xxxx-xxxx-xxxx-xxxx`)
6. **Use this password** when EAS asks (not your regular password)

---

## ✅ After Build Completes

1. **Go to App Store Connect:**
   https://appstoreconnect.apple.com/apps/6755681856

2. **Wait 15-30 minutes** for processing

3. **Click "App Store" tab**

4. **Select your build** in Build section

5. **Complete required fields:**
   - Screenshots
   - App Description
   - Privacy Policy URL
   - Support URL
   - Category
   - Age Rating

6. **Submit for Review**

---

## 📊 Monitor Build Progress

**While building, you can:**

- Watch progress in terminal
- Check build status: https://expo.dev/accounts/tstrauss/projects/spectit-mobile/builds
- Build will show "In Progress" → "Finished"

---

## 💡 Advantages

- ✅ No device registration needed
- ✅ No local Xcode issues
- ✅ Builds in cloud
- ✅ Automatic upload
- ✅ Handles provisioning

---

**Run the command now in your terminal!**

