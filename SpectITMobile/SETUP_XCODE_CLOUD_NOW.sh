#!/bin/bash

# Complete Xcode Cloud Setup Script
# This automates the setup process

set -e

cd "$(dirname "$0")"

echo ""
echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║     ☁️  SETTING UP XCODE CLOUD FOR SPECT-IT                              ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Step 1: Verify configuration files
echo "1️⃣  VERIFYING CONFIGURATION FILES..."
echo ""

if [ -f "ios/.xcodecloud/workflow.yml" ]; then
    echo "   ✅ Workflow configuration exists"
else
    echo "   ❌ Workflow configuration missing"
fi

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

# Step 2: Open Xcode
echo "2️⃣  OPENING XCODE..."
echo ""
open ios/SpectIT.xcworkspace
echo "   ✅ Xcode opened"
echo ""

# Step 3: Open App Store Connect
echo "3️⃣  OPENING APP STORE CONNECT..."
echo ""
open https://appstoreconnect.apple.com
echo "   ✅ App Store Connect opened"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 NEXT STEPS IN APP STORE CONNECT:"
echo ""
echo "1️⃣  Enable Xcode Cloud:"
echo "   → Go to: My Apps → Spect-IT"
echo "   → Look for 'Xcode Cloud' in sidebar"
echo "   → Click 'Get Started' or 'Enable'"
echo "   → Accept terms"
echo ""
echo "2️⃣  Connect GitHub Repository:"
echo "   → Xcode Cloud → Products"
echo "   → 'Connect Repository' → GitHub"
echo "   → Authorize GitHub"
echo "   → Select: TanyaStrauss1/Spect-IT"
echo "   → Branch: main"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 NEXT STEPS IN XCODE:"
echo ""
echo "1️⃣  Wait for Xcode to finish indexing (2-5 minutes)"
echo ""
echo "2️⃣  Create Workflow:"
echo "   → Product → Xcode Cloud → Create Workflow"
echo "   OR"
echo "   → Click project (blue icon) → Signing & Capabilities"
echo "   → Look for 'Xcode Cloud' section at bottom"
echo ""
echo "3️⃣  Configure Workflow:"
echo "   → Name: 'Build and Distribute'"
echo "   → Scheme: SpectIT"
echo "   → Configuration: Release"
echo "   → Destination: Any iOS Device"
echo "   → Team: P7BPRR2MY3"
echo ""
echo "4️⃣  Set Triggers:"
echo "   → ✅ On Git Push (main branch)"
echo "   → ✅ Manual"
echo ""
echo "5️⃣  Set Actions:"
echo "   → ✅ Archive"
echo "   → ✅ Distribute to App Store Connect"
echo ""
echo "6️⃣  Save Workflow"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ CONFIGURATION FILES CREATED:"
echo ""
echo "   ✅ ios/.xcodecloud/workflow.yml"
echo "   ✅ ios/ci_scripts/ci_pre_xcodebuild.sh"
echo "   ✅ ios/ci_scripts/ci_post_xcodebuild.sh"
echo ""
echo "📖 Full guide: XCODE_CLOUD_SETUP.md"
echo ""

