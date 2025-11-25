# 🔧 Fix: "Spect" does not have an associated Developer Team

## ❌ Error

Xcode shows: "Spect" does not have an associated Developer Team

**Causes:**
1. Xcode is seeing old "Spect" name (cached)
2. Developer Team not configured in Signing & Capabilities
3. Team needs to be set for the project

---

## ✅ Solution: Configure Developer Team in Xcode

### Step 1: Open Xcode Project

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
open ios/SpectIT.xcworkspace
```

---

### Step 2: Configure Signing & Capabilities

1. **Click project name** (blue icon) in left sidebar
   - Should show "SpectIT" (not "Spect")
   - If you see "Spect", that's the cached name issue

2. **Select "SpectIT" target** under TARGETS
   - Make sure it's "SpectIT", not "Spect"

3. **Click "Signing & Capabilities" tab**

4. **Enable Automatic Signing:**
   - ✅ **CHECK** "Automatically manage signing"
   
5. **Select Team:**
   - **Team:** Click dropdown
   - Select your team: **"Tanya Strauss (P7BPRR2MY3)"**
   - Or: **"tanstrauss@gmail.com"**
   
   **If team not listed:**
   - Click **"Add Account..."**
   - Apple ID: `tanstrauss@gmail.com`
   - Password: (your password)
   - Xcode handles 2FA automatically

6. **Verify Settings:**
   - Bundle Identifier: `com.spectit.app`
   - Team: Your team name/email
   - Provisioning Profile: "Xcode Managed Profile" (automatic)

7. **Click "Try Again"** if you see errors
   - Xcode will create provisioning profile automatically

---

### Step 3: Verify Project Name

**If Xcode still shows "Spect" instead of "SpectIT":**

1. **Check scheme:**
   - Click scheme dropdown (top left)
   - Should show **"SpectIT"** (not "Spect")
   - If "Spect" appears:
     - **Product → Scheme → Manage Schemes...**
     - Delete "Spect" scheme if it exists
     - Ensure "SpectIT" scheme is checked/shared

2. **Check project name:**
   - Click project (blue icon) in left sidebar
   - Should show project name with "SpectIT" target
   - If you see "Spect", close and reopen Xcode

---

### Step 4: Clean Build Folder

**After configuring team:**

1. **Product → Clean Build Folder** (`Cmd + Shift + K`)
2. **Close Xcode**
3. **Reopen Xcode**
4. **Try building again**

---

## 🔍 Your Developer Team Info

- **Team ID:** `P7BPRR2MY3`
- **Apple ID:** `tanstrauss@gmail.com`
- **Team Name:** Tanya Strauss (or similar)

---

## ⚠️ Common Issues

### Issue: Team dropdown is empty

**Fix:**
1. **Xcode → Settings → Accounts**
2. Click **"+"** button
3. Add Apple ID: `tanstrauss@gmail.com`
4. Enter password
5. Xcode handles 2FA automatically
6. Go back to Signing & Capabilities
7. Team should now appear in dropdown

---

### Issue: "No accounts with App Store Connect access"

**Fix:**
1. Verify Apple Developer Program membership is active
2. Check: https://developer.apple.com/account
3. Sign in with: `tanstrauss@gmail.com`
4. Verify membership is paid and active

---

### Issue: Still seeing "Spect" name

**Fix:**
1. **Product → Clean Build Folder** (`Cmd + Shift + K`)
2. **Close Xcode completely**
3. **Delete derived data:**
   ```bash
   rm -rf ~/Library/Developer/Xcode/DerivedData/SpectIT-*
   ```
4. **Reopen Xcode**
5. **Open project again**

---

## 📋 Quick Checklist

- [ ] Xcode project shows "SpectIT" (not "Spect")
- [ ] Scheme shows "SpectIT" (not "Spect")
- [ ] Signing & Capabilities tab open
- [ ] "Automatically manage signing" is checked
- [ ] Team is selected (Tanya Strauss / P7BPRR2MY3)
- [ ] Bundle ID: `com.spectit.app`
- [ ] No red error indicators
- [ ] Provisioning Profile: "Xcode Managed Profile"

---

## ✅ Verification

After configuring:

1. **No errors** in Signing & Capabilities
2. **Team shows:** Your team name
3. **Provisioning Profile:** "Xcode Managed Profile"
4. **Can build** without team errors

---

## 🔗 Reference

- **Apple Developer Account:** https://developer.apple.com/account
- **Team ID:** P7BPRR2MY3
- **Bundle ID:** com.spectit.app

---

**The key is selecting your team in Signing & Capabilities tab!**

