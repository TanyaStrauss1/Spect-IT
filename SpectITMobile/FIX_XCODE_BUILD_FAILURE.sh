#!/bin/bash

# Fix Xcode Build Failure
# Comprehensive fix for common Xcode build issues

set -e

cd "$(dirname "$0")"

echo "🔧 Fixing Xcode Build Failure"
echo "=============================="
echo ""

# Step 1: Clean build artifacts
echo "1️⃣  Cleaning build artifacts..."
if [ -d "ios/build" ]; then
    rm -rf ios/build
    echo "   ✅ Removed ios/build"
fi

if [ -d "build" ]; then
    rm -rf build
    echo "   ✅ Removed build"
fi

# Clean derived data
DERIVED_DATA="$HOME/Library/Developer/Xcode/DerivedData"
if [ -d "$DERIVED_DATA" ]; then
    find "$DERIVED_DATA" -name "SpectIT-*" -type d -exec rm -rf {} + 2>/dev/null || true
    echo "   ✅ Cleaned derived data"
fi
echo ""

# Step 2: Verify CocoaPods
echo "2️⃣  Verifying CocoaPods..."
if [ -f "ios/Podfile" ]; then
    cd ios
    if [ ! -d "Pods" ] || [ ! -f "Pods/Target Support Files/Pods-SpectIT/Pods-SpectIT.release.xcconfig" ]; then
        echo "   ⚠️  CocoaPods not installed, installing..."
        pod install --repo-update
        echo "   ✅ CocoaPods installed"
    else
        echo "   ✅ CocoaPods already installed"
    fi
    cd ..
else
    echo "   ⚠️  Podfile not found"
fi
echo ""

# Step 3: Verify project settings
echo "3️⃣  Verifying project settings..."
if grep -q "DEVELOPMENT_TEAM = P7BPRR2MY3" ios/SpectIT.xcodeproj/project.pbxproj; then
    echo "   ✅ Team ID correct"
else
    echo "   ❌ Team ID incorrect"
fi

if grep -q "CODE_SIGN_STYLE = Automatic" ios/SpectIT.xcodeproj/project.pbxproj; then
    echo "   ✅ Code signing: Automatic"
else
    echo "   ❌ Code signing not Automatic"
fi

if grep -q "PRODUCT_BUNDLE_IDENTIFIER = com.spectit.app" ios/SpectIT.xcodeproj/project.pbxproj; then
    echo "   ✅ Bundle ID correct"
else
    echo "   ❌ Bundle ID incorrect"
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
    echo "   ✅ Entitlements file exists"
else
    echo "   ⚠️  Entitlements file missing"
fi

# Check scheme
if [ -f "ios/SpectIT.xcodeproj/xcshareddata/xcschemes/SpectIT.xcscheme" ]; then
    echo "   ✅ Scheme exists"
else
    echo "   ❌ Scheme missing"
fi
echo ""

# Step 5: Verify workspace
echo "5️⃣  Verifying workspace..."
if [ -f "ios/SpectIT.xcworkspace/contents.xcworkspacedata" ]; then
    echo "   ✅ Workspace exists"
    if grep -q "SpectIT.xcodeproj" ios/SpectIT.xcworkspace/contents.xcworkspacedata; then
        echo "   ✅ Workspace references project correctly"
    else
        echo "   ⚠️  Workspace may need update"
    fi
else
    echo "   ❌ Workspace missing"
fi
echo ""

echo "================================"
echo "✅ Build Fix Complete"
echo ""
echo "📋 Next Steps:"
echo "   1. Open Xcode: open ios/SpectIT.xcworkspace"
echo "   2. Product → Clean Build Folder (Cmd+Shift+K)"
echo "   3. Product → Archive"
echo ""
echo "💡 If build still fails:"
echo "   - Check Xcode console for exact error"
echo "   - Verify signing in Signing & Capabilities"
echo "   - Check build logs in Xcode"
echo ""
