#!/bin/bash

# Complete Xcode Cloud Setup - Automated Steps

set -e

cd "$(dirname "$0")"

echo ""
echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║     ☁️  COMPLETE XCODE CLOUD SETUP - AUTOMATED                           ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Step 1: Verify prerequisites
echo "1️⃣  Verifying prerequisites..."
echo ""

# Check Xcode
if ! command -v xcodebuild &> /dev/null; then
    echo "❌ Xcode not found"
    exit 1
fi

XCODE_VERSION=$(xcodebuild -version 2>&1 | head -1 | awk '{print $2}')
echo "   ✅ Xcode $XCODE_VERSION found"

# Check workspace
if [ ! -d "ios/SpectIT.xcworkspace" ]; then
    echo "❌ Xcode workspace not found"
    exit 1
fi
echo "   ✅ Xcode workspace found"

# Check Git
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Not a Git repository"
    exit 1
fi
echo "   ✅ Git repository found"

# Check if on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ] && [ "$CURRENT_BRANCH" != "master" ]; then
    echo "   ⚠️  Not on main branch (currently on: $CURRENT_BRANCH)"
    echo "   💡 Xcode Cloud typically uses main/master branch"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 2: Create Xcode Cloud configuration directory
echo "2️⃣  Creating Xcode Cloud configuration..."
echo ""

CLOUD_DIR="ios/.xcodecloud"
mkdir -p "$CLOUD_DIR"
echo "   ✅ Created: $CLOUD_DIR"

# Step 3: Create workflow configuration file
echo ""
echo "3️⃣  Creating workflow configuration..."
echo ""

cat > "$CLOUD_DIR/workflow.yml" << 'EOF'
# Xcode Cloud Workflow Configuration
# This file helps Xcode Cloud understand your project structure

name: Build and Distribute Spect-IT
scheme: SpectIT
configuration: Release
destination: generic/platform=iOS
team_id: P7BPRR2MY3
bundle_id: com.spectit.app

# Build actions
actions:
  - archive
  - distribute

# Triggers
triggers:
  - type: git_push
    branch: main
  - type: manual
EOF

echo "   ✅ Created workflow configuration"

# Step 4: Verify project settings
echo ""
echo "4️⃣  Verifying project settings..."
echo ""

# Check bundle ID in project
BUNDLE_ID=$(grep -A 5 "PRODUCT_BUNDLE_IDENTIFIER" ios/SpectIT.xcodeproj/project.pbxproj | grep -o "com\.spectit\.app" | head -1 || echo "")
if [ -n "$BUNDLE_ID" ]; then
    echo "   ✅ Bundle ID: $BUNDLE_ID"
else
    echo "   ⚠️  Bundle ID not found in project (should be: com.spectit.app)"
fi

# Check team ID
TEAM_ID=$(grep -A 5 "DEVELOPMENT_TEAM" ios/SpectIT.xcodeproj/project.pbxproj | grep -o "P7BPRR2MY3" | head -1 || echo "")
if [ -n "$TEAM_ID" ]; then
    echo "   ✅ Team ID: $TEAM_ID"
else
    echo "   ⚠️  Team ID not found in project (should be: P7BPRR2MY3)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 5: Create CI script (if needed)
echo "5️⃣  Creating CI scripts directory..."
echo ""

CI_SCRIPTS_DIR="ios/ci_scripts"
mkdir -p "$CI_SCRIPTS_DIR"
echo "   ✅ Created: $CI_SCRIPTS_DIR"

# Create pre-build script
cat > "$CI_SCRIPTS_DIR/ci_pre_xcodebuild.sh" << 'EOF'
#!/bin/bash
# Pre-build script for Xcode Cloud
# This runs before the build starts

set -e

echo "🚀 Xcode Cloud Pre-Build Script"
echo ""

# Install dependencies if needed
if [ -f "package.json" ]; then
    echo "📦 Installing npm dependencies..."
    npm install
fi

# Install CocoaPods if needed
if [ -f "ios/Podfile" ]; then
    echo "📦 Installing CocoaPods dependencies..."
    cd ios
    pod install
    cd ..
fi

echo "✅ Pre-build complete"
EOF

chmod +x "$CI_SCRIPTS_DIR/ci_pre_xcodebuild.sh"
echo "   ✅ Created pre-build script"

# Create post-build script
cat > "$CI_SCRIPTS_DIR/ci_post_xcodebuild.sh" << 'EOF'
#!/bin/bash
# Post-build script for Xcode Cloud
# This runs after the build completes

set -e

echo "✅ Xcode Cloud Post-Build Script"
echo ""
echo "Build completed successfully!"
echo ""

# You can add post-build actions here, such as:
# - Uploading test results
# - Sending notifications
# - Running additional tests

echo "✅ Post-build complete"
EOF

chmod +x "$CI_SCRIPTS_DIR/ci_post_xcodebuild.sh"
echo "   ✅ Created post-build script"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 6: Open Xcode
echo "6️⃣  Opening Xcode for workflow creation..."
echo ""

open ios/SpectIT.xcworkspace
echo "   ✅ Xcode opening..."
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 MANUAL STEPS IN APP STORE CONNECT:"
echo ""
echo "1️⃣  Enable Xcode Cloud:"
echo "   → https://appstoreconnect.apple.com"
echo "   → Sign in: tanstrauss@gmail.com"
echo "   → My Apps → Spect-IT"
echo "   → Enable Xcode Cloud (if not already enabled)"
echo ""
echo "2️⃣  Connect GitHub Repository:"
echo "   → Xcode Cloud → Products"
echo "   → Connect Repository → GitHub"
echo "   → Select: TanyaStrauss1/Spect-IT"
echo "   → Branch: main"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 MANUAL STEPS IN XCODE:"
echo ""
echo "1️⃣  Wait for Xcode to finish indexing (2-5 minutes)"
echo ""
echo "2️⃣  Create Workflow:"
echo "   → Product → Xcode Cloud → Create Workflow"
echo "   OR"
echo "   → Click project (blue icon) → Signing & Capabilities"
echo "   → Look for 'Xcode Cloud' section"
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
echo "✅ AUTOMATED SETUP COMPLETE!"
echo ""
echo "📁 Created files:"
echo "   - ios/.xcodecloud/workflow.yml"
echo "   - ios/ci_scripts/ci_pre_xcodebuild.sh"
echo "   - ios/ci_scripts/ci_post_xcodebuild.sh"
echo ""
echo "🔗 Next: Complete manual steps in App Store Connect and Xcode"
echo ""
echo "📖 Full guide: XCODE_CLOUD_SETUP.md"
echo ""

