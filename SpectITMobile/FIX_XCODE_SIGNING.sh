#!/bin/bash

# Fix Xcode signing to use automatic signing
# This bypasses the device registration requirement

cd /Users/tanyastrauss/Spect-IT/SpectITMobile

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║          🔧 FIX XCODE SIGNING - AUTOMATIC MODE                          ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Check if iOS project exists
if [ ! -d "ios" ]; then
    echo "⚠️  iOS project not found. Generating it..."
    echo ""
    npx expo prebuild --platform ios
    echo ""
fi

# Find workspace or project
WORKSPACE=$(find ios -name "*.xcworkspace" -type d | head -1)
PROJECT=$(find ios -name "*.xcodeproj" -type d | head -1)

if [ -n "$WORKSPACE" ]; then
    XCODE_FILE="$WORKSPACE"
    echo "✅ Found Xcode workspace: $WORKSPACE"
elif [ -n "$PROJECT" ]; then
    XCODE_FILE="$PROJECT"
    echo "✅ Found Xcode project: $PROJECT"
else
    echo "❌ No Xcode project found"
    exit 1
fi

echo ""
echo "🚀 Opening Xcode..."
open "$XCODE_FILE"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 FIX SIGNING IN XCODE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. ⏱️  Wait for Xcode to finish indexing"
echo ""
echo "2. 🔐 Configure Automatic Signing:"
echo "   - Click project name (blue icon) in left sidebar"
echo "   - Select target under TARGETS"
echo "   - Go to 'Signing & Capabilities' tab"
echo "   - ✅ CHECK 'Automatically manage signing'"
echo "   - Team: Select your team (tanstrauss@gmail.com)"
echo "   - Bundle ID: com.spectit.app"
echo ""
echo "3. ✅ Xcode will automatically:"
echo "   - Create provisioning profile"
echo "   - Handle certificates"
echo "   - No device registration needed for App Store builds!"
echo ""
echo "4. 📱 Select Build Target:"
echo "   - In top toolbar, select 'Any iOS Device'"
echo ""
echo "5. 📦 Archive:"
echo "   - Product → Archive"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💡 TIP: For App Store distribution, you don't need a physical device!"
echo "   Xcode can create provisioning profiles automatically."
echo ""

