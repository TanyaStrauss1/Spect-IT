# 🧹 Clean Old "Spect" References in Xcode

## 🎯 Goal

Remove old "Spect" references and ensure everything uses "SpectIT" or "Spect-IT".

---

## 📋 Step 1: Open Xcode and Go to Main Project View

### Open Xcode:

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
open ios/SpectIT.xcworkspace
```

### Navigate to Main Project View:

1. **In Xcode's left sidebar:**
   - Look for the **blue icon** at the top (this is your project)
   - It should be named **"SpectIT"** (not "Spect")
   - **Click on it** to see the main project view

2. **Main Project View Shows:**
   - Project name at top
   - TARGETS section (should show "SpectIT")
   - PROJECT section
   - General, Signing & Capabilities, etc. tabs

---

## 🔍 Step 2: Check for Old "Spect" References

### Check These Locations:

#### A. Project Name (Top of Navigator)

1. **Click the blue project icon** (top of left sidebar)
2. **Look at the project name** - should be "SpectIT"
3. **If it shows "Spect":**
   - This might be cached - try closing and reopening Xcode

#### B. Scheme Name (Top Toolbar)

1. **Look at the scheme dropdown** (top left, next to device selector)
2. **Should show:** "SpectIT"
3. **If it shows "Spect":**
   - Click the scheme dropdown
   - Select "SpectIT"
   - If "SpectIT" not in list, see Step 3

#### C. Target Name

1. **In main project view:**
   - Under **TARGETS** section
   - Should show: **"SpectIT"**
   - **If it shows "Spect":** This needs to be fixed

#### D. Product Name

1. **Click "SpectIT" target**
2. **Go to "Build Settings" tab**
3. **Search for:** "Product Name"
4. **Should be:** `SpectIT`
5. **If it's "Spect":** Change it to `SpectIT`

---

## 🧹 Step 3: Clean Up Old References

### Fix Scheme Name:

1. **Product → Scheme → Manage Schemes...**
2. **Look for:**
   - ✅ "SpectIT" scheme (keep this)
   - ❌ "Spect" scheme (delete this if it exists)
3. **If "Spect" exists:**
   - Select it
   - Click **"-"** button to delete
4. **Ensure "SpectIT" is:**
   - ✅ Checked (enabled)
   - ✅ Shared (if option available)

### Fix Project Name (if needed):

1. **Click project (blue icon)**
2. **In main editor area, click project name** (top)
3. **If it shows "Spect":**
   - This is usually cached
   - Close Xcode completely
   - Delete derived data (see Step 4)
   - Reopen Xcode

### Fix Target Name (if needed):

**Target name should already be "SpectIT"** - if not:

1. **Click project (blue icon)**
2. **Select target** under TARGETS
3. **Go to "Build Settings" tab**
4. **Search:** "Product Name"
5. **Change to:** `SpectIT`
6. **Also check:** "PRODUCT_NAME" in build settings

---

## 🗑️ Step 4: Clean Derived Data (Removes Cached Names)

**This removes cached project names:**

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile

# Delete derived data
rm -rf ~/Library/Developer/Xcode/DerivedData/SpectIT-*
rm -rf ~/Library/Developer/Xcode/DerivedData/Spect-*

# Clean build folder in Xcode
# Product → Clean Build Folder (Cmd+Shift+K)
```

**Then:**
1. **Close Xcode completely**
2. **Reopen Xcode**
3. **Open project again**
4. **Check if names are correct**

---

## ✅ Step 5: Verify Everything is Correct

### Checklist:

- [ ] **Project name:** "SpectIT" (in navigator)
- [ ] **Scheme name:** "SpectIT" (top toolbar)
- [ ] **Target name:** "SpectIT" (under TARGETS)
- [ ] **Product Name:** `SpectIT` (Build Settings)
- [ ] **Bundle ID:** `com.spectit.app`
- [ ] **Display Name:** "Spect-IT" (Info.plist - CFBundleDisplayName)

---

## 📋 Current Configuration (Should Be):

**From project files, everything is already correct:**
- ✅ PRODUCT_NAME = SpectIT
- ✅ Scheme: SpectIT
- ✅ Target: SpectIT
- ✅ CFBundleDisplayName = Spect-IT (what users see)
- ✅ Bundle ID: com.spectit.app

**If Xcode shows "Spect" anywhere, it's likely cached.**

---

## 🔄 If "Spect" Still Appears

### Option 1: Clean Everything

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile

# Clean derived data
rm -rf ~/Library/Developer/Xcode/DerivedData/*

# Clean build folder
rm -rf ios/build

# Reopen Xcode
open ios/SpectIT.xcworkspace
```

### Option 2: Regenerate iOS Project

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile

# Backup current
cp -r ios ios_backup

# Regenerate
npx expo prebuild --platform ios --clean

# Reinstall pods
cd ios
pod install
cd ..
```

---

## 💡 Main Project View in Xcode

**To get to main project view:**

1. **Open Xcode**
2. **Click the blue icon** at top of left sidebar (project navigator)
3. **This shows:**
   - Project settings
   - Targets
   - Build settings
   - Signing & Capabilities
   - Info
   - etc.

**This is the "main project view" where you configure everything.**

---

## 📋 Quick Reference

**Current correct names:**
- Project: SpectIT
- Scheme: SpectIT
- Target: SpectIT
- Product: SpectIT
- Display Name: Spect-IT
- Bundle ID: com.spectit.app

**If you see "Spect" (without IT), it's cached - clean derived data!**

---

**The project files are already correct - any "Spect" you see is likely Xcode cache!**

