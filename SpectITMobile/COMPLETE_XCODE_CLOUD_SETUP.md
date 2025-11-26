# Complete Xcode Cloud Setup Guide

## ✅ Configuration Complete (From Terminal)

All Xcode Cloud configuration files have been created and verified:

- ✅ `ios/.xcodecloud/workflow.yml` - Workflow definition
- ✅ `ios/ci_scripts/ci_pre_xcodebuild.sh` - Pre-build script
- ✅ `ios/ci_scripts/ci_post_xcodebuild.sh` - Post-build script

## 📋 Configuration Details

- **App Name**: Spect-IT
- **Bundle ID**: com.spectit.app
- **Team ID**: P7BPRR2MY3
- **Scheme**: SpectIT
- **Repository**: https://github.com/TanyaStrauss1/Spect-IT
- **Branch**: main
- **Build Actions**: Archive + Distribute to App Store Connect

## 🔧 Step 1: Enable Xcode Cloud in App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Sign in with your Apple ID
3. Navigate to **My Apps** → **Spect-IT**
4. Click **Xcode Cloud** in the left sidebar
5. If not enabled, click **Enable Xcode Cloud**
6. Click **Products** → **Connect Repository**
7. Select **GitHub** as your source
8. Authorize GitHub access if needed
9. Select repository: **TanyaStrauss1/Spect-IT**
10. Select branch: **main**
11. Click **Connect**

## 🔧 Step 2: Create Workflow in Xcode

1. Open Xcode:
   ```bash
   cd SpectITMobile
   open ios/SpectIT.xcworkspace
   ```

2. In Xcode:
   - Go to **Product** → **Xcode Cloud** → **Create Workflow**
   - Or: **Xcode** → **Settings** → **Cloud** → **Create Workflow**

3. Configure Workflow:
   - **Name**: Build and Distribute Spect-IT
   - **Repository**: TanyaStrauss1/Spect-IT (should auto-detect)
   - **Branch**: main
   - **Scheme**: SpectIT
   - **Configuration**: Release
   - **Destination**: Any iOS Device

4. Add Actions:
   - ✅ **Archive** - Build the app
   - ✅ **Distribute** - Upload to App Store Connect

5. Set Triggers:
   - ✅ **Git Push** - Automatically build on push to main
   - ✅ **Manual** - Allow manual builds

6. Click **Save**

## 🚀 Step 3: Test the Workflow

1. Make a small change (or just commit the config):
   ```bash
   git add .
   git commit -m "Configure Xcode Cloud workflow"
   git push
   ```

2. Check Xcode Cloud:
   - Go to App Store Connect → Xcode Cloud
   - Or: Xcode → Product → Xcode Cloud → View Workflows
   - You should see a build start automatically

3. Monitor Build:
   - Status: "In Progress" → "Succeeded" or "Failed"
   - Build time: ~10-20 minutes
   - Once complete, build will appear in TestFlight

## 📱 Step 4: Access TestFlight Builds

After a successful build:

1. Go to [TestFlight](https://appstoreconnect.apple.com/teams/c5c5f5d2-8ebe-443d-957f-b4038c7db237/apps/6755681856/testflight)
2. Build will appear under **iOS Builds**
3. Status: "Processing" → "Ready to Test"
4. Add testers:
   - **Internal Testers**: Up to 100 users (instant)
   - **External Testers**: Up to 10,000 users (requires review)

## 🔍 Troubleshooting

### Build Fails
- Check Xcode Cloud logs in App Store Connect
- Verify signing is configured correctly
- Ensure all dependencies are in `package.json` and `Podfile`

### Workflow Not Triggering
- Verify repository is connected in App Store Connect
- Check branch name matches (should be `main`)
- Ensure workflow is saved and enabled

### Signing Issues
- Xcode Cloud handles signing automatically
- Ensure Team ID is correct: `P7BPRR2MY3`
- Bundle ID must match: `com.spectit.app`

## 📚 Additional Resources

- [Xcode Cloud Documentation](https://developer.apple.com/xcode-cloud/)
- [App Store Connect](https://appstoreconnect.apple.com)
- [TestFlight Guide](https://developer.apple.com/testflight/)

## ✅ Quick Reference

**Workflow File**: `ios/.xcodecloud/workflow.yml`
**CI Scripts**: `ios/ci_scripts/`
**TestFlight URL**: https://appstoreconnect.apple.com/teams/c5c5f5d2-8ebe-443d-957f-b4038c7db237/apps/6755681856/testflight

---

**Status**: Configuration files ready. Complete setup in App Store Connect and Xcode to enable automated builds.

