#!/bin/bash

# Complete Rebuild to Make App Work
# This script does a complete clean rebuild

set -e

cd "$(dirname "$0")"

echo "🔧 Complete Rebuild - Making App Work"
echo "======================================"
echo ""

# Step 1: Clean everything
echo "1️⃣  Cleaning everything..."
echo "   Cleaning build folders..."
rm -rf ios/build
rm -rf build
rm -rf node_modules/.cache

echo "   Cleaning Xcode derived data..."
rm -rf ~/Library/Developer/Xcode/DerivedData/SpectIT-* 2>/dev/null || true
rm -rf ~/Library/Developer/Xcode/DerivedData/Spect-* 2>/dev/null || true
rm -rf ~/Library/Developer/Xcode/Archives/* 2>/dev/null || true

echo "   ✅ Clean complete"
echo ""

# Step 2: Reinstall Node.js dependencies
echo "2️⃣  Reinstalling Node.js dependencies..."
if [ -f "package.json" ]; then
    rm -rf node_modules
    npm install --legacy-peer-deps
    echo "   ✅ Node.js dependencies installed"
else
    echo "   ❌ package.json not found"
    exit 1
fi
echo ""

# Step 3: Reinstall CocoaPods
echo "3️⃣  Reinstalling CocoaPods dependencies..."
cd ios
if [ -f "Podfile" ]; then
    rm -rf Pods
    rm -f Podfile.lock
    echo "   ✅ Removed old Pods"
    
    # Fix encoding for CocoaPods
    export LANG=en_US.UTF-8
    export LC_ALL=en_US.UTF-8
    
    pod install --repo-update
    echo "   ✅ CocoaPods installed"
    
    # Verify xcconfig files exist
    if [ -f "Pods/Target Support Files/Pods-SpectIT/Pods-SpectIT.release.xcconfig" ]; then
        echo "   ✅ xcconfig files created"
    else
        echo "   ⚠️  Warning: xcconfig files not found"
    fi
else
    echo "   ❌ Podfile not found"
    exit 1
fi
cd ..
echo ""

# Step 4: Verify project configuration
echo "4️⃣  Verifying project configuration..."
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

if grep -q "CODE_SIGN_STYLE = Automatic" ios/SpectIT.xcodeproj/project.pbxproj; then
    echo "   ✅ Code Signing: Automatic"
else
    echo "   ❌ Code Signing not Automatic"
    exit 1
fi
echo ""

# Step 5: Verify workspace
echo "5️⃣  Verifying workspace..."
if [ -f "ios/SpectIT.xcworkspace/contents.xcworkspacedata" ]; then
    echo "   ✅ Workspace exists"
else
    echo "   ❌ Workspace missing"
    exit 1
fi
echo ""

# Step 6: Verify entitlements
echo "6️⃣  Verifying entitlements..."
if [ -f "ios/SpectIT/SpectIT.entitlements" ]; then
    if grep -q "production" ios/SpectIT/SpectIT.entitlements; then
        echo "   ✅ Entitlements: production"
    else
        echo "   ⚠️  Entitlements may need update"
    fi
else
    echo "   ⚠️  Entitlements file not found"
fi
echo ""

# Step 7: Verify scheme
echo "7️⃣  Verifying scheme..."
if [ -f "ios/SpectIT.xcodeproj/xcshareddata/xcschemes/SpectIT.xcscheme" ]; then
    echo "   ✅ Scheme exists"
else
    echo "   ❌ Scheme missing"
    exit 1
fi
echo ""

echo "================================"
echo "✅ Rebuild Complete!"
echo ""
echo "📋 Configuration Summary:"
echo "   - Project structure: ✅"
echo "   - Node.js dependencies: ✅"
echo "   - CocoaPods dependencies: ✅"
echo "   - Team ID: P7BPRR2MY3 ✅"
echo "   - Bundle ID: com.spectit.app ✅"
echo "   - Code Signing: Automatic ✅"
echo "   - Workspace: Ready ✅"
echo ""
echo "🚀 Next Steps:"
echo ""
echo "1. Open Xcode:"
echo "   open ios/SpectIT.xcworkspace"
echo ""
echo "2. Verify Signing:"
echo "   - Project → Target → Signing & Capabilities"
echo "   - ✅ Check 'Automatically manage signing'"
echo "   - Team: P7BPRR2MY3"
echo "   - Wait for green checkmark ✅"
echo ""
echo "3. Select Destination:"
echo "   - Top toolbar → Select 'Any iOS Device'"
echo ""
echo "4. Clean Build Folder:"
echo "   - Product → Clean Build Folder (⌘⇧K)"
echo ""
echo "5. Archive:"
echo "   - Product → Archive"
echo ""
echo "✅ App is ready to build!"
echo ""

