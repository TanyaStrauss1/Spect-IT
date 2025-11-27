#!/bin/bash

# Diagnose Build Failure - Comprehensive Diagnostic
# This script identifies the exact cause of build failures

set -e

cd "$(dirname "$0")"

echo ""
echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║              🔍 DIAGNOSING BUILD FAILURE                                ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Step 1: Check Xcode project
echo "1️⃣  Checking Xcode project..."
if [ -f "ios/SpectIT.xcworkspace/contents.xcworkspacedata" ]; then
    echo "   ✅ Workspace exists"
else
    echo "   ❌ Workspace missing"
    exit 1
fi

if [ -f "ios/SpectIT.xcodeproj/project.pbxproj" ]; then
    echo "   ✅ Project file exists"
else
    echo "   ❌ Project file missing"
    exit 1
fi
echo ""

# Step 2: Check dependencies
echo "2️⃣  Checking dependencies..."

# Node.js
if [ -f "package.json" ]; then
    if [ -d "node_modules" ]; then
        echo "   ✅ Node.js dependencies installed"
    else
        echo "   ❌ Node.js dependencies missing"
        echo "   → Run: npm install"
    fi
else
    echo "   ❌ package.json missing"
fi

# CocoaPods
if [ -d "ios/Pods" ]; then
    if [ -f "ios/Pods/Target Support Files/Pods-SpectIT/Pods-SpectIT.release.xcconfig" ]; then
        echo "   ✅ CocoaPods dependencies installed"
    else
        echo "   ⚠️  CocoaPods xcconfig files missing"
        echo "   → Run: cd ios && pod install"
    fi
else
    echo "   ❌ CocoaPods not installed"
    echo "   → Run: cd ios && pod install"
fi
echo ""

# Step 3: Check configuration
echo "3️⃣  Checking configuration..."

PROJECT_FILE="ios/SpectIT.xcodeproj/project.pbxproj"

# Team ID
if grep -q "DEVELOPMENT_TEAM = P7BPRR2MY3" "$PROJECT_FILE"; then
    echo "   ✅ Team ID: P7BPRR2MY3"
else
    echo "   ❌ Team ID incorrect or missing"
fi

# Bundle ID
if grep -q "PRODUCT_BUNDLE_IDENTIFIER = com.spectit.app" "$PROJECT_FILE"; then
    echo "   ✅ Bundle ID: com.spectit.app"
else
    echo "   ❌ Bundle ID incorrect"
fi

# Code Sign Style
if grep -q "CODE_SIGN_STYLE = Automatic" "$PROJECT_FILE"; then
    echo "   ✅ Code Sign Style: Automatic"
else
    echo "   ❌ Code Sign Style not Automatic"
fi
echo ""

# Step 4: Check critical files
echo "4️⃣  Checking critical files..."

if [ -f "ios/SpectIT/Info.plist" ]; then
    echo "   ✅ Info.plist exists"
else
    echo "   ❌ Info.plist missing"
fi

if [ -f "ios/SpectIT/SpectIT.entitlements" ]; then
    if grep -q "production" ios/SpectIT/SpectIT.entitlements; then
        echo "   ✅ Entitlements: production"
    else
        echo "   ⚠️  Entitlements may need update"
    fi
else
    echo "   ⚠️  Entitlements file missing"
fi

if [ -f "ios/Podfile" ]; then
    echo "   ✅ Podfile exists"
else
    echo "   ❌ Podfile missing"
fi
echo ""

# Step 5: Try to identify specific error
echo "5️⃣  Attempting to identify specific error..."

# Check for common error patterns
if [ -d "ios/build" ]; then
    echo "   ⚠️  Build folder exists (may contain error logs)"
    echo "   → Check: ios/build/*.log files"
fi

# Check Xcode derived data for errors
if [ -d ~/Library/Developer/Xcode/DerivedData ]; then
    echo "   ℹ️  Derived data exists"
    echo "   → Check Xcode console for errors"
fi
echo ""

# Step 6: Test build configuration
echo "6️⃣  Testing build configuration..."
cd ios

# Try to validate project
if xcodebuild -workspace SpectIT.xcworkspace -scheme SpectIT -configuration Release -showBuildSettings > /dev/null 2>&1; then
    echo "   ✅ Build configuration valid"
else
    echo "   ❌ Build configuration invalid"
    echo "   → Run: xcodebuild -workspace SpectIT.xcworkspace -scheme SpectIT -showBuildSettings"
    echo "   → Check output for errors"
fi
cd ..
echo ""

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║                          📋 DIAGNOSIS COMPLETE                           ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""
echo "🔍 NEXT STEPS:"
echo ""
echo "1. Check Xcode Console:"
echo "   → View → Debug Area → Activate Console (⌘⇧Y)"
echo "   → Look for red error messages"
echo "   → Copy exact error text"
echo ""
echo "2. Check Build Log:"
echo "   → View → Navigators → Show Report Navigator (⌘9)"
echo "   → Click on latest build"
echo "   → Look for red errors"
echo ""
echo "3. Run comprehensive fix:"
echo "   ./FIX_ALL_BUILD_ISSUES.sh"
echo ""
echo "4. If specific error found, share:"
echo "   → Exact error message"
echo "   → Which step failed (Build, Archive, Signing)"
echo "   → Screenshot if possible"
echo ""
echo "💡 Most common issues:"
echo "   → Code signing errors → Check Signing & Capabilities in Xcode"
echo "   → Missing dependencies → Run: cd ios && pod install"
echo "   → Build configuration → Run fix script"
echo ""

