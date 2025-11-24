#!/bin/bash

# Open Xcode and prepare for submission
# This script opens the iOS project in Xcode ready for archiving and submission

cd /Users/tanyastrauss/Spect-IT/SpectITMobile

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║          📤 OPEN XCODE FOR APP STORE SUBMISSION                          ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Check if iOS project exists
if [ ! -d "ios" ]; then
    echo "⚠️  iOS project not found. Generating it now..."
    echo ""
    ./PREPARE_XCODE_BUILD.sh
    exit 0
fi

# Find workspace or project
WORKSPACE=$(find ios -name "*.xcworkspace" -type d | head -1)
PROJECT=$(find ios -name "*.xcodeproj" -type d | head -1)

if [ -n "$WORKSPACE" ]; then
    echo "✅ Found Xcode workspace: $WORKSPACE"
    echo ""
    echo "🚀 Opening Xcode..."
    open "$WORKSPACE"
    OPENED_FILE="$WORKSPACE"
elif [ -n "$PROJECT" ]; then
    echo "✅ Found Xcode project: $PROJECT"
    echo ""
    echo "🚀 Opening Xcode..."
    open "$PROJECT"
    OPENED_FILE="$PROJECT"
else
    echo "❌ No Xcode project found in ios/ folder"
    echo ""
    echo "📋 Generating iOS project..."
    ./PREPARE_XCODE_BUILD.sh
    exit 0
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 NEXT STEPS IN XCODE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. ⏱️  Wait for Xcode to finish indexing (2-5 minutes)"
echo ""
echo "2. 🔐 Configure Signing:"
echo "   - Click project name (blue icon) in left sidebar"
echo "   - Select target under TARGETS"
echo "   - Go to 'Signing & Capabilities' tab"
echo "   - Select your team (or add account: tanstrauss@gmail.com)"
echo "   - Bundle ID should be: com.spectit.app"
echo ""
echo "3. 📱 Select Build Target:"
echo "   - In top toolbar, select 'Any iOS Device' (NOT simulator)"
echo ""
echo "4. 📦 Archive:"
echo "   - Product → Archive"
echo "   - Wait for build (5-15 minutes)"
echo ""
echo "5. 📤 Submit:"
echo "   - Organizer opens automatically"
echo "   - Click 'Distribute App'"
echo "   - Select 'App Store Connect'"
echo "   - Follow prompts to upload"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📖 Full guide: SUBMIT_FROM_XCODE.md"
echo ""
echo "🔗 App Store Connect:"
echo "   https://appstoreconnect.apple.com/apps/6755681856"
echo ""

