# Xcode Cloud Setup with GitHub Access

## Grant GitHub Access to Xcode Cloud

### Step 1: Connect GitHub Repository

1. Go to: https://appstoreconnect.apple.com/teams/c5c5f5d2-8ebe-443d-957f-b4038c7db237/ci-setup/782ba1bc-eb0a-41f8-a4f1-988d4d6e6526

2. **Connect Repository:**
   - Click **"Connect Repository"** or **"Add Repository"**
   - Select **GitHub** as your source control provider
   - Authorize GitHub access if prompted
   - Sign in with your GitHub account

3. **Select Repository:**
   - Find and select: **TanyaStrauss1/Spect-IT**
   - Branch: **main**
   - Click **"Connect"** or **"Save"**

### Step 2: Configure Email Notifications

1. In the same Xcode Cloud setup page:
   - Look for **"Notifications"** or **"Email Settings"**
   - Add email: **tanstrauss@gmail.com**
   - Enable notifications for:
     - ✅ Build started
     - ✅ Build succeeded
     - ✅ Build failed
     - ✅ Build ready for testing

2. **Save email settings**

### Step 3: Create Workflow in Xcode

1. **Open Xcode:**
   ```bash
   cd /Users/tanyastrauss/Spect-IT/SpectITMobile
   open ios/SpectIT.xcworkspace
   ```

2. **Create Workflow:**
   - **Product → Xcode Cloud → Create Workflow**
   - Or: **Xcode → Settings → Cloud → Create Workflow**

3. **Configure Workflow:**
   - **Name:** Build and Distribute Spect-IT
   - **Repository:** TanyaStrauss1/Spect-IT (should auto-detect)
   - **Branch:** main
   - **Scheme:** SpectIT
   - **Configuration:** Release
   - **Destination:** Any iOS Device

4. **Add Actions:**
   - ✅ **Archive** - Build the app
   - ✅ **Distribute** - Upload to App Store Connect

5. **Set Triggers:**
   - ✅ **Git Push** - Automatically build on push to main
   - ✅ **Manual** - Allow manual builds

6. **Save Workflow**

### Step 4: Verify Configuration

1. **Check Workflow File:**
   - `ios/.xcodecloud/workflow.yml` should exist
   - Team ID: P7BPRR2MY3
   - Bundle ID: com.spectit.app

2. **Verify in App Store Connect:**
   - Go to: https://appstoreconnect.apple.com
   - My Apps → Spect-IT → Xcode Cloud
   - Repository should show: TanyaStrauss1/Spect-IT
   - Email: tanstrauss@gmail.com should be configured

### Step 5: Test the Build

1. **Push to GitHub:**
   ```bash
   cd /Users/tanyastrauss/Spect-IT
   git add .
   git commit -m "Configure Xcode Cloud with GitHub access"
   git push origin main
   ```

2. **Monitor Build:**
   - Check App Store Connect → Xcode Cloud
   - Or: Xcode → Product → Xcode Cloud → View Workflows
   - You'll receive email at tanstrauss@gmail.com when build completes

## Email Notifications

You'll receive emails at **tanstrauss@gmail.com** for:
- Build started
- Build succeeded
- Build failed
- Build ready for TestFlight

## Troubleshooting

### GitHub Access Denied
- Re-authorize GitHub in App Store Connect
- Check GitHub permissions for Xcode Cloud

### Build Not Triggering
- Verify repository is connected
- Check branch name (should be `main`)
- Ensure workflow is saved and enabled

### Email Not Received
- Check spam folder
- Verify email in App Store Connect settings
- Check notification preferences

## Quick Reference

- **Xcode Cloud Setup:** https://appstoreconnect.apple.com/teams/c5c5f5d2-8ebe-443d-957f-b4038c7db237/ci-setup/782ba1bc-eb0a-41f8-a4f1-988d4d6e6526
- **Repository:** TanyaStrauss1/Spect-IT
- **Branch:** main
- **Email:** tanstrauss@gmail.com
- **Team ID:** P7BPRR2MY3

