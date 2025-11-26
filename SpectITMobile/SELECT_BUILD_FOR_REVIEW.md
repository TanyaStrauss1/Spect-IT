# Select Build for App Store Review

## Error: "You must choose a build"

This error means you need to select a build from TestFlight before submitting for review.

## Step-by-Step: Select Build

### Step 1: Go to App Store Tab

1. In App Store Connect:
   - Navigate to: **App Store** tab
   - (Not TestFlight tab)

2. Scroll down to **"Build"** section
   - Look for field that says "iOS Build" or "Build"
   - Should show: "Select a build before you submit your app"

### Step 2: Select Build

1. **Click the "+" button** or **"Select a build"** link
   - This opens the build selector dialog

2. **Available builds will appear:**
   - Look for your build (Version 1.0, Build 1)
   - Check build status

3. **Select the build:**
   - Click on the build you want to submit
   - Build should show "Ready to Submit" or "Ready to Test" status
   - Click "Done" or "Select"

### Step 3: Verify Build Selected

1. **Build should now appear** in the Build field
   - Shows version and build number
   - Status should be visible

2. **Now you can submit:**
   - Complete other required fields
   - Click "Submit for Review"

## If No Build Appears

### Check Build Status in TestFlight

1. Go to **TestFlight** tab
2. Check **"iOS Builds"** section
3. Look for your build status:

   - **Processing** → Wait for this to complete (15-30 minutes)
   - **Ready to Test** → Can be selected for App Store
   - **Ready to Submit** → Ready for review
   - **Expired** → Cannot use (need to upload new build)

### Build Still Processing

If build shows "Processing":
- Wait 15-30 minutes
- Check email at tanstrauss@gmail.com for updates
- Return to App Store tab once status changes

### Upload New Build

If you need to upload a new build:
1. Go to Xcode
2. Product → Archive
3. Window → Organizer
4. Distribute App → App Store Connect → Upload

## Build Requirements

For a build to be selectable:
- ✅ Must be uploaded to App Store Connect
- ✅ Must be processed (not "Processing")
- ✅ Must not be expired
- ✅ Must match the version you're submitting

## Quick Checklist

- [ ] Go to App Store tab (not TestFlight)
- [ ] Scroll to Build section
- [ ] Click "+" or "Select a build"
- [ ] Select build with "Ready to Submit" status
- [ ] Verify build appears in Build field
- [ ] Complete other required fields
- [ ] Submit for Review

## Troubleshooting

### "No builds available"
- Check TestFlight tab for build status
- Wait for processing to complete
- Upload new build if needed

### Build shows "Expired"
- Upload a new build
- Archive and upload from Xcode

### Build not appearing in selector
- Verify build is in TestFlight
- Check build status is "Ready to Test" or "Ready to Submit"
- Try refreshing the page

---

**After selecting build, complete other required fields and submit for review!**

