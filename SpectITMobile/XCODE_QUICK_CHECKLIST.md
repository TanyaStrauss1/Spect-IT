# ✅ Xcode Build - Quick Checklist

## 📋 Follow These Steps in Order

### ⏱️ Step 1: Wait for Indexing
- [ ] Xcode is open
- [ ] Status bar shows "Ready" (not "Indexing...")
- [ ] No red error indicators visible
- **Time:** 2-5 minutes

---

### 🔐 Step 2: Fix Signing (CRITICAL - Fixes Your Error!)

- [ ] Click **project name** (blue icon) in left sidebar
- [ ] Select **target** under TARGETS (usually "SpectIT")
- [ ] Click **"Signing & Capabilities"** tab
- [ ] ✅ **CHECK** "Automatically manage signing"
- [ ] **Team:** Select your team from dropdown
  - If not listed: Click "Add Account..." → `tanstrauss@gmail.com`
- [ ] **Bundle Identifier:** `com.spectit.app`
- [ ] Wait for Xcode to create provisioning profile (shows checkmark ✅)
- [ ] If errors appear, click **"Try Again"**

**This fixes the "No profiles found" error!**

---

### 📱 Step 3: Select Build Target

- [ ] In **top toolbar**, click device selector
- [ ] Select **"Any iOS Device"**
- [ ] ⚠️ **NOT a simulator** (must be "Any iOS Device")

---

### 📦 Step 4: Archive

- [ ] Go to menu: **Product** → **Archive**
- [ ] Wait for build to complete (5-15 minutes)
- [ ] Watch progress in status bar
- [ ] If build fails: **Product** → **Clean Build Folder** (`Cmd + Shift + K`) → Try again

---

### 📤 Step 5: Upload to App Store Connect

- [ ] **Organizer** window opens automatically
- [ ] Select your **latest archive** (top of list)
- [ ] Click **"Distribute App"**
- [ ] Select **"App Store Connect"**
- [ ] Click **"Next"**
- [ ] Select **"Upload"**
- [ ] Click **"Next"**
- [ ] ✅ Check "Upload your app's symbols"
- [ ] Click **"Next"**
- [ ] Review summary
- [ ] Click **"Upload"**
- [ ] Sign in with: `tanstrauss@gmail.com` (if prompted)
- [ ] Wait for upload (5-10 minutes)
- [ ] See "Upload Successful" ✅

---

## ✅ After Upload

- [ ] Wait 15-30 minutes for processing
- [ ] Go to: https://appstoreconnect.apple.com/apps/6755681856
- [ ] Build appears in TestFlight tab
- [ ] Move to App Store tab
- [ ] Select build
- [ ] Complete app listing
- [ ] Submit for review

---

## ⚠️ If You See Errors

### "No team found"
- Xcode → Preferences → Accounts
- Add Apple ID: `tanstrauss@gmail.com`

### "Bundle ID not found"
- Let Xcode create it automatically (if you have permissions)
- Or create manually: https://developer.apple.com/account/resources/identifiers/list

### "Provisioning profile error"
- Make sure "Automatically manage signing" is checked
- Click "Try Again"
- Xcode will create profile automatically

### Build fails
- Product → Clean Build Folder (`Cmd + Shift + K`)
- Close and reopen Xcode
- Try again

---

## 🎯 Key Point

**"Automatically manage signing"** is the solution to your provisioning profile error. Xcode handles everything automatically!

---

**Follow this checklist step by step in Xcode!**

