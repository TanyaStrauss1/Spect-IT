# 🔧 Xcode Configuration Fix - Step by Step

## ✅ Xcode is Now Open

Follow these steps to verify and fix the Xcode configuration:

---

## 📋 Step 1: Verify Project Settings

### 1.1 Check Project in Navigator

1. **In Xcode (left sidebar):**
   - Click **"SpectIT"** (blue project icon at the top)
   - You should see the project settings

### 1.2 Verify Target Settings

1. **Select Target:**
   - Under "TARGETS", click **"SpectIT"**
   - Go to **"General"** tab

2. **Verify:**
   - **Display Name:** Spect-IT
   - **Bundle Identifier:** `com.spectit.app`
   - **Version:** 1.0
   - **Build:** 1
   - **Minimum Deployments:** iOS 15.0

---

## 🔐 Step 2: Fix Signing & Capabilities

### 2.1 Go to Signing & Capabilities Tab

1. **Still in Target "SpectIT":**
   - Click **"Signing & Capabilities"** tab

2. **Verify Signing:**
   - ✅ **"Automatically manage signing"** should be CHECKED
   - ✅ **Team:** Should show "Tanya Strauss (P7BPRR2MY3)"
   - ✅ **Bundle Identifier:** `com.spectit.app`
   - ✅ **Provisioning Profile:** Should show "Xcode Managed Profile"

### 2.2 If Team is Wrong or Missing

1. **Click Team dropdown:**
   - Select: **"Tanya Strauss (P7BPRR2MY3)"**
   - If not listed:
     - Xcode → Settings → Accounts
     - Add Apple ID: `tanstrauss@gmail.com`
     - Sign in and select team

2. **Wait for Green Checkmark:**
   - Should see ✅ "Signing certificate is valid"
   - If red error, click "Try Again"

### 2.3 Check Capabilities

**Verify these capabilities are added (if needed):**
- ✅ Camera (for eye tests)
- ✅ Location Services (for finding specialists)
- ✅ Photo Library (for saving results)

**If missing:**
- Click **"+ Capability"** button
- Add any missing capabilities

---

## ☁️ Step 3: Configure Xcode Cloud Workflow

### 3.1 Check if Workflow Exists

1. **In Xcode:**
   - **Product → Xcode Cloud → Workflows**
   - Check if "Build and Distribute Spect-IT" exists

### 3.2 Create Workflow (If Not Exists)

**Option A: Via Menu**
1. **Product → Xcode Cloud → Create Workflow**
2. Follow the wizard:
   - **Name:** `Build and Distribute Spect-IT`
   - **Repository:** `TanyaStrauss1/Spect-IT` (should auto-detect)
   - **Branch:** `main`
   - **Scheme:** `SpectIT`
   - **Configuration:** `Release`
   - **Destination:** `Any iOS Device`

3. **Add Actions:**
   - ✅ **Archive** - Build the app
   - ✅ **Distribute** - Upload to App Store Connect
   - ❌ **DO NOT** add Test (skip it)

4. **Set Triggers:**
   - ✅ **Git Push** - Automatically build on push to main
   - ✅ **Manual** - Allow manual builds

5. **Click "Save"**

**Option B: Via Project Settings**
1. Click **"SpectIT"** project (blue icon)
2. Select **"SpectIT"** target
3. Go to **"Signing & Capabilities"** tab
4. Scroll to bottom → **"Xcode Cloud"** section
5. Click **"Create Workflow"**
6. Follow same configuration as above

### 3.3 Edit Existing Workflow (If Exists)

1. **Product → Xcode Cloud → Workflows**
2. **Select:** "Build and Distribute Spect-IT" (or "Default")
3. **Click:** "Edit Workflow"
4. **Verify:**
   - **Actions:** Only Archive + Distribute (remove Test if present)
   - **Scheme:** SpectIT
   - **Configuration:** Release
   - **Team:** P7BPRR2MY3
5. **Save**

---

## 🏗️ Step 4: Verify Build Configuration

### 4.1 Check Build Settings

1. **Select Target "SpectIT":**
   - Go to **"Build Settings"** tab
   - Search for: `DEVELOPMENT_TEAM`
   - Should show: `P7BPRR2MY3`

2. **Search for:** `PRODUCT_BUNDLE_IDENTIFIER`
   - Should show: `com.spectit.app`

3. **Search for:** `MARKETING_VERSION`
   - Should show: `1.0`

4. **Search for:** `CURRENT_PROJECT_VERSION`
   - Should show: `1`

### 4.2 Check Code Signing

1. **Search for:** `CODE_SIGN_STYLE`
   - Should show: `Automatic`

2. **Search for:** `CODE_SIGN_IDENTITY`
   - For Release: Can be "Apple Development" (Xcode Cloud will use Distribution automatically)
   - Or: "Apple Distribution" (if you want to be explicit)

---

## 📱 Step 5: Verify Scheme

### 5.1 Check Scheme

1. **Click scheme dropdown** (next to play/stop buttons at top)
   - Should show: **"SpectIT"**
   - Destination: **"Any iOS Device"** or **"Generic iOS Device"**

2. **Edit Scheme:**
   - Click scheme → **"Edit Scheme..."**
   - **Archive:**
     - Configuration: **Release** ✅
   - **Build:**
     - Configuration: **Release** ✅
   - Click **"Close"**

---

## 🧪 Step 6: Test Local Build (Optional)

### 6.1 Clean Build

1. **Product → Clean Build Folder** (Cmd+Shift+K)
2. Wait for clean to complete

### 6.2 Try Archive

1. **Product → Archive**
2. **Wait for build:**
   - Should complete without errors
   - If errors, note them and fix

3. **If Archive Succeeds:**
   - Window opens with archive
   - You can close it (Xcode Cloud will handle distribution)

---

## ☁️ Step 7: Verify Xcode Cloud Connection

### 7.1 Check Account

1. **Xcode → Settings → Accounts**
2. **Verify:**
   - Apple ID: `tanstrauss@gmail.com` is listed
   - Team: "Tanya Strauss (P7BPRR2MY3)" is selected
   - Status: ✅ (green checkmark)

### 7.2 Check Cloud Status

1. **Product → Xcode Cloud → Workflows**
2. **Should show:**
   - Connected to: `TanyaStrauss1/Spect-IT`
   - Branch: `main`
   - Workflow: "Build and Distribute Spect-IT"

---

## 🚀 Step 8: Trigger Build

### Option 1: Manual Trigger in Xcode

1. **Product → Xcode Cloud → Start Build**
2. **Select workflow:** "Build and Distribute Spect-IT"
3. **Click:** "Start Build"
4. **Monitor:** Build will appear in App Store Connect

### Option 2: Push to GitHub (Automatic)

1. **Make a small change:**
   ```bash
   cd /Users/tanyastrauss/Spect-IT/SpectITMobile
   echo "# Xcode Cloud Ready" >> README.md
   git add README.md
   git commit -m "Trigger Xcode Cloud build"
   git push origin main
   ```

2. **Xcode Cloud will automatically start building**

---

## ✅ Verification Checklist

After following all steps, verify:

- [ ] Project opens without errors
- [ ] Team is set: P7BPRR2MY3
- [ ] Bundle ID: com.spectit.app
- [ ] Signing: Automatic (green checkmark)
- [ ] Scheme: SpectIT
- [ ] Configuration: Release
- [ ] Xcode Cloud workflow exists
- [ ] Workflow has Archive + Distribute (no Test)
- [ ] Workflow connected to GitHub: TanyaStrauss1/Spect-IT
- [ ] Branch: main
- [ ] Can trigger build (manual or automatic)

---

## 🔍 Common Issues & Fixes

### Issue: "No Team Selected"

**Fix:**
1. Signing & Capabilities → Team dropdown
2. Select: "Tanya Strauss (P7BPRR2MY3)"
3. If not listed: Xcode → Settings → Accounts → Add Apple ID

### Issue: "Signing Certificate Invalid"

**Fix:**
1. Signing & Capabilities → Click "Try Again"
2. Or: Xcode → Settings → Accounts → Download Manual Profiles

### Issue: "Xcode Cloud Not Available"

**Fix:**
1. Verify you're signed in: Xcode → Settings → Accounts
2. Verify team has Xcode Cloud access
3. Check App Store Connect: Xcode Cloud should be enabled

### Issue: "Workflow Not Found"

**Fix:**
1. Product → Xcode Cloud → Create Workflow
2. Follow Step 3.2 above

### Issue: "Scheme Not Found"

**Fix:**
1. Click scheme dropdown
2. Select "SpectIT"
3. If not listed: Product → Scheme → Manage Schemes → Add "SpectIT"

---

## 📞 Next Steps

After fixing in Xcode:

1. **Save all changes** (Cmd+S)
2. **Close Xcode** (optional, but recommended)
3. **Monitor build** in App Store Connect:
   - https://appstoreconnect.apple.com/teams/c5c5f5d2-8ebe-443d-957f-b4038c7db237/apps/6755681856/ci

4. **If build succeeds:**
   - App will automatically upload to App Store Connect
   - Go to: My Apps → Spect-IT → TestFlight or App Store
   - Submit for review

---

**Follow these steps in Xcode to ensure everything is configured correctly!** 🔧

