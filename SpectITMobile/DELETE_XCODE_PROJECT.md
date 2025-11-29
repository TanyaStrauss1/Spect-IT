# 🗑️ Delete Xcode Project

## ⚠️ Important: Don't Delete Main Project!

**DO NOT DELETE:**
- `/Users/tanyastrauss/Spect-IT/SpectITMobile/ios/SpectIT.xcworkspace`
- This is your main project we've been working on!

---

## 🔍 How to Delete a Project in Xcode

### Option 1: Delete from Finder

1. **Close Xcode completely**
   - Quit Xcode (⌘Q)

2. **Open Finder**

3. **Navigate to project location**
   - Usually in `~/Documents` or `~/Desktop`

4. **Find the project folder:**
   - Look for `.xcodeproj` or `.xcworkspace` file
   - Or folder containing the project

5. **Move to Trash:**
   - Right-click → Move to Trash
   - Or drag to Trash

6. **Empty Trash** (optional)

---

### Option 2: Delete from Xcode

1. **Open Xcode**

2. **Close the project** (if open)
   - File → Close Project

3. **In Xcode Welcome Screen:**
   - Right-click on project in "Recent Projects"
   - Select "Remove from Recents"
   - This doesn't delete the file, just removes from list

4. **Delete the actual files:**
   - Use Finder (see Option 1)

---

### Option 3: Delete via Terminal

**⚠️ Be very careful with this!**

```bash
# First, identify the project location
# Then delete it

# Example (DO NOT RUN THIS - just an example):
# rm -rf ~/Documents/NewProject.xcodeproj
```

**Better to use Finder for safety!**

---

## 🔍 Finding Projects to Delete

### Check Common Locations

```bash
# Check Documents
ls -la ~/Documents/*.xcodeproj ~/Documents/*.xcworkspace

# Check Desktop
ls -la ~/Desktop/*.xcodeproj ~/Desktop/*.xcworkspace

# Check current directory
find . -name "*.xcodeproj" -o -name "*.xcworkspace"
```

---

## ✅ Safe Deletion Checklist

Before deleting:

- [ ] **Confirmed it's NOT the main Spect-IT project**
- [ ] **Project is closed in Xcode**
- [ ] **No important work in the project**
- [ ] **Backed up if needed** (optional)
- [ ] **Ready to delete**

---

## 🚫 What NOT to Delete

**DO NOT DELETE:**
- `/Users/tanyastrauss/Spect-IT/SpectITMobile/ios/SpectIT.xcworkspace`
- `/Users/tanyastrauss/Spect-IT/SpectITMobile/ios/SpectIT.xcodeproj`
- Any project in the `/Users/tanyastrauss/Spect-IT/` directory

**These are your main projects!**

---

## 🔧 If You Accidentally Deleted Something

**If you deleted the wrong project:**

1. **Check Trash:**
   - Open Trash
   - Look for the project
   - Restore if found

2. **Check Time Machine:**
   - If enabled, restore from backup

3. **Check Git:**
   - If project was in Git, you can restore from repository

---

## 📋 Quick Steps

1. **Close Xcode**
2. **Open Finder**
3. **Navigate to project location**
4. **Find `.xcodeproj` or `.xcworkspace` file**
5. **Move to Trash**
6. **Empty Trash** (if sure)

---

**Make sure you're deleting the RIGHT project, not your main Spect-IT project!** ⚠️

