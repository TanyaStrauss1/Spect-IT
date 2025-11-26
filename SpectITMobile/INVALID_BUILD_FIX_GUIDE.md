# 🔧 Fix Invalid Build - Complete Guide

## ❌ Problem: Build Shows as "Invalid"

When a build shows as "Invalid" in TestFlight, it means Apple rejected the build during processing. This guide will help you fix and rebuild.

---

## 🔍 Common Causes

### 1. **Wrong Team ID** ⚠️ (Most Common)
- **Issue:** Team ID mismatch between Xcode and App Store Connect
- **Current Team ID:** `UHMT4AX5T7`
- **Old Team ID (causing issues):** `P7BPRR2MY3`

### 2. **Wrong Bundle ID**
- **Required:** `com.spectit.app`
- **Check:** Must match in app.json and Xcode project

### 3. **Code Signing Issues**
- Missing provisioning profiles
- Expired certificates
- Signing configuration errors

### 4. **Version/Build Conflicts**
- Version already used
- Build number conflicts

### 5. **Missing Required Capabilities**
- Missing entitlements
- Required permissions not declared

---

## ✅ Quick Fix

**Run the automated fix script:**

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
./FIX_INVALID_BUILD.sh
```

This will:
1. ✅ Verify all configuration
2. ✅ Fix team ID inconsistencies
3. ✅ Guide you through rebuild

---

## 🔧 Manual Fix Steps

### Step 1: Fix Team ID

**In Xcode Project:**
1. Open: `ios/SpectIT.xcodeproj/project.pbxproj`
2. Find all instances of: `P7BPRR2MY3`
3. Replace with: `UHMT4AX5T7`

**Or use the automated fix:**
```bash
cd SpectITMobile
sed -i '' 's/P7BPRR2MY3/UHMT4AX5T7/g' ios/SpectIT.xcodeproj/project.pbxproj
```

### Step 2: Verify Configuration

**app.json:**
```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.spectit.app",
      "buildNumber": "1"
    }
  }
}
```

**Xcode Project:**
- Team ID: `UHMT4AX5T7`
- Bundle ID: `com.spectit.app`
- Version: `1.0.0`
- Build: `1`

### Step 3: Clean Build

**In Xcode:**
1. **Product → Clean Build Folder** (Shift + Cmd + K)
2. Close Xcode
3. Delete derived data:
   ```bash
   rm -rf ~/Library/Developer/Xcode/DerivedData
   ```

**Or use EAS:**
```bash
eas build --platform ios --profile production --clear-cache
```

### Step 4: Rebuild

**Option 1: EAS Build (Recommended)**
```bash
cd SpectITMobile
eas credentials --platform ios
eas build --platform ios --profile production
```

**Option 2: Xcode Build**
1. Open: `ios/SpectIT.xcworkspace`
2. Verify signing (Team: UHMT4AX5T7)
3. Select "Any iOS Device"
4. **Product → Archive**
5. **Distribute App → App Store Connect**

---

## 📊 After Rebuild

### Step 1: Wait for Processing

- **Time:** 15-30 minutes
- **Status:** "Processing" → "Ready to Submit"
- **Check:** https://appstoreconnect.apple.com/teams/c5c5f5d2-8ebe-443d-957f-b4038c7db237/apps/6755681856/testflight

### Step 2: Verify Build Status

**Good Status:**
- ✅ "Ready to Submit"
- ✅ "Ready to Test"

**Bad Status:**
- ❌ "Invalid" → Check error details
- ⏳ "Processing" → Wait longer

### Step 3: Check Error Details

**If still invalid:**
1. Click on the build in TestFlight
2. Check "Build Details" section
3. Look for error messages
4. Common errors:
   - "Invalid Bundle"
   - "Code Signing Error"
   - "Missing Entitlements"
   - "Version Conflict"

---

## 🔍 Detailed Troubleshooting

### Error: "Invalid Bundle"

**Causes:**
- Missing Info.plist entries
- Wrong bundle structure
- Missing required files

**Fix:**
- Verify `app.json` configuration
- Check `Info.plist` in Xcode
- Ensure all assets are included

### Error: "Code Signing Error"

**Causes:**
- Wrong team ID
- Expired certificate
- Missing provisioning profile

**Fix:**
1. Verify team ID: `UHMT4AX5T7`
2. Check "Automatically manage signing" is enabled
3. Select correct team in Xcode
4. Let Xcode regenerate certificates

### Error: "Version Conflict"

**Causes:**
- Version already exists
- Build number conflict

**Fix:**
1. Increment build number in `app.json`:
   ```json
   "buildNumber": "2"
   ```
2. Or use new version:
   ```json
   "version": "1.0.1"
   ```

### Error: "Missing Entitlements"

**Causes:**
- Required capabilities not declared
- Missing permissions

**Fix:**
1. Check `app.json` for required permissions
2. Verify Info.plist has usage descriptions
3. Add missing capabilities in Xcode

---

## ✅ Verification Checklist

Before rebuilding, verify:

- [ ] Team ID is `UHMT4AX5T7` everywhere
- [ ] Bundle ID is `com.spectit.app` everywhere
- [ ] Version is `1.0.0`
- [ ] Build number is `1` (or increment if needed)
- [ ] "Automatically manage signing" is enabled
- [ ] Correct team selected in Xcode
- [ ] All required permissions in Info.plist
- [ ] No old team ID references (P7BPRR2MY3)

---

## 🚀 Quick Rebuild

**Easiest method:**

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
./FIX_INVALID_BUILD.sh
```

Select option 1 (EAS Build) for automatic handling.

---

## 📱 Important Links

- **TestFlight:** https://appstoreconnect.apple.com/teams/c5c5f5d2-8ebe-443d-957f-b4038c7db237/apps/6755681856/testflight
- **App Store Connect:** https://appstoreconnect.apple.com/teams/c5c5f5d2-8ebe-443d-957f-b4038c7db237/apps/6755681856/appstore
- **EAS Builds:** https://expo.dev/accounts/tstrauss/projects/spectit-mobile/builds

---

**Run the fix script to automatically resolve and rebuild!** 🚀

