# 🔧 Fix Bundle ID Configuration

## ⚠️ Invalid Bundle ID Provided

**You mentioned:** `com.Spect-IT.SpectIT`

**Problem:** Bundle IDs cannot contain hyphens (`-`) or spaces!

---

## ✅ Current Valid Bundle ID

**Current:** `com.spectit.app`

**This is:**
- ✅ Valid format (no hyphens, no spaces)
- ✅ Already configured in Xcode project
- ✅ Already configured in Xcode Cloud workflow
- ✅ Should match App Store Connect

---

## 🔍 Bundle ID Rules

**Valid characters:**
- Letters (a-z, A-Z)
- Numbers (0-9)
- Periods (.)
- Underscores (_) - but not recommended

**Invalid characters:**
- ❌ Hyphens (`-`)
- ❌ Spaces
- ❌ Special characters

**Format:**
- `com.company.appname`
- Reverse domain notation
- Lowercase recommended

---

## ✅ Valid Alternatives

If you want to change the Bundle ID, here are valid options:

1. **`com.spectit.spectit`** (lowercase, no hyphen)
2. **`com.spectit.app`** (current - recommended)
3. **`com.spectit.mobile`**
4. **`com.spectit.ios`**

**But remember:** Bundle ID must match what's in App Store Connect!

---

## 🔧 How to Check App Store Connect

**To see what Bundle ID is registered:**

1. Go to: https://appstoreconnect.apple.com
2. Click "My Apps"
3. Select "Spect-IT" app
4. Go to "App Information"
5. Check "Bundle ID" field

**This is what your Xcode project must match!**

---

## 🔧 How to Update Bundle ID

**If you need to change it:**

### Step 1: Update Xcode Project

**In Xcode:**
1. Click project (blue icon)
2. Select "SpectIT" target
3. Go to "General" tab
4. Find "Bundle Identifier"
5. Change to new Bundle ID
6. Save

### Step 2: Update Workflow

**File:** `ios/.xcodecloud/workflow.yml`

```yaml
bundle_id: com.spectit.spectit  # or your new Bundle ID
```

### Step 3: Update app.json (if using Expo)

**File:** `app.json`

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.spectit.spectit"
    }
  }
}
```

### Step 4: Register in Apple Developer

**If using a new Bundle ID:**
1. Go to: https://developer.apple.com/account/resources/identifiers/list
2. Click "+" → "App IDs"
3. Register new Bundle ID
4. Select capabilities

---

## ⚠️ Important Notes

1. **Bundle ID must match App Store Connect**
   - Check what's registered there first
   - Don't change unless necessary

2. **Bundle ID cannot be changed after submission**
   - Once app is submitted, Bundle ID is locked
   - Must create new app for different Bundle ID

3. **Current Bundle ID is valid**
   - `com.spectit.app` is correct format
   - No need to change unless App Store Connect uses different one

---

## ✅ Recommendation

**Keep current Bundle ID:** `com.spectit.app`

**Unless:**
- App Store Connect shows different Bundle ID
- You need to create a new app
- You have a specific reason to change

**Check App Store Connect first before changing!**

---

## 🔍 Quick Check

**To verify current Bundle ID:**

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
grep -r "PRODUCT_BUNDLE_IDENTIFIER" ios/SpectIT.xcodeproj/project.pbxproj
```

**Should show:** `com.spectit.app`

---

**The Bundle ID `com.Spect-IT.SpectIT` is invalid. Use `com.spectit.app` (current) or a valid alternative without hyphens!** ✅

