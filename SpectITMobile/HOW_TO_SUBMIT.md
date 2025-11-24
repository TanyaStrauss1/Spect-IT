# 📤 How to Submit Build to App Store Connect

## When EAS Submit Asks for Build Information

When you run `eas submit --platform ios`, you'll see these options:

1. **Provide a URL to the app archive**
2. **Provide a path to a local app binary file**
3. **Provide a build ID to identify a build on EAS** ✅ (Easiest)

---

## ✅ Option 1: Use Build ID (Recommended)

### Step 1: List Your Builds

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
eas build:list --platform ios --limit 5
```

This will show your recent builds with their IDs.

### Step 2: Submit Using Build ID

```bash
eas submit --platform ios --id [BUILD_ID]
```

Replace `[BUILD_ID]` with the actual build ID from the list.

### Or Submit Latest Build

```bash
eas submit --platform ios --latest
```

This automatically uses your most recent build.

---

## Option 2: Use Local .ipa File

If you downloaded the .ipa file:

```bash
eas submit --platform ios --path /path/to/your/app.ipa
```

Example:
```bash
eas submit --platform ios --path ~/Downloads/spectit-mobile.ipa
```

---

## Option 3: Use URL

If you have a URL to the build archive:

```bash
eas submit --platform ios --url https://expo.dev/accounts/tstrauss/projects/spectit-mobile/builds/[BUILD_ID]
```

---

## 🚀 Quick Submit Commands

### If You Have a Build ID:

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
eas submit --platform ios --id [YOUR_BUILD_ID]
```

### If You Want Latest Build:

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
eas submit --platform ios --latest
```

### If You Have a Local .ipa File:

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
eas submit --platform ios --path ~/Downloads/your-app.ipa
```

---

## 📋 Step-by-Step Process

### 1. First, Build the App (if not done)

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
eas build --platform ios --profile production
```

Wait for build to complete (15-30 minutes).

### 2. Get Build ID

```bash
eas build:list --platform ios --limit 1
```

Note the Build ID (looks like: `abc123def456`)

### 3. Submit Using Build ID

```bash
eas submit --platform ios --id abc123def456
```

Or simply:
```bash
eas submit --platform ios --latest
```

---

## 🔍 Find Your Build ID

### Method 1: From Terminal

```bash
eas build:list --platform ios --limit 5
```

Look for the build with status "finished" and copy its ID.

### Method 2: From Expo Dashboard

1. Go to: https://expo.dev/accounts/tstrauss/projects/spectit-mobile/builds
2. Find your iOS build
3. Click on it to see the Build ID
4. Copy the ID

### Method 3: From Build Output

When your build completes, it will show:
```
Build finished: abc123def456
```

Copy that ID.

---

## 💡 Recommended Approach

**Use `--latest` flag** - This is the easiest:

```bash
eas submit --platform ios --latest
```

This automatically finds and submits your most recent build.

---

## ⚠️ If No Builds Exist

If you see "No builds found", you need to build first:

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
eas build --platform ios --profile production
```

Wait for it to complete, then submit.

---

## 📤 Complete Submit Command

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile && eas submit --platform ios --latest
```

This will:
1. Find your latest iOS build
2. Upload it to App Store Connect
3. Link it to your app (ID: 6755681856)

---

## 🔗 After Submission

1. Go to: https://appstoreconnect.apple.com/apps/6755681856/distribution/ios/version/inflight
2. Wait 5-10 minutes for build to appear
3. Select the build
4. Complete app listing
5. Submit for review

