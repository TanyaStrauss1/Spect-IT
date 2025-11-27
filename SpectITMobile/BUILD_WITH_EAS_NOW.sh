#!/bin/bash

# Build iOS App with EAS (Expo Application Services)
# This is easier than Xcode Cloud for Expo apps!

set -e

cd "$(dirname "$0")"

echo ""
echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║     🚀 BUILD iOS APP WITH EAS (EXPO APPLICATION SERVICES)               ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Step 1: Check EAS CLI
echo "1️⃣  Checking EAS CLI..."
if ! command -v eas &> /dev/null; then
    echo "   ⚠️  EAS CLI not found. Installing..."
    npm install -g eas-cli
fi
echo "   ✅ EAS CLI ready"
echo ""

# Step 2: Check login
echo "2️⃣  Checking EAS login..."
if ! eas whoami &> /dev/null; then
    echo "   ⚠️  Not logged in to EAS"
    echo ""
    echo "   Please log in:"
    echo "   eas login"
    echo ""
    echo "   Or visit: https://expo.dev/accounts/spect-it/settings/credentials"
    echo ""
    exit 1
fi

CURRENT_USER=$(eas whoami 2>/dev/null || echo "unknown")
echo "   ✅ Logged in as: $CURRENT_USER"
echo ""

# Step 3: Verify credentials
echo "3️⃣  Verifying credentials..."
echo "   📋 Current configuration:"
echo "      - Bundle ID: com.spectit.app"
echo "      - Team ID: P7BPRR2MY3"
echo "      - Profile: production"
echo ""
echo "   💡 To configure credentials:"
echo "      eas credentials"
echo "      → Select: iOS"
echo "      → Select: production"
echo "      → Follow prompts"
echo ""
echo "   Or visit: https://expo.dev/accounts/spect-it/settings/credentials"
echo ""

# Step 4: Build
echo "4️⃣  Starting EAS Build..."
echo ""
echo "   ⏱️  Build time: ~15-30 minutes"
echo "   ☁️  Building in cloud (no local Xcode needed)"
echo "   ✅ Automatic signing and provisioning"
echo "   📦 Will upload to App Store Connect automatically"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Build for iOS App Store
eas build --platform ios --profile production

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ BUILD INITIATED!"
echo ""
echo "📱 MONITOR BUILD:"
echo ""
echo "   → https://expo.dev/accounts/spect-it/projects/spectit-mobile/builds"
echo ""
echo "📋 NEXT STEPS:"
echo ""
echo "   1. Build will complete in ~15-30 minutes"
echo "   2. Build automatically uploads to App Store Connect"
echo "   3. Check App Store Connect for the build"
echo "   4. Submit for App Store review"
echo ""
echo "💡 CONFIGURE CREDENTIALS:"
echo ""
echo "   If build fails due to credentials:"
echo "   → https://expo.dev/accounts/spect-it/settings/credentials"
echo "   → Configure iOS credentials"
echo "   → Use Apple ID: tanstrauss@gmail.com"
echo ""

