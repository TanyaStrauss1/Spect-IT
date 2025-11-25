#!/bin/bash

# Setup Xcode Cloud for Spect-IT iOS App

set -e

cd "$(dirname "$0")"

echo ""
echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║          ☁️  XCODE CLOUD SETUP FOR SPECT-IT                               ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

echo "📋 Prerequisites Check:"
echo ""

# Check Xcode version
XCODE_VERSION=$(xcodebuild -version 2>&1 | head -1 | awk '{print $2}')
echo "   Xcode Version: $XCODE_VERSION"
if [[ $(echo "$XCODE_VERSION 13.0" | awk '{print ($1 >= $2)}') == 1 ]]; then
    echo "   ✅ Xcode version supports Xcode Cloud"
else
    echo "   ⚠️  Xcode 13+ required for Xcode Cloud"
fi

# Check if project exists
if [ -d "ios/SpectIT.xcworkspace" ]; then
    echo "   ✅ Xcode workspace found"
else
    echo "   ❌ Xcode workspace not found"
    echo "   Run: npx expo prebuild --platform ios"
    exit 1
fi

# Check Git repository
if git rev-parse --git-dir > /dev/null 2>&1; then
    REMOTE_URL=$(git remote get-url origin 2>/dev/null || echo "Not set")
    echo "   ✅ Git repository found"
    echo "   Remote: $REMOTE_URL"
else
    echo "   ⚠️  Not a Git repository"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 SETUP STEPS:"
echo ""
echo "1️⃣  Enable Xcode Cloud in App Store Connect:"
echo ""
echo "   → Go to: https://appstoreconnect.apple.com"
echo "   → Sign in: tanstrauss@gmail.com"
echo "   → My Apps → Spect-IT"
echo "   → Enable Xcode Cloud"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "2️⃣  Connect GitHub Repository:"
echo ""
echo "   → App Store Connect → Xcode Cloud → Products"
echo "   → Connect Repository → GitHub"
echo "   → Select: TanyaStrauss1/Spect-IT"
echo "   → Branch: main"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "3️⃣  Create Workflow in Xcode:"
echo ""
echo "   Opening Xcode..."
echo ""

# Open Xcode
open ios/SpectIT.xcworkspace

echo "   ✅ Xcode opening..."
echo ""
echo "   In Xcode:"
echo "   1. Wait for indexing (2-5 minutes)"
echo "   2. Click project (blue icon) → Signing & Capabilities"
echo "   3. Look for 'Xcode Cloud' section"
echo "   4. Or: Product → Xcode Cloud → Create Workflow"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "4️⃣  Configure Workflow:"
echo ""
echo "   Workflow Name: 'Build and Distribute'"
echo "   Triggers:"
echo "   - ✅ On Git Push (main branch)"
echo "   - ✅ Manual"
echo ""
echo "   Actions:"
echo "   - Archive"
echo "   - Distribute to App Store Connect"
echo ""
echo "   Settings:"
echo "   - Scheme: SpectIT"
echo "   - Configuration: Release"
echo "   - Team: P7BPRR2MY3"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "5️⃣  Start First Build:"
echo ""
echo "   Option A - Automatic (after push):"
echo "   git add ."
echo "   git commit -m 'Enable Xcode Cloud'"
echo "   git push"
echo ""
echo "   Option B - Manual:"
echo "   Product → Xcode Cloud → Start Build"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📖 Full guide: XCODE_CLOUD_SETUP.md"
echo ""
echo "🔗 App Store Connect: https://appstoreconnect.apple.com/apps/6755681856"
echo ""
echo "✅ Setup steps displayed. Follow the guide above!"
echo ""

