# ☁️ Xcode Cloud Setup - Complete Guide

## ✅ Configuration Files Ready

Your Xcode Cloud configuration is already set up:

- ✅ `ios/.xcodecloud/workflow.yml` - Workflow definition
- ✅ `ios/ci_scripts/ci_pre_xcodebuild.sh` - Pre-build script
- ✅ `ios/ci_scripts/ci_post_xcodebuild.sh` - Post-build script

**Current Configuration:**
- **Team ID:** `UHMT4AX5T7`
- **Bundle ID:** `com.spectit.app`
- **Scheme:** `SpectIT`
- **Repository:** `TanyaStrauss1/Spect-IT`
- **Branch:** `main`

---

## 🚀 Step 1: Enable Xcode Cloud in App Store Connect

The Xcode Cloud page is now open: https://appstoreconnect.apple.com/teams/c5c5f5d2-8ebe-443d-957f-b4038c7db237/apps/6755681856/ci

### 1.1 Enable Xcode Cloud

1. **On the Xcode Cloud page:**
   - If you see "Get Started" or "Enable Xcode Cloud", click it
   - Accept terms and conditions
   - Wait for setup (1-2 minutes)

### 1.2 Connect GitHub Repository

1. **Click "Connect Repository"** or **"Add Repository"**
2. **Select GitHub** as source control provider
3. **Authorize GitHub access:**
   - Sign in with your GitHub account
   - Grant permissions to Xcode Cloud
4. **Select Repository:**
   - Find: `TanyaStrauss1/Spect-IT`
   - Select branch: `main`
   - Click **"Connect"** or **"Save"**

### 1.3 Verify Connection

- ✅ Repository should show as "Connected"
- ✅ Branch `main` should be listed
- ✅ Status should be "Active"

---

## ⚙️ Step 2: Create Workflow in Xcode

### 2.1 Open Xcode

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
open ios/SpectIT.xcworkspace
```

### 2.2 Create Workflow

**Option A: Via Menu**
1. **Product → Xcode Cloud → Create Workflow**
2. Follow the setup wizard

**Option B: Via Project Settings**
1. Click **"SpectIT"** project (blue icon) in left sidebar
2. Select **"SpectIT"** target
3. Go to **"Signing & Capabilities"** tab
4. Scroll to **"Xcode Cloud"** section (at bottom)
5. Click **"Create Workflow"**

### 2.3 Configure Workflow

**Basic Settings:**
- **Name:** `Build and Distribute Spect-IT`
- **Repository:** `TanyaStrauss1/Spect-IT` (should auto-detect)
- **Branch:** `main`
- **Scheme:** `SpectIT`
- **Configuration:** `Release`
- **Destination:** `Any iOS Device` or `generic/platform=iOS`

**Actions:**
- ✅ **Archive** - Build the app
- ✅ **Distribute** - Upload to App Store Connect

**Triggers:**
- ✅ **On Git Push** - Automatically build when code is pushed to `main`
- ✅ **Manual** - Allow on-demand builds

**Code Signing:**
- **Team:** `UHMT4AX5T7` (Tanya Strauss)
- **Bundle ID:** `com.spectit.app`
- **Signing:** Automatic

### 2.4 Save Workflow

Click **"Save"** or **"Create"**

---

## 📝 Step 3: Verify Workflow File

The workflow file should match:

**File:** `ios/.xcodecloud/workflow.yml`

```yaml
name: Build and Distribute Spect-IT
scheme: SpectIT
configuration: Release
destination: generic/platform=iOS
team_id: UHMT4AX5T7
bundle_id: com.spectit.app

actions:
  - archive
  - distribute

triggers:
  - type: git_push
    branch: main
  - type: manual
```

---

## 🎬 Step 4: Test Xcode Cloud

### Option 1: Automatic Build (Recommended)

**Push to GitHub:**
```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
git add .
git commit -m "Enable Xcode Cloud automated builds"
git push origin main
```

**Xcode Cloud will automatically:**
- ✅ Detect the push
- ✅ Start building (15-30 minutes)
- ✅ Upload to App Store Connect when complete
- ✅ Appear in TestFlight

### Option 2: Manual Build

**In App Store Connect:**
1. Go to: https://appstoreconnect.apple.com/teams/c5c5f5d2-8ebe-443d-957f-b4038c7db237/apps/6755681856/ci
2. Click **"Start Build"** button
3. Select workflow: `Build and Distribute Spect-IT`
4. Click **"Start"**

**In Xcode:**
1. **Product → Xcode Cloud → Start Build**
2. Select workflow
3. Click **"Start"**

---

## 📊 Step 5: Monitor Builds

### In App Store Connect

**URL:** https://appstoreconnect.apple.com/teams/c5c5f5d2-8ebe-443d-957f-b4038c7db237/apps/6755681856/ci

**You can see:**
- ✅ Build status (In Progress, Succeeded, Failed)
- ✅ Build logs
- ✅ Build duration
- ✅ Test results (if tests are configured)
- ✅ Distribution status

### Build Status

- ⏳ **In Progress** - Building now
- ✅ **Succeeded** - Build completed, uploaded to App Store Connect
- ❌ **Failed** - Check logs for errors
- 📦 **Distributed** - Available in TestFlight

### Email Notifications

Configure email notifications:
1. Go to Xcode Cloud settings
2. Add email: `tanstrauss@gmail.com`
3. Enable notifications for:
   - ✅ Build started
   - ✅ Build succeeded
   - ✅ Build failed
   - ✅ Build ready for testing

---

## 🔧 Troubleshooting

### Issue: "Repository not found"

**Solution:**
1. Verify GitHub repository is public or you've granted access
2. Re-authorize GitHub in App Store Connect
3. Check repository name: `TanyaStrauss1/Spect-IT`

### Issue: "Workflow not found"

**Solution:**
1. Verify workflow file exists: `ios/.xcodecloud/workflow.yml`
2. Check file is committed to Git
3. Verify branch is `main`

### Issue: "Build failed"

**Check:**
1. Build logs in App Store Connect
2. Pre-build script errors
3. Code signing issues
4. Missing dependencies

**Common fixes:**
- Verify team ID: `UHMT4AX5T7`
- Check bundle ID: `com.spectit.app`
- Ensure all dependencies are in `package.json`
- Verify CocoaPods are installed in pre-build script

### Issue: "Distribution failed"

**Check:**
1. App Store Connect credentials
2. Bundle ID matches App Store Connect
3. Version/build number conflicts

---

## ✅ Benefits of Xcode Cloud

**Automated Builds:**
- ✅ Build on every commit to `main`
- ✅ No local machine needed
- ✅ Consistent build environment

**Time Saving:**
- ✅ No manual archiving
- ✅ No manual uploading
- ✅ Automatic distribution

**Reliability:**
- ✅ Same build environment every time
- ✅ No local configuration issues
- ✅ Automatic code signing

**Free Tier:**
- ✅ 25 hours/month free
- ✅ Perfect for most apps

---

## 📱 Next Steps

1. **Enable Xcode Cloud** in App Store Connect (page is open)
2. **Connect GitHub repository**
3. **Create workflow** in Xcode
4. **Test with a push** to GitHub
5. **Monitor builds** in App Store Connect

---

## 🔗 Important Links

- **Xcode Cloud:** https://appstoreconnect.apple.com/teams/c5c5f5d2-8ebe-443d-957f-b4038c7db237/apps/6755681856/ci
- **TestFlight:** https://appstoreconnect.apple.com/teams/c5c5f5d2-8ebe-443d-957f-b4038c7db237/apps/6755681856/testflight
- **App Store Connect:** https://appstoreconnect.apple.com/teams/c5c5f5d2-8ebe-443d-957f-b4038c7db237/apps/6755681856/appstore

---

**Xcode Cloud page is open - follow the steps above to enable automated builds!** 🚀

