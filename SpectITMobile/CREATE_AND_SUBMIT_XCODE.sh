#!/bin/bash

# Create App in Xcode and Submit to App Store
# Complete workflow from Xcode to App Store

set -e

cd "$(dirname "$0")"

echo ""
echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║     🚀 CREATE APP IN XCODE & SUBMIT TO APP STORE                        ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Step 1: Verify iOS project exists
echo "1️⃣  VERIFYING iOS PROJECT..."
echo ""

if [ ! -d "ios" ]; then
    echo "   ⚠️  iOS folder not found. Creating iOS project..."
    npx expo prebuild --platform ios
    echo "   ✅ iOS project created"
else
    echo "   ✅ iOS project exists"
fi

if [ ! -f "ios/SpectIT.xcworkspace" ]; then
    echo "   ⚠️  Workspace not found. Installing pods..."
    cd ios
    pod install
    cd ..
    echo "   ✅ Pods installed"
fi

echo ""

# Step 2: Clean previous builds
echo "2️⃣  CLEANING PREVIOUS BUILDS..."
echo ""

rm -rf build/
rm -rf ios/build/
rm -rf ~/Library/Developer/Xcode/DerivedData/SpectIT-* 2>/dev/null || true
echo "   ✅ Cleaned"

echo ""

# Step 3: Open Xcode
echo "3️⃣  OPENING XCODE..."
echo ""

open ios/SpectIT.xcworkspace

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 IN XCODE, FOLLOW THESE STEPS:"
echo ""
echo "STEP 1: Configure Signing"
echo "   1. Click project (blue icon) → Select 'SpectIT' target"
echo "   2. Go to 'Signing & Capabilities' tab"
echo "   3. ✅ CHECK 'Automatically manage signing'"
echo "   4. Select Team: 'Tanya Strauss (P7BPRR2MY3)'"
echo "   5. Wait for green checkmark (provisioning profile created)"
echo ""
echo "STEP 2: Select Build Target"
echo "   1. At top, select 'Any iOS Device' (not simulator)"
echo "   2. Scheme should be 'SpectIT'"
echo ""
echo "STEP 3: Archive"
echo "   1. Product → Archive"
echo "   2. Wait for archive to complete (5-15 minutes)"
echo ""
echo "STEP 4: Distribute to App Store"
echo "   1. Window → Organizer (or Product → Archive → Distribute App)"
echo "   2. Select your archive"
echo "   3. Click 'Distribute App'"
echo "   4. Choose 'App Store Connect'"
echo "   5. Click 'Next'"
echo "   6. Choose 'Upload'"
echo "   7. Click 'Next'"
echo "   8. Select 'Automatically manage signing'"
echo "   9. Click 'Next'"
echo "   10. Review and click 'Upload'"
echo "   11. Wait for upload to complete"
echo ""
echo "STEP 5: Submit in App Store Connect"
echo "   1. Go to: https://appstoreconnect.apple.com"
echo "   2. Sign in with: tanstrauss@gmail.com"
echo "   3. Go to 'My Apps' → 'Spect-IT'"
echo "   4. Go to 'App Store' tab"
echo "   5. Wait for build to process (15-30 minutes)"
echo "   6. Select the build"
echo "   7. Complete required information (see COMPLETE_SUBMISSION_GUIDE.md)"
echo "   8. Click 'Submit for Review'"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ XCODE IS NOW OPEN"
echo ""
echo "Follow the steps above to build and submit your app!"
echo ""

