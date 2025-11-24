#!/bin/bash

# Build and Upload App from Xcode
# This script prepares and opens Xcode for building and uploading

cd /Users/tanyastrauss/Spect-IT/SpectITMobile

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║          🍎 BUILD & UPLOAD APP FROM XCODE                               ║"
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
    echo "Generating iOS project..."
    npx expo prebuild --platform ios
    XCODE_FILE=$(find ios -name "*.xcworkspace" -o -name "*.xcodeproj" | head -1)
fi

echo ""
echo "🚀 Opening Xcode..."
open "$XCODE_FILE"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 STEPS IN XCODE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. ⏱️  Wait for Xcode to finish indexing (2-5 minutes)"
echo ""
echo "2. 🔐 Configure Signing:"
echo "   - Click project name (blue icon) in left sidebar"
echo "   - Select target under TARGETS"
echo "   - Go to 'Signing & Capabilities' tab"
echo "   - Team: Select your team (or add: tanstrauss@gmail.com)"
echo "   - Bundle ID: com.spectit.app"
echo ""
echo "3. 📱 Select Build Target:"
echo "   - In top toolbar, select 'Any iOS Device' (NOT simulator)"
echo ""
echo "4. 📦 Archive:"
echo "   - Product → Archive"
echo "   - Wait for build (5-15 minutes)"
echo ""
echo "5. 📤 Upload:"
echo "   - Organizer opens automatically"
echo "   - Click 'Distribute App'"
echo "   - Select 'App Store Connect'"
echo "   - Choose 'Upload'"
echo "   - Follow prompts"
echo "   - Sign in with: tanstrauss@gmail.com"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔗 After upload, complete app listing at:"
echo "   https://appstoreconnect.apple.com/apps/6755681856"
echo ""

