# 🧹 Clean Old "Spect" References in Xcode

## 🎯 Goal

Remove old "Spect" references and ensure everything uses "Spect-IT" or "SpectIT".

---

## 📋 Step-by-Step in Xcode

### Step 1: Go to Main Project View

1. **Open Xcode:**
   ```bash
   cd /Users/tanyastrauss/Spect-IT/SpectITMobile
   open ios/SpectIT.xcworkspace
   ```

2. **Main Project View:**
   - Click **project name** (blue icon at top of left sidebar)
   - This is the main project view
   - You should see "SpectIT" project

---

### Step 2: Check for Old "Spect" Schemes

1. **In Xcode:**
   - Look at **scheme dropdown** (top left, next to device selector)
   - Should show: **"SpectIT"**
   - If you see **"Spect"** (without IT), we need to fix it

2. **Delete Old "Spect" Scheme:**
   - **Product → Scheme → Manage Schemes...**
   - Find any scheme named **"Spect"** (not "SpectIT")
   - Select it
   - Click **"-"** button to delete
   - Make sure **"SpectIT"** scheme exists and is checked/shared

---

### Step 3: Verify Project Name

1. **In Main Project View:**
   - Click project (blue icon)
   - Should show project name with "SpectIT" target
   - If you see "Spect" anywhere, note where

2. **Check Target Name:**
   - Under **TARGETS**, should see: **"SpectIT"**
   - If you see "Spect", we need to rename it

---

### Step 4: Clean Up Derived Data

**Old cached names might be in derived data:**

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
rm -rf ~/Library/Developer/Xcode/DerivedData/Spect-*
rm -rf ~/Library/Developer/Xcode/DerivedData/SpectIT-*
```

**Then:**
- Close Xcode completely
- Reopen Xcode
- Open project again

---

### Step 5: Verify All Names

**Check these locations in Xcode:**

1. **Project Name** (blue icon): Should show "SpectIT"
2. **Target Name** (under TARGETS): Should be "SpectIT"
3. **Scheme** (top left dropdown): Should be "SpectIT"
4. **Product Name** (Build Settings): Should be "SpectIT"
5. **Display Name** (Info.plist): Should be "Spect-IT"

---

## 🔍 What to Look For

### In Xcode Main View:

**Left Sidebar:**
- Project icon (blue) → Should show "SpectIT"
- Target → Should show "SpectIT"
- Scheme dropdown → Should show "SpectIT"

**If you see "Spect" (without IT) anywhere:**
- It's an old cached reference
- Delete derived data (Step 4)
- Restart Xcode

---

## ✅ Verification Checklist

- [ ] Project name: "SpectIT" (not "Spect")
- [ ] Target name: "SpectIT" (not "Spect")
- [ ] Scheme name: "SpectIT" (not "Spect")
- [ ] Product name: "SpectIT" (in Build Settings)
- [ ] Display name: "Spect-IT" (in Info.plist)
- [ ] No "Spect" schemes in Manage Schemes
- [ ] Derived data cleaned
- [ ] Xcode restarted

---

## 🔧 If "Spect" Still Appears

### Option 1: Clean Derived Data

```bash
rm -rf ~/Library/Developer/Xcode/DerivedData/*
```

**Then restart Xcode.**

---

### Option 2: Check Scheme Files

**Delete old scheme files:**

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
find ios -name "*Spect.xcscheme" -delete
find ios -name "*Spect.xcscheme" 2>/dev/null
```

**Keep only:** `SpectIT.xcscheme`

---

### Option 3: Regenerate iOS Project

**If issues persist:**

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
rm -rf ios
npx expo prebuild --platform ios --clean
```

**This creates a fresh iOS project with correct names.**

---

## 📋 Current Configuration (Should Be)

- **Project:** SpectIT
- **Target:** SpectIT
- **Scheme:** SpectIT
- **Product Name:** SpectIT
- **Display Name:** Spect-IT
- **Bundle ID:** com.spectit.app

---

## 💡 Main Project View Location

**In Xcode:**
1. Left sidebar (top)
2. Click **blue project icon** (looks like a folder)
3. This is the main project view
4. Shows project settings, targets, build phases, etc.

---

**Clean up old "Spect" references and ensure everything uses "SpectIT" or "Spect-IT"!**

