# 📱 Upload to TestFlight - Complete Guide

## 🎯 TestFlight URL
**Your App:** https://appstoreconnect.apple.com/teams/c5c5f5d2-8ebe-443d-957f-b4038c7db237/apps/6755681856/testflight

---

## 🚀 Quick Upload Method

**Run this script:**
```bash
cd SpectITMobile
./UPLOAD_TO_TESTFLIGHT.sh
```

This will:
- ✅ Clean previous builds
- ✅ Open Xcode
- ✅ Guide you through the upload process

---

## 📋 Step-by-Step: Xcode Upload

### Step 1: Configure Signing in Xcode

1. **Open Xcode** (should open automatically)
2. **Click project** (blue icon) → Select **"SpectIT"** target
3. **"Signing & Capabilities"** tab
4. ✅ **CHECK "Automatically manage signing"**
5. **Select Team:** "Tanya Strauss (P7BPRR2MY3)"
6. **Wait for green checkmark** ✅

### Step 2: Select Build Target

1. **Top toolbar** → Select **"Any iOS Device"** (NOT simulator)
2. **Scheme:** "SpectIT"

### Step 3: Archive

1. **Product → Archive**
2. **Wait 5-15 minutes** for build to complete
3. **Organizer window** will open automatically

### Step 4: Distribute to TestFlight

1. **In Organizer**, select your archive
2. **Click "Distribute App"**
3. **Choose "App Store Connect"**
4. **Click "Next"**
5. **Choose "Upload"** (not Export)
6. **Click "Next"**
7. **Select "Automatically manage signing"**
8. **Click "Next"**
9. **Review the summary**
10. **Click "Upload"**
11. **Wait 5-10 minutes** for upload to complete

---

## 📱 After Upload: TestFlight Setup

### Step 1: Wait for Processing

1. **Go to TestFlight:**
   https://appstoreconnect.apple.com/teams/c5c5f5d2-8ebe-443d-957f-b4038c7db237/apps/6755681856/testflight

2. **Wait 15-30 minutes** for processing
   - Status: "Processing" → "Ready to Test"
   - You'll see the build appear in TestFlight

### Step 2: Add Testers (Optional)

**Internal Testers:**
- Up to 100 users
- No review required
- Instant access

**External Testers:**
- Up to 10,000 users
- Requires Apple review (24-48 hours)
- Can be used for public beta

### Step 3: Distribute Build

1. **Select your build** in TestFlight
2. **Click "Distribute to Testers"**
3. **Choose testers** (Internal or External)
4. **Add testers** if needed
5. **Send invitations**

---

## ✅ Alternative: EAS Build for TestFlight

**If Xcode upload fails, use EAS Build:**

```bash
cd SpectITMobile
eas build --platform ios --profile production
```

This will:
- Build in the cloud
- Automatically upload to App Store Connect
- Appear in TestFlight when processing completes

---

## 📊 Monitor Upload Status

### In Xcode
- **Window → Organizer**
- See upload progress
- View upload logs

### In App Store Connect
- **TestFlight tab**
- See build status
- View processing progress

---

## 🆘 Troubleshooting

### "Upload Failed"
- Check internet connection
- Verify signing is correct
- Try uploading again

### "Build Not Appearing in TestFlight"
- Wait 15-30 minutes for processing
- Check build status in App Store Connect
- Verify build was uploaded successfully

### "Signing Error"
- Make sure "Automatically manage signing" is checked
- Select Team: P7BPRR2MY3
- Wait for green checkmark

---

## 📋 Quick Checklist

- [ ] Signing configured in Xcode
- [ ] Selected "Any iOS Device"
- [ ] Archive created successfully
- [ ] Upload completed
- [ ] Build processing in TestFlight
- [ ] Build ready for testing

---

## 🔗 Links

**TestFlight:** https://appstoreconnect.apple.com/teams/c5c5f5d2-8ebe-443d-957f-b4038c7db237/apps/6755681856/testflight

**App Store Connect:** https://appstoreconnect.apple.com

---

**Ready to upload! Follow the steps above to get your app to TestFlight!** 🚀

