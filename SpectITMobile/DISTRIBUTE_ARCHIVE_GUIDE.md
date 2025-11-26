# Distribute Archive to App Store Connect

## ✅ Archive Created!

Your iOS archive is ready. Follow these steps to upload it to App Store Connect.

## Step-by-Step Distribution

### Step 1: Open Organizer

1. In Xcode:
   - **Window → Organizer**
   - Or: **Product → Archive** (if Organizer didn't open automatically)
   - Your archive should appear at the top of the list

### Step 2: Distribute App

1. **Select your archive** (the latest one, should be at the top)
2. Click **"Distribute App"** button (bottom right)

### Step 3: Choose Distribution Method

1. Select **"App Store Connect"**
2. Click **"Next"**

### Step 4: Distribution Options

1. Select **"Upload"**
   - This uploads to App Store Connect for TestFlight/App Store
2. Click **"Next"**

### Step 5: App Thinning

1. Select **"All compatible device variants"**
   - This creates optimized builds for different devices
2. Click **"Next"**

### Step 6: Review & Upload

1. **Review the summary:**
   - App name: Spect-IT
   - Bundle ID: com.spectit.app
   - Version: 1.0
   - Build number: 1
   - Team: P7BPRR2MY3

2. Click **"Upload"**

3. **Wait for upload:**
   - Progress shown in Xcode
   - Takes 5-10 minutes depending on file size
   - You'll see "Upload Successful" when done

## After Upload

### Processing (15-30 minutes)

1. Build appears in App Store Connect
2. Status: "Processing"
3. Apple processes the build
4. Status changes to "Ready to Test" when complete

### Access TestFlight

1. Go to: https://appstoreconnect.apple.com/teams/c5c5f5d2-8ebe-443d-957f-b4038c7db237/apps/6755681856/testflight
2. Build will appear under "iOS Builds"
3. Status: "Processing" → "Ready to Test"

### Add Testers

1. **Internal Testers:**
   - Up to 100 users
   - Instant access (no review)
   - Add in TestFlight → Internal Testing

2. **External Testers:**
   - Up to 10,000 users
   - Requires App Review (24-48 hours)
   - Add in TestFlight → External Testing

## Troubleshooting

### Upload Fails
- Check internet connection
- Verify signing is correct
- Try uploading again

### Build Not Appearing
- Wait 15-30 minutes for processing
- Check App Store Connect → TestFlight
- Verify build number is unique

### Processing Takes Too Long
- Normal processing time: 15-30 minutes
- Can take up to 1 hour during peak times
- Check email at tanstrauss@gmail.com for updates

## Quick Reference

- **Archive Location:** Xcode Organizer
- **TestFlight URL:** https://appstoreconnect.apple.com/teams/c5c5f5d2-8ebe-443d-957f-b4038c7db237/apps/6755681856/testflight
- **Email Notifications:** tanstrauss@gmail.com
- **Team ID:** P7BPRR2MY3

---

**Next:** After upload, wait for processing, then add testers in TestFlight!

