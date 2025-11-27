#!/bin/bash

# Build in Xcode and Deploy to Cloud (App Store Connect)
# This builds locally in Xcode and uploads to App Store Connect

set -e

cd "$(dirname "$0")"

echo ""
echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║     🍎 BUILD IN XCODE → DEPLOY TO CLOUD (APP STORE CONNECT)             ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Step 1: Verify project
echo "1️⃣  Verifying project..."
if [ ! -f "ios/SpectIT.xcworkspace/contents.xcworkspacedata" ]; then
    echo "   ❌ Workspace not found"
    exit 1
fi
echo "   ✅ Workspace exists"
echo ""

# Step 2: Verify configuration
echo "2️⃣  Verifying configuration..."
if grep -q "DEVELOPMENT_TEAM = P7BPRR2MY3" ios/SpectIT.xcodeproj/project.pbxproj; then
    echo "   ✅ Team ID: P7BPRR2MY3"
else
    echo "   ❌ Team ID incorrect"
    exit 1
fi

if grep -q "PRODUCT_BUNDLE_IDENTIFIER = com.spectit.app" ios/SpectIT.xcodeproj/project.pbxproj; then
    echo "   ✅ Bundle ID: com.spectit.app"
else
    echo "   ❌ Bundle ID incorrect"
    exit 1
fi
echo ""

# Step 3: Open Xcode
echo "3️⃣  Opening Xcode..."
echo "   📁 Opening workspace..."
open ios/SpectIT.xcworkspace

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Xcode is opening..."
echo ""
echo "📋 NEXT STEPS IN XCODE:"
echo ""
echo "1. Wait for Xcode to finish indexing (2-5 minutes)"
echo ""
echo "2. Verify Signing:"
echo "   → Click 'SpectIT' project (blue icon)"
echo "   → Select 'SpectIT' target"
echo "   → Go to 'Signing & Capabilities' tab"
echo "   → ✅ CHECK 'Automatically manage signing'"
echo "   → Team: Select 'Tanya Strauss (P7BPRR2MY3)'"
echo "   → Wait for green checkmark ✅"
echo ""
echo "3. Select Destination:"
echo "   → Top toolbar → Device selector"
echo "   → Select 'Any iOS Device'"
echo "   → ⚠️ NOT a simulator"
echo ""
echo "4. Clean Build Folder:"
echo "   → Product → Clean Build Folder (⌘⇧K)"
echo "   → Wait for clean to complete"
echo ""
echo "5. Archive:"
echo "   → Product → Archive"
echo "   → Wait 5-15 minutes for build"
echo ""
echo "6. Distribute to App Store Connect:"
echo "   → Archive window opens automatically"
echo "   → Click 'Distribute App'"
echo "   → Select 'App Store Connect'"
echo "   → Choose 'Upload'"
echo "   → Follow prompts"
echo "   → App uploads to cloud ✅"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📱 AFTER UPLOAD:"
echo ""
echo "   → Check App Store Connect:"
echo "     https://appstoreconnect.apple.com/apps/6755681856"
echo ""
echo "   → Build appears in TestFlight or App Store tab"
echo ""
echo "   → Submit for App Store review"
echo ""
echo "✅ Follow the steps above in Xcode!"
echo ""

