# App Store Connect API - Advanced Automation Guide

## Overview

For fully automated submissions, you can use the App Store Connect API. This requires:

1. **App Store Connect API Key** (JWT-based authentication)
2. **API Access** enabled in App Store Connect
3. **Scripts** to interact with the API

## Benefits

- ✅ Fully automated submissions
- ✅ No manual clicking in App Store Connect
- ✅ Can be integrated into CI/CD pipelines
- ✅ Programmatic build selection
- ✅ Automated metadata updates

## Setup Steps

### Step 1: Generate API Key

1. **Go to:** https://appstoreconnect.apple.com/access/api
2. **Click:** "Keys" tab
3. **Click:** "+" to create new key
4. **Name:** "Spect-IT Automation"
5. **Access:** "App Manager" or "Admin"
6. **Download:** `.p8` key file (only shown once!)
7. **Note:** Key ID and Issuer ID

### Step 2: Install API Tools

```bash
# Option 1: Use fastlane (Recommended)
gem install fastlane

# Option 2: Use appstoreconnect-api (Node.js)
npm install -g @appstoreconnect/api-client
```

### Step 3: Configure Credentials

Create `.env` file:

```bash
# App Store Connect API
ASC_KEY_ID=YOUR_KEY_ID
ASC_ISSUER_ID=YOUR_ISSUER_ID
ASC_KEY_PATH=/path/to/AuthKey_XXXXXXXX.p8

# App Info
APP_ID=6755681856
BUNDLE_ID=com.spectit.app
```

### Step 4: Use Fastlane for Automation

Create `fastlane/Fastfile`:

```ruby
default_platform(:ios)

platform :ios do
  desc "Submit app to App Store"
  lane :submit do
    # Upload build (if not already uploaded)
    # upload_to_app_store(
    #   skip_metadata: false,
    #   skip_screenshots: false,
    #   submit_for_review: true,
    #   automatic_release: true
    # )
    
    # Update metadata
    deliver(
      app_identifier: "com.spectit.app",
      submit_for_review: true,
      automatic_release: true,
      force: true,
      skip_metadata: false,
      skip_screenshots: false
    )
  end
  
  desc "Update app metadata"
  lane :update_metadata do
    deliver(
      app_identifier: "com.spectit.app",
      metadata_path: "./fastlane/metadata",
      skip_binary_upload: true,
      skip_screenshots: false,
      skip_app_version_update: true
    )
  end
end
```

## Alternative: Manual Process (Current)

For now, the manual process is recommended because:

1. ✅ No API key setup required
2. ✅ More control over submission
3. ✅ Easier to troubleshoot
4. ✅ Can review before submitting

## When to Use API

Use the API when:

- You need to submit multiple apps
- You want CI/CD integration
- You need to automate regular updates
- You're comfortable with API setup

## Current Recommendation

**For this submission, use the manual process** with the automated scripts:

1. Run `./AUTOMATED_SUBMISSION_MASTER.sh`
2. Follow the checklist
3. Submit manually in App Store Connect

This gives you the best of both worlds:
- ✅ Automated verification
- ✅ Automated URL checking
- ✅ Automated content generation
- ✅ Manual review before submission

---

**Note:** API automation can be added later if needed for future submissions.

