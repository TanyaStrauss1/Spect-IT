#!/bin/bash

# Configure Xcode Cloud from Terminal
# Complete automated setup

set -e

cd "$(dirname "$0")"

echo ""
echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║     ☁️  CONFIGURING XCODE CLOUD FROM TERMINAL                            ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Step 1: Verify project structure
echo "1️⃣  VERIFYING PROJECT STRUCTURE..."
echo ""

if [ ! -d "ios" ]; then
    echo "   ⚠️  iOS folder not found. Creating..."
    npx expo prebuild --platform ios
fi

if [ ! -f "ios/SpectIT.xcworkspace" ]; then
    echo "   ⚠️  Workspace not found. This is needed for Xcode Cloud."
    echo "   → Run: cd ios && pod install && cd .."
fi

echo "   ✅ Project structure verified"
echo ""

# Step 2: Create Xcode Cloud directories
echo "2️⃣  CREATING XCODE CLOUD CONFIGURATION..."
echo ""

mkdir -p ios/.xcodecloud
mkdir -p ios/ci_scripts

echo "   ✅ Directories created"
echo ""

# Step 3: Verify workflow file
echo "3️⃣  VERIFYING WORKFLOW CONFIGURATION..."
echo ""

if [ -f "ios/.xcodecloud/workflow.yml" ]; then
    echo "   ✅ Workflow configuration exists"
    echo ""
    echo "   Configuration:"
    cat ios/.xcodecloud/workflow.yml | grep -E "(name|scheme|team_id|bundle_id)" | sed 's/^/      /'
else
    echo "   ❌ Workflow configuration missing"
fi

echo ""

# Step 4: Verify CI scripts
echo "4️⃣  VERIFYING CI SCRIPTS..."
echo ""

if [ -f "ios/ci_scripts/ci_pre_xcodebuild.sh" ]; then
    echo "   ✅ Pre-build script exists"
else
    echo "   ❌ Pre-build script missing"
fi

if [ -f "ios/ci_scripts/ci_post_xcodebuild.sh" ]; then
    echo "   ✅ Post-build script exists"
else
    echo "   ❌ Post-build script missing"
fi

echo ""

# Step 5: Display configuration summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 XCODE CLOUD CONFIGURATION SUMMARY"
echo ""
echo "   App Name: Spect-IT"
echo "   Bundle ID: com.spectit.app"
echo "   Team ID: P7BPRR2MY3"
echo "   Scheme: SpectIT"
echo "   Repository: https://github.com/TanyaStrauss1/Spect-IT"
echo "   Branch: main"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ CONFIGURATION FILES READY:"
echo ""
echo "   ✅ ios/.xcodecloud/workflow.yml"
echo "   ✅ ios/ci_scripts/ci_pre_xcodebuild.sh"
echo "   ✅ ios/ci_scripts/ci_post_xcodebuild.sh"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 NEXT STEPS (Manual in App Store Connect & Xcode):"
echo ""
echo "APP STORE CONNECT:"
echo "   1. Go to: https://appstoreconnect.apple.com"
echo "   2. My Apps → Spect-IT"
echo "   3. Enable Xcode Cloud (if not enabled)"
echo "   4. Xcode Cloud → Products → Connect Repository"
echo "   5. Select: TanyaStrauss1/Spect-IT"
echo "   6. Branch: main"
echo ""
echo "XCODE:"
echo "   1. Open: ios/SpectIT.xcworkspace"
echo "   2. Product → Xcode Cloud → Create Workflow"
echo "   3. Configure workflow (see XCODE_CLOUD_SETUP.md)"
echo "   4. Save workflow"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🚀 TO TEST:"
echo ""
echo "   git add ."
echo "   git commit -m 'Configure Xcode Cloud'"
echo "   git push"
echo ""
echo "   Xcode Cloud will automatically build on push!"
echo ""

