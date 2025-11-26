# ✅ Add Tests to Xcode Project

## ❌ Problem: Tests Missing in Xcode

The Xcode scheme references a test target (`SpectITTests`), but the test target doesn't exist in the project.

---

## ✅ Solution: Create Test Target in Xcode

### Step 1: Open Xcode Project

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
open ios/SpectIT.xcworkspace
```

**Important:** Open `.xcworkspace`, NOT `.xcodeproj`!

---

### Step 2: Create Test Target

1. **In Xcode:**
   - Click on the project name in the left sidebar (top item)
   - Select the **SpectIT** project (blue icon)
   - Click the **"+"** button at the bottom of the targets list

2. **Choose Template:**
   - Select **"iOS Unit Testing Bundle"**
   - Click **"Next"**

3. **Configure Test Target:**
   - **Product Name:** `SpectITTests`
   - **Team:** Select your team (`UHMT4AX5T7`)
   - **Organization Identifier:** `com.spectit`
   - **Bundle Identifier:** `com.spectit.app.SpectITTests`
   - **Language:** Objective-C (or Swift if preferred)
   - Click **"Finish"**

---

### Step 3: Verify Test Target

1. **Check Target List:**
   - You should see `SpectITTests` in the targets list
   - It should be under the `SpectIT` target

2. **Check Scheme:**
   - Go to **Product → Scheme → Edit Scheme**
   - Click **"Test"** in the left sidebar
   - You should see `SpectITTests` listed
   - Make sure it's checked/enabled

---

### Step 4: Add Test File (If Needed)

**If the test file doesn't exist:**

1. **Right-click** on `SpectITTests` folder in Project Navigator
2. **New File...**
3. Choose **"Unit Test Case Class"**
4. Name: `SpectITTests`
5. Language: Objective-C (or Swift)
6. Click **"Create"**

**Or use the existing file:**
- I've created `ios/SpectITTests/SpectITTests.m`
- Add it to the test target in Xcode

---

### Step 5: Update Xcode Cloud Workflow

The workflow has been updated to include tests. It will now:
- ✅ Run tests before archiving
- ✅ Fail build if tests fail
- ✅ Show test results in Xcode Cloud

---

## ✅ Verify Tests Work

### In Xcode:

1. **Run Tests:**
   - Press **⌘U** (Command + U)
   - Or **Product → Test**
   - Tests should run and pass

2. **Check Test Navigator:**
   - Click the test icon in the left sidebar
   - You should see `SpectITTests` with test methods

---

## 🔧 Troubleshooting

### Issue: "Test target not found"

**Fix:**
1. Make sure test target is created
2. Check scheme includes test target
3. Verify test target is in the project file

### Issue: "Tests don't run in Xcode Cloud"

**Fix:**
1. Verify workflow includes `test` action
2. Check test target is properly configured
3. Make sure tests pass locally first

### Issue: "Test file not found"

**Fix:**
1. Add test file to test target
2. Check file is in `SpectITTests` folder
3. Verify file is included in build

---

## 📋 Quick Checklist

- [ ] Test target created: `SpectITTests`
- [ ] Test file exists: `SpectITTests.m`
- [ ] Test target added to scheme
- [ ] Tests run locally (⌘U)
- [ ] Workflow updated to include tests
- [ ] Tests pass in Xcode Cloud

---

## 🚀 After Adding Tests

**Xcode Cloud will:**
- ✅ Run tests automatically on every build
- ✅ Fail build if tests fail
- ✅ Show test results in build logs
- ✅ Help catch issues before distribution

---

## 📖 Test File Created

I've created a basic test file:
- **Location:** `ios/SpectITTests/SpectITTests.m`
- **Contains:** Basic test structure
- **Next:** Add it to the test target in Xcode

---

**Follow the steps above to create the test target in Xcode!** ✅

