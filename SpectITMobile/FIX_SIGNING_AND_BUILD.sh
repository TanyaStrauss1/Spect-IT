#!/bin/bash

# Fix Signing and Build iOS App
# This script guides you through fixing signing, then builds

set -e

cd "$(dirname "$0")"

echo ""
echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║     🔧 FIX SIGNING & BUILD iOS APP                                      ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Step 1: Open Xcode
echo "1️⃣  Opening Xcode..."
open ios/SpectIT.xcworkspace

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⚠️  IMPORTANT: Fix signing in Xcode first!"
echo ""
echo "📋 IN XCODE, DO THIS:"
echo ""
echo "   1. Click the project (blue icon) in the left sidebar"
echo "   2. Select 'SpectIT' target"
echo "   3. Click 'Signing & Capabilities' tab"
echo "   4. ✅ CHECK 'Automatically manage signing'"
echo "   5. Under 'Team', click dropdown:"
echo "      → If 'Tanya Strauss (P7BPRR2MY3)' is listed, select it"
echo "      → If not listed, click 'Add Account...'"
echo "   6. Sign in with: tanstrauss@gmail.com"
echo "   7. Password: (your Apple ID password)"
echo "   8. Select Team: 'Tanya Strauss (P7BPRR2MY3)'"
echo "   9. Wait for Xcode to create provisioning profile (green checkmark)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
read -p "   Press Enter after you've fixed signing in Xcode and see a green checkmark..."

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 2: Clean
echo "2️⃣  Cleaning build artifacts..."
rm -rf build/
rm -rf ios/build/
rm -rf ~/Library/Developer/Xcode/DerivedData/SpectIT-* 2>/dev/null || true
echo "   ✅ Cleaned"
echo ""

# Step 3: Build
echo "3️⃣  Building archive..."
echo "   ⏱️  This will take 5-15 minutes..."
echo ""

mkdir -p build

xcodebuild archive \
  -workspace ios/SpectIT.xcworkspace \
  -scheme SpectIT \
  -configuration Release \
  -archivePath build/SpectIT.xcarchive \
  -allowProvisioningUpdates \
  CODE_SIGN_STYLE=Automatic \
  DEVELOPMENT_TEAM=P7BPRR2MY3 \
  2>&1 | tee build.log

if [ $? -eq 0 ] && [ -d "build/SpectIT.xcarchive" ]; then
    echo ""
    echo "✅ BUILD SUCCEEDED!"
    echo ""
    echo "📦 Archive created: build/SpectIT.xcarchive"
    echo ""
    echo "📋 Next: Upload to App Store Connect"
    echo ""
    echo "   Option 1: Use Xcode Organizer"
    echo "   → Window → Organizer"
    echo "   → Select archive → Distribute App → App Store Connect"
    echo ""
    echo "   Option 2: Use Transporter app"
    echo "   → Export IPA from archive"
    echo "   → Upload with Transporter"
    echo ""
else
    echo ""
    echo "❌ Build failed. Check build.log for details"
    echo ""
    echo "💡 If signing still fails:"
    echo "   1. Make sure you signed in to Xcode with your Apple ID"
    echo "   2. Verify Team is selected: P7BPRR2MY3"
    echo "   3. Try Product → Clean Build Folder in Xcode"
    echo "   4. Then run this script again"
    exit 1
fi

