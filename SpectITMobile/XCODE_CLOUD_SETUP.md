# ☁️ Xcode Cloud Setup Guide

## 🎯 What is Xcode Cloud?

Xcode Cloud is Apple's CI/CD service that automatically:
- ✅ Builds your app in the cloud
- ✅ Runs tests automatically
- ✅ Distributes to TestFlight
- ✅ Uploads to App Store Connect
- ✅ Works with GitHub/GitLab/Bitbucket

**Benefits:**
- No local machine needed for builds
- Automatic builds on every commit
- Free tier: 25 hours/month
- Integrated with App Store Connect

---

## 📋 Prerequisites

✅ **You have everything needed:**
- Apple Developer account: `tanstrauss@gmail.com` (Team: P7BPRR2MY3)
- GitHub repository: `https://github.com/TanyaStrauss1/Spect-IT`
- Xcode 16.4 (supports Xcode Cloud)
- App in App Store Connect: App ID `6755681856`

---

## 🚀 Step 1: Enable Xcode Cloud in App Store Connect

### 1.1 Go to App Store Connect

1. **Open:** https://appstoreconnect.apple.com
2. **Sign in** with: `tanstrauss@gmail.com`
3. **Go to:** My Apps → Spect-IT
4. **Click:** "App Store" tab (or "TestFlight" tab)

### 1.2 Enable Xcode Cloud

1. **Look for:** "Xcode Cloud" section (left sidebar or top menu)
2. **Click:** "Get Started" or "Enable Xcode Cloud"
3. **Accept** terms and conditions
4. **Wait** for setup (1-2 minutes)

---

## 🔗 Step 2: Connect GitHub Repository

### 2.1 In App Store Connect

1. **Go to:** Xcode Cloud → Products
2. **Click:** "Connect Repository"
3. **Select:** GitHub
4. **Authorize** GitHub access
5. **Select repository:** `TanyaStrauss1/Spect-IT`
6. **Select branch:** `main` (or `master`)

### 2.2 Verify Connection

- ✅ Repository should show as "Connected"
- ✅ Branch should be listed

---

## ⚙️ Step 3: Create Workflow in Xcode

### 3.1 Open Xcode

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
open ios/SpectIT.xcworkspace
```

### 3.2 Create Workflow

1. **In Xcode:**
   - Click **"SpectIT"** project (blue icon)
   - Click **"Signing & Capabilities"** tab
   - Look for **"Xcode Cloud"** section (at bottom)
   - Or: **Product → Xcode Cloud → Create Workflow**

2. **If Xcode Cloud section not visible:**
   - Make sure you're signed in: **Xcode → Settings → Accounts**
   - Add account: `tanstrauss@gmail.com`
   - Team should be: "Tanya Strauss (P7BPRR2MY3)"

### 3.3 Configure Workflow

**Workflow Name:** `Build and Distribute`

**Triggers:**
- ✅ **On Git Push** (to main branch)
- ✅ **On Pull Request** (optional)
- ✅ **Manual** (on-demand)

**Actions:**
1. **Archive** - Build the app
2. **Test** - Run tests (if you have any)
3. **Distribute** - Upload to App Store Connect

**Configuration:**
- **Scheme:** `SpectIT`
- **Configuration:** `Release`
- **Destination:** `Any iOS Device`
- **Distribution:** `App Store Connect`

---

## 📝 Step 4: Configure Build Settings

### 4.1 In Xcode Cloud Workflow

1. **Select workflow** you created
2. **Click:** "Edit Workflow"
3. **Go to:** "Environment" tab

**Environment Variables:**
- Add if needed (e.g., API keys)
- For now, none required

**Build Settings:**
- **Code Signing:** Automatic
- **Team:** P7BPRR2MY3
- **Bundle ID:** `com.spectit.app`

---

## 🎬 Step 5: Start First Build

### Option 1: Automatic (Recommended)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Enable Xcode Cloud"
   git push
   ```

2. **Xcode Cloud will automatically:**
   - Detect the push
   - Start building
   - Upload to App Store Connect when done

### Option 2: Manual Trigger

1. **In Xcode:**
   - **Product → Xcode Cloud → Start Build**
   - Or: **Product → Xcode Cloud → Workflows → [Your Workflow] → Start Build**

2. **In App Store Connect:**
   - Go to: **Xcode Cloud → Builds**
   - Click: **"Start Build"** button

---

## 📊 Step 6: Monitor Builds

### In App Store Connect

1. **Go to:** https://appstoreconnect.apple.com
2. **Navigate:** Xcode Cloud → Builds
3. **See:**
   - Build status (In Progress, Succeeded, Failed)
   - Build logs
   - Build time
   - Test results

### In Xcode

1. **Product → Xcode Cloud → View Builds**
2. **See:**
   - All builds
   - Build logs
   - Test results
   - Download artifacts

---

## ✅ Step 7: Verify Build Success

### After Build Completes

1. **Check App Store Connect:**
   - Go to: **TestFlight** tab
   - Build should appear (may take 5-10 minutes to process)
   - Status: "Processing" → "Ready to Submit"

2. **Check Build Logs:**
   - Click on build in Xcode Cloud
   - Review logs for any warnings/errors

---

## 🔧 Troubleshooting

### Issue: "Xcode Cloud not available"

**Fix:**
- Make sure you have Xcode 13+ (you have 16.4 ✅)
- Verify Apple Developer account is active
- Check App Store Connect access

---

### Issue: "Repository not found"

**Fix:**
1. **Reconnect repository:**
   - App Store Connect → Xcode Cloud → Products
   - Click repository → "Reconnect"
   - Re-authorize GitHub

2. **Check repository access:**
   - Make sure repository is public or you've granted access
   - Verify branch name (main vs master)

---

### Issue: "Build fails - signing error"

**Fix:**
1. **In Xcode:**
   - Project → Target → Signing & Capabilities
   - ✅ Check "Automatically manage signing"
   - Select Team: P7BPRR2MY3

2. **In Xcode Cloud workflow:**
   - Edit workflow → Environment
   - Verify Team ID: P7BPRR2MY3
   - Verify Bundle ID: com.spectit.app

---

### Issue: "Build succeeds but not in TestFlight"

**Fix:**
1. **Wait 5-10 minutes** for processing
2. **Check App Store Connect:**
   - TestFlight → iOS builds
   - Look for "Processing" status
3. **Verify distribution settings:**
   - Workflow → Actions → Distribute
   - Should be set to "App Store Connect"

---

## 💡 Best Practices

### 1. Use Separate Workflows

- **Development:** Build on every commit
- **Production:** Build only on tags/releases
- **Testing:** Run tests on PRs

### 2. Environment Variables

Store sensitive data (API keys) as environment variables:
- Xcode Cloud → Workflow → Environment → Environment Variables

### 3. Build Notifications

Enable email notifications:
- App Store Connect → Xcode Cloud → Settings → Notifications

### 4. Build Limits

- **Free tier:** 25 hours/month
- **Paid tier:** $14.99/month for 100 hours
- Monitor usage in App Store Connect

---

## 📋 Quick Checklist

- [ ] Xcode Cloud enabled in App Store Connect
- [ ] GitHub repository connected
- [ ] Workflow created in Xcode
- [ ] Build settings configured
- [ ] First build triggered
- [ ] Build succeeded
- [ ] Build appears in TestFlight

---

## 🔗 Useful Links

- **App Store Connect:** https://appstoreconnect.apple.com/apps/6755681856
- **Xcode Cloud Docs:** https://developer.apple.com/xcode-cloud/
- **GitHub Repository:** https://github.com/TanyaStrauss1/Spect-IT

---

## 🎯 Next Steps After Setup

1. **Test the workflow:**
   - Make a small change
   - Push to GitHub
   - Watch Xcode Cloud build automatically

2. **Set up notifications:**
   - Get email when builds complete
   - Get Slack notifications (optional)

3. **Create production workflow:**
   - Separate workflow for App Store releases
   - Only trigger on version tags

---

**Xcode Cloud is now ready! Your app will build automatically on every push to GitHub! 🚀**

