#!/bin/bash

# Complete Fix for Xcode Build Failure
# Fixes encoding issues and common build problems

set -e

cd "$(dirname "$0")"

echo "🔧 Complete Xcode Build Fix"
echo "==========================="
echo ""

# Fix encoding for CocoaPods
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8

# Step 1: Clean everything
echo "1️⃣  Cleaning build artifacts..."
rm -rf ~/Library/Developer/Xcode/DerivedData/SpectIT-*
rm -rf ~/Library/Developer/Xcode/DerivedData/Spect-*
rm -rf ios/build
rm -rf build
echo "   ✅ Cleaned"
echo ""

# Step 2: Reinstall CocoaPods with proper encoding
echo "2️⃣  Reinstalling CocoaPods dependencies..."
cd ios

# Remove old pods if they exist
if [ -d "Pods" ]; then
    rm -rf Pods
    echo "   ✅ Removed old Pods"
fi

if [ -f "Podfile.lock" ]; then
    rm -f Podfile.lock
    echo "   ✅ Removed Podfile.lock"
fi

# Install with proper encoding
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8
pod install --repo-update 2>&1 | tail -5
echo "   ✅ CocoaPods installed"
cd ..
echo ""

# Step 3: Verify configuration
echo "3️⃣  Verifying configuration..."
if grep -q "DEVELOPMENT_TEAM = P7BPRR2MY3" ios/SpectIT.xcodeproj/project.pbxproj; then
    echo "   ✅ Team ID: P7BPRR2MY3"
else
    echo "   ❌ Team ID issue"
fi

if grep -q "CODE_SIGN_STYLE = Automatic" ios/SpectIT.xcodeproj/project.pbxproj; then
    echo "   ✅ Code Signing: Automatic"
else
    echo "   ❌ Code Signing issue"
fi
echo ""

echo "==========================="
echo "✅ Build fix complete"
echo ""
echo "📋 Next Steps:"
echo "   1. Open Xcode: open ios/SpectIT.xcworkspace"
echo "   2. Product → Clean Build Folder (Cmd+Shift+K)"
echo "   3. Select 'Any iOS Device' in toolbar"
echo "   4. Product → Archive"
echo ""

