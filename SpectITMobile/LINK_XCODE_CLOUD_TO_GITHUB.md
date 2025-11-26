# 🔗 Link Xcode Cloud to GitHub - Step by Step

## ❌ Problem: Xcode Cloud Not Working

Xcode Cloud needs to be connected to your GitHub repository to work.

---

## ✅ Solution: Connect GitHub Repository

### Step 1: Go to Xcode Cloud Setup

1. **Go to:** https://appstoreconnect.apple.com/teams/c5c5f5d2-8ebe-443d-957f-b4038c7db237/apps/6755681856/ci

2. **Or navigate:**
   - App Store Connect → Your App → Xcode Cloud
   - Look for "Products" or "Repositories" section

---

### Step 2: Connect Repository

1. **Click "Connect Repository"** or **"Add Repository"** button

2. **Select Source Control Provider:**
   - Choose **"GitHub"**
   - (Not GitLab or Bitbucket)

3. **Authorize GitHub Access:**
   - Click **"Authorize"** or **"Sign in to GitHub"**
   - Sign in with your GitHub account
   - Grant permissions to Xcode Cloud
   - Authorize access to repositories

4. **Select Repository:**
   - Find: **`TanyaStrauss1/Spect-IT`**
   - Click on it to select
   - Verify it's the correct repository

5. **Select Branch:**
   - Choose: **`main`** (or `master` if that's your default)
   - This is the branch Xcode Cloud will monitor

6. **Click "Connect"** or **"Save"**

---

### Step 3: Verify Connection

**After connecting, you should see:**
- ✅ Repository: `TanyaStrauss1/Spect-IT`
- ✅ Branch: `main`
- ✅ Status: "Connected" or "Active"
- ✅ Green checkmark or success indicator

---

### Step 4: Create Workflow (If Not Auto-Created)

**If workflow doesn't exist automatically:**

1. **In Xcode Cloud page:**
   - Look for **"Workflows"** section
   - Click **"Create Workflow"** or **"Add Workflow"**

2. **Or in Xcode:**
   ```bash
   cd /Users/tanyastrauss/Spect-IT/SpectITMobile
   open ios/SpectIT.xcworkspace
   ```
   - **Product → Xcode Cloud → Create Workflow**

3. **Configure Workflow:**
   - **Name:** `Build and Distribute Spect-IT`
   - **Repository:** `TanyaStrauss1/Spect-IT` (should auto-detect)
   - **Branch:** `main`
   - **Scheme:** `SpectIT`
   - **Configuration:** `Release`
   - **Destination:** `Any iOS Device` or `generic/platform=iOS`

4. **Add Actions:**
   - ✅ **Archive** - Build the app
   - ✅ **Distribute** - Upload to App Store Connect

5. **Set Triggers:**
   - ✅ **On Git Push** - Automatically build on push to `main`
   - ✅ **Manual** - Allow on-demand builds

6. **Save Workflow**

---

## 🔍 Troubleshooting

### Issue: "Repository not found"

**Fix:**
1. Verify repository is public or you've granted access
2. Re-authorize GitHub in App Store Connect
3. Check repository name: `TanyaStrauss1/Spect-IT`
4. Ensure repository exists and is accessible

### Issue: "Authorization failed"

**Fix:**
1. Go to GitHub Settings → Applications → Authorized OAuth Apps
2. Revoke Xcode Cloud access
3. Re-authorize in App Store Connect
4. Grant all requested permissions

### Issue: "Branch not found"

**Fix:**
1. Verify branch name: `main` (not `master`)
2. Check: `git branch` to see your branches
3. Ensure branch exists in GitHub
4. Try pushing to the branch first

### Issue: "Workflow file not found"

**Fix:**
1. Verify file exists: `ios/.xcodecloud/workflow.yml`
2. Ensure file is committed to Git
3. Push to GitHub: `git push origin main`
4. Check file is in the correct location

---

## ✅ Verify Everything Works

### Test the Connection:

1. **Make a small change:**
   ```bash
   cd /Users/tanyastrauss/Spect-IT/SpectITMobile
   echo "# Test Xcode Cloud" >> test.txt
   git add test.txt
   git commit -m "Test Xcode Cloud connection"
   git push origin main
   ```

2. **Check Xcode Cloud:**
   - Go to Xcode Cloud page
   - Should see new build starting
   - Status: "In Progress"

3. **If build starts:**
   - ✅ Connection is working!
   - ✅ Xcode Cloud is linked to GitHub
   - ✅ Future pushes will build automatically

---

## 📋 Quick Checklist

**Before connecting:**
- [ ] GitHub repository exists: `TanyaStrauss1/Spect-IT`
- [ ] Repository is accessible (public or permissions granted)
- [ ] Branch `main` exists
- [ ] Workflow file exists: `ios/.xcodecloud/workflow.yml`

**After connecting:**
- [ ] Repository shows as "Connected"
- [ ] Branch `main` is selected
- [ ] Workflow exists and is active
- [ ] Test push triggers a build

---

## 🔗 Important Links

- **Xcode Cloud:** https://appstoreconnect.apple.com/teams/c5c5f5d2-8ebe-443d-957f-b4038c7db237/apps/6755681856/ci
- **GitHub Repository:** https://github.com/TanyaStrauss1/Spect-IT
- **GitHub Settings:** https://github.com/settings/applications

---

## 🚀 After Connecting

**Once connected:**
- ✅ Every push to `main` will trigger a build
- ✅ Builds happen automatically
- ✅ No manual intervention needed
- ✅ Uploads to App Store Connect automatically

**Test it:**
- Make a small commit
- Push to GitHub
- Watch Xcode Cloud start building!

---

**Follow the steps above to link Xcode Cloud to your GitHub repository!** 🔗

