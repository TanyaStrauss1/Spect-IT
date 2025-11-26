#!/bin/bash

# Upload App to TestFlight
# Complete workflow for TestFlight submission

set -e

cd "$(dirname "$0")"

echo ""
echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║     🚀 UPLOAD TO TESTFLIGHT                                              ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Step 1: Verify setup
echo "1️⃣  VERIFYING SETUP..."
echo ""

if [ ! -d "ios" ]; then
    echo "   ❌ iOS folder not found. Run: npx expo prebuild --platform ios"
    exit 1
fi

if [ ! -f "ios/SpectIT.xcworkspace" ]; then
    echo "   ⚠️  Workspace not found. Installing pods..."
    cd ios
    pod install
    cd ..
fi

echo "   ✅ Setup verified"
echo ""

# Step 2: Clean
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
echo "   5. Wait for green checkmark ✅"
echo ""
echo "STEP 2: Select Target"
echo "   1. Top toolbar → Select 'Any iOS Device' (NOT simulator)"
echo "   2. Scheme: 'SpectIT'"
echo ""
echo "STEP 3: Archive"
echo "   1. Product → Archive"
echo "   2. Wait 5-15 minutes for build"
echo ""
echo "STEP 4: Distribute to TestFlight"
echo "   1. Window → Organizer (or Product → Archive → Distribute App)"
echo "   2. Select your archive"
echo "   3. Click 'Distribute App'"
echo "   4. Choose 'App Store Connect'"
echo "   5. Click 'Next'"
echo "   6. Choose 'Upload' (not Export)"
echo "   7. Click 'Next'"
echo "   8. Select 'Automatically manage signing'"
echo "   9. Click 'Next'"
echo "   10. Review summary"
echo "   11. Click 'Upload'"
echo "   12. Wait for upload (5-10 minutes)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📱 AFTER UPLOAD:"
echo ""
echo "   1. Go to TestFlight:"
echo "      https://appstoreconnect.apple.com/teams/c5c5f5d2-8ebe-443d-957f-b4038c7db237/apps/6755681856/testflight"
echo ""
echo "   2. Wait for processing (15-30 minutes)"
echo "      → Status: 'Processing' → 'Ready to Test'"
echo ""
echo "   3. Add testers (optional):"
echo "      → Internal Testers: Up to 100 users"
echo "      → External Testers: Up to 10,000 users (requires review)"
echo ""
echo "   4. Distribute build to testers"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ XCODE IS NOW OPEN - FOLLOW THE STEPS ABOVE!"
echo ""

