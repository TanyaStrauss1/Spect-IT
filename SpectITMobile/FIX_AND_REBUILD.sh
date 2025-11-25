#!/bin/bash

# Fix Signing Issues and Rebuild
# This fixes authentication and provisioning issues, then rebuilds

set -e

cd "$(dirname "$0")"

echo ""
echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║     🔧 FIX SIGNING & REBUILD - COMPLETE SOLUTION                         ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Step 1: Fix Xcode Signing Configuration
echo "1️⃣  FIXING XCODE SIGNING CONFIGURATION..."
echo ""

# Open Xcode to fix signing manually (most reliable)
echo "   📱 Opening Xcode to configure signing..."
open ios/SpectIT.xcworkspace

echo ""
echo "   ⚠️  IMPORTANT: Fix signing in Xcode first!"
echo ""
echo "   In Xcode:"
echo "   1. Click project (blue icon) → Select 'SpectIT' target"
echo "   2. Go to 'Signing & Capabilities' tab"
echo "   3. ✅ CHECK 'Automatically manage signing'"
echo "   4. Under 'Team', click 'Add Account...' if needed"
echo "   5. Sign in with: tanstrauss@gmail.com"
echo "   6. Password: (your password or app-specific password)"
echo "   7. Select Team: 'Tanya Strauss (P7BPRR2MY3)'"
echo "   8. Wait for Xcode to create provisioning profile"
echo ""
read -p "   Press Enter after you've fixed signing in Xcode..."

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 2: Clean
echo "2️⃣  CLEANING BUILD ARTIFACTS..."
echo ""

rm -rf build/
rm -rf ios/build/
rm -rf ~/Library/Developer/Xcode/DerivedData/SpectIT-* 2>/dev/null || true
echo "   ✅ Cleaned"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 3: Rebuild
echo "3️⃣  REBUILDING..."
echo ""

mkdir -p build

echo "   📦 Building archive..."
echo "   ⏱️  This will take 5-15 minutes..."
echo ""

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
    echo "   → Select archive → Distribute App"
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
    echo "   2. Verify Team is selected in Signing & Capabilities"
    echo "   3. Try Product → Clean Build Folder in Xcode"
    echo "   4. Then run this script again"
    exit 1
fi

