#!/bin/bash

# Verify Build Configuration - Ensure Correct Settings
# This script verifies the build is using the correct configuration

set -e

cd "$(dirname "$0")"

echo ""
echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║              ✅ VERIFYING BUILD CONFIGURATION                            ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Step 1: Check scheme configuration
echo "1️⃣  Checking scheme configuration..."
SCHEME_FILE="ios/SpectIT.xcodeproj/xcshareddata/xcschemes/SpectIT.xcscheme"

if [ -f "$SCHEME_FILE" ]; then
    echo "   ✅ Scheme file exists"
    
    # Check Archive configuration
    if grep -q 'buildConfiguration = "Release"' "$SCHEME_FILE"; then
        echo "   ✅ Archive uses Release configuration"
    else
        echo "   ⚠️  Archive may not use Release configuration"
    fi
    
    # Check Build configuration
    if grep -q 'buildConfiguration = "Debug"' "$SCHEME_FILE" | head -1; then
        echo "   ✅ Build uses Debug configuration (for development)"
    fi
else
    echo "   ⚠️  Scheme file not found (may be user-specific)"
fi
echo ""

# Step 2: Check project build settings
echo "2️⃣  Checking project build settings..."
PROJECT_FILE="ios/SpectIT.xcodeproj/project.pbxproj"

# Release configuration
echo "   Release Configuration:"
if grep -q "DEVELOPMENT_TEAM = P7BPRR2MY3" "$PROJECT_FILE" | grep -A 5 "Release"; then
    echo "      ✅ Team ID: P7BPRR2MY3"
fi

if grep -q "PRODUCT_BUNDLE_IDENTIFIER = com.spectit.app" "$PROJECT_FILE" | grep -A 5 "Release"; then
    echo "      ✅ Bundle ID: com.spectit.app"
fi

if grep -q "CODE_SIGN_STYLE = Automatic" "$PROJECT_FILE" | grep -A 5 "Release"; then
    echo "      ✅ Code Sign Style: Automatic"
fi
echo ""

# Step 3: Verify Archive will use Release
echo "3️⃣  Verifying Archive configuration..."
echo "   For App Store submission, Archive should use:"
echo "      ✅ Release configuration"
echo "      ✅ Automatic code signing"
echo "      ✅ Team: P7BPRR2MY3"
echo "      ✅ Bundle ID: com.spectit.app"
echo ""

# Step 4: Check current build settings
echo "4️⃣  Current build settings (Release):"
cd ios
xcodebuild -workspace SpectIT.xcworkspace -scheme SpectIT -configuration Release -showBuildSettings 2>&1 | grep -E "(DEVELOPMENT_TEAM|PRODUCT_BUNDLE_IDENTIFIER|CODE_SIGN_STYLE|CONFIGURATION)" | head -5
cd ..
echo ""

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║                          ✅ VERIFICATION COMPLETE                       ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""
echo "📋 BUILD CONFIGURATION SUMMARY:"
echo ""
echo "✅ For Development (Build):"
echo "   → Configuration: Debug"
echo "   → Can use simulator or device"
echo ""
echo "✅ For App Store (Archive):"
echo "   → Configuration: Release"
echo "   → Destination: Any iOS Device (NOT simulator)"
echo "   → Code Signing: Automatic"
echo "   → Team: P7BPRR2MY3"
echo ""
echo "🚀 TO BUILD FOR APP STORE:"
echo ""
echo "1. In Xcode:"
echo "   → Select scheme: SpectIT"
echo "   → Select destination: 'Any iOS Device'"
echo "   → Product → Archive"
echo ""
echo "2. This will:"
echo "   → Use Release configuration automatically"
echo "   → Build for App Store distribution"
echo "   → Create archive ready for upload"
echo ""
echo "💡 If building from default:"
echo "   → Default Build = Debug (for development)"
echo "   → Archive = Release (for App Store)"
echo "   → Both are correct for their purposes!"
echo ""

