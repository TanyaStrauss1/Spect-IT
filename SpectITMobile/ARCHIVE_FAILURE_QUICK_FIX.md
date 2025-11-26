# ⚡ Quick Fix: Archive Failure

## 🔍 What We Need

**The exact error message from Xcode Cloud build logs.**

To get it:
1. Go to: https://appstoreconnect.apple.com/teams/c5c5f5d2-8ebe-443d-957f-b4038c7db237/apps/6755681856/ci
2. Click on the failed build
3. Click "View Logs" or "Download Logs"
4. Look for red error messages
5. Copy the exact error text

## 🚀 Most Common Fixes

### Fix 1: Code Signing (Most Common)

**If error mentions "signing", "provisioning", or "certificate":**

1. **In Xcode:**
   - Open: `ios/SpectIT.xcworkspace`
   - Project → Target → Signing & Capabilities
   - ✅ Check "Automatically manage signing"
   - Select Team: P7BPRR2MY3
   - Wait for green checkmark ✅

2. **Commit and push:**
   ```bash
   git add ios/SpectIT.xcodeproj/project.pbxproj
   git commit -m "Fix: Verify signing configuration"
   git push origin main
   ```

### Fix 2: Missing Dependencies

**If error mentions missing files or CocoaPods:**

✅ Already fixed - pre-build script installs CocoaPods

### Fix 3: Build Configuration

**If error mentions configuration mismatch:**

✅ Already correct - Scheme uses Release for Archive

### Fix 4: Distribution Certificate

**If error mentions "no distribution certificate":**

1. **Check Apple Developer:**
   - https://developer.apple.com/account
   - Certificates, Identifiers & Profiles
   - Certificates → Check for App Store certificate
   - If missing: Create new App Store certificate

2. **Xcode Cloud should create this automatically**, but if it doesn't:
   - May need to verify team access
   - Check App Store Connect app settings

## 📋 Diagnostic Checklist

Run this to check everything:
```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
./DIAGNOSE_ARCHIVE_FAILURE.sh
```

## 🔧 What to Share

When asking for help, share:
1. **Exact error message** from build logs
2. **Which step failed** (Pre-build, Build, Archive, Distribute)
3. **Error code** (if any)
4. **Screenshot** of error (if possible)

## 💡 Quick Actions

1. **Check build logs** → Get exact error
2. **Run diagnostic** → `./DIAGNOSE_ARCHIVE_FAILURE.sh`
3. **Verify signing** → In Xcode (if accessible)
4. **Check certificate** → Apple Developer portal

---

**Share the exact error message and we'll provide a targeted fix!** 🔍

