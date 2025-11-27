#!/bin/bash

# Fix Build Failure - Comprehensive Fix
# This script fixes the most common build failures

set -e

cd "$(dirname "$0")"

echo "🔧 Fixing Build Failure"
echo "========================"
echo ""

# Step 1: Clean everything
echo "1️⃣  Cleaning build artifacts..."
rm -rf ios/build 2>/dev/null || true
rm -rf build 2>/dev/null || true
rm -rf ~/Library/Developer/Xcode/DerivedData/SpectIT-* 2>/dev/null || true
rm -rf ~/Library/Developer/Xcode/DerivedData/Spect-* 2>/dev/null || true
echo "   ✅ Cleaned"
echo ""

# Step 2: Verify CocoaPods
echo "2️⃣  Verifying CocoaPods..."
cd ios
if [ ! -f "Pods/Target Support Files/Pods-SpectIT/Pods-SpectIT.release.xcconfig" ]; then
    echo "   ⚠️  CocoaPods not installed, installing..."
    export LANG=en_US.UTF-8
    export LC_ALL=en_US.UTF-8
    pod install
    echo "   ✅ CocoaPods installed"
else
    echo "   ✅ CocoaPods installed"
fi
cd ..
echo ""

# Step 3: Verify project settings
echo "3️⃣  Verifying project settings..."
if grep -q "DEVELOPMENT_TEAM = P7BPRR2MY3" ios/SpectIT.xcodeproj/project.pbxproj; then
    echo "   ✅ Team ID: P7BPRR2MY3"
else
    echo "   ❌ Team ID incorrect"
fi

if grep -q "PRODUCT_BUNDLE_IDENTIFIER = com.spectit.app" ios/SpectIT.xcodeproj/project.pbxproj; then
    echo "   ✅ Bundle ID: com.spectit.app"
else
    echo "   ❌ Bundle ID incorrect"
fi

if grep -q "CODE_SIGN_STYLE = Automatic" ios/SpectIT.xcodeproj/project.pbxproj; then
    echo "   ✅ Code Signing: Automatic"
else
    echo "   ❌ Code Signing not Automatic"
fi
echo ""

# Step 4: Check for common issues
echo "4️⃣  Checking for common issues..."

# Check Info.plist
if [ -f "ios/SpectIT/Info.plist" ]; then
    echo "   ✅ Info.plist exists"
else
    echo "   ❌ Info.plist missing"
fi

# Check entitlements
if [ -f "ios/SpectIT/SpectIT.entitlements" ]; then
    if grep -q "production" ios/SpectIT/SpectIT.entitlements; then
        echo "   ✅ Entitlements: production"
    else
        echo "   ⚠️  Entitlements may need update"
    fi
else
    echo "   ⚠️  Entitlements file missing"
fi

# Check workspace
if [ -f "ios/SpectIT.xcworkspace/contents.xcworkspacedata" ]; then
    echo "   ✅ Workspace exists"
else
    echo "   ❌ Workspace missing"
fi
echo ""

echo "================================"
echo "✅ Fix Complete"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Open Xcode:"
echo "   open ios/SpectIT.xcworkspace"
echo ""
echo "2. In Xcode:"
echo "   → Project → Target → Signing & Capabilities"
echo "   → ✅ Check 'Automatically manage signing'"
echo "   → Team: P7BPRR2MY3"
echo "   → Wait for green checkmark ✅"
echo ""
echo "3. Select 'Any iOS Device' (not simulator)"
echo ""
echo "4. Product → Clean Build Folder (⌘⇧K)"
echo ""
echo "5. Product → Archive"
echo ""
echo "💡 If build still fails:"
echo "   → Check Xcode console for exact error"
echo "   → View → Debug Area → Activate Console (⌘⇧Y)"
echo "   → Look for red error messages"
echo ""

