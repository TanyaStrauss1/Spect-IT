#!/bin/bash

# Rebuild and Submit Spect-IT App
# Complete workflow for rebuilding and submitting to App Store

set -e

cd "$(dirname "$0")"

echo ""
echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║     🔄 REBUILD AND SUBMIT SPECT-IT                                     ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Step 1: Clean everything
echo "1️⃣  CLEANING PREVIOUS BUILDS..."
echo ""

rm -rf build/ 2>/dev/null || true
rm -rf ios/build/ 2>/dev/null || true
rm -rf ~/Library/Developer/Xcode/DerivedData/SpectIT-* 2>/dev/null || true
rm -rf ~/Library/Developer/Xcode/Archives/* 2>/dev/null || true

echo "   ✅ Cleaned all build artifacts"
echo ""

# Step 2: Verify setup
echo "2️⃣  VERIFYING SETUP..."
echo ""

if [ ! -d "ios" ]; then
    echo "   ❌ iOS folder not found!"
    exit 1
fi

if [ ! -f "ios/SpectIT.xcworkspace/contents.xcworkspacedata" ]; then
    echo "   ⚠️  Workspace not found. Installing pods..."
    cd ios
    pod install
    cd ..
fi

echo "   ✅ Setup verified"
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
echo "STEP 1: Clean Build Folder"
echo "   1. Product → Clean Build Folder (⌘⇧K)"
echo "   2. Wait for clean to complete"
echo ""
echo "STEP 2: Verify Signing"
echo "   1. Click project (blue icon) → Select 'SpectIT' target"
echo "   2. Go to 'Signing & Capabilities' tab"
echo "   3. ✅ CHECK 'Automatically manage signing'"
echo "   4. Select Team: UHMT4AX5T7"
echo "   5. Bundle ID: com.spectit.app"
echo "   6. Wait for green checkmark ✅"
echo ""
echo "STEP 3: Select Target"
echo "   1. Top toolbar → Select 'Any iOS Device' (NOT simulator)"
echo "   2. Scheme: 'SpectIT'"
echo ""
echo "STEP 4: Archive"
echo "   1. Product → Archive"
echo "   2. Wait 5-15 minutes for build"
echo "   3. Organizer window opens automatically"
echo ""
echo "STEP 5: Distribute"
echo "   1. In Organizer, select your archive"
echo "   2. Click 'Distribute App'"
echo "   3. Choose 'App Store Connect'"
echo "   4. Click 'Next'"
echo "   5. Choose 'Upload'"
echo "   6. Click 'Next'"
echo "   7. Select 'Automatically manage signing'"
echo "   8. Click 'Next'"
echo "   9. Review summary"
echo "  10. Click 'Upload'"
echo "  11. Wait for upload (5-10 minutes)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ After upload, check TestFlight:"
echo "   https://appstoreconnect.apple.com/teams/c5c5f5d2-8ebe-443d-957f-b4038c7db237/apps/6755681856/testflight"
echo ""
echo "⏱️  Processing takes 15-30 minutes"
echo ""

