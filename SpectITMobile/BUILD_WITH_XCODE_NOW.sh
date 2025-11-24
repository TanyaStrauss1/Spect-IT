#!/bin/bash

# Build with Xcode - Best Quality Build

cd /Users/tanyastrauss/Spect-IT/SpectITMobile

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║     🍎 BUILD WITH XCODE - BEST QUALITY                                  ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Check if Xcode is installed
if ! command -v xcodebuild &> /dev/null; then
    echo "❌ Xcode not found. Please install Xcode from Mac App Store"
    exit 1
fi

echo "✅ Xcode found: $(xcodebuild -version | head -1)"
echo ""

# Check if iOS project exists
if [ ! -d "ios" ]; then
    echo "📱 Generating iOS project..."
    export LANG=en_US.UTF-8
    npx expo prebuild --platform ios
fi

# Check for workspace or project
if [ -f "ios/SpectIT.xcworkspace" ]; then
    PROJECT_PATH="ios/SpectIT.xcworkspace"
    echo "📦 Using Xcode workspace"
elif [ -f "ios/SpectIT.xcodeproj" ]; then
    PROJECT_PATH="ios/SpectIT.xcodeproj"
    echo "📦 Using Xcode project"
else
    echo "❌ Xcode project not found"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "🚀 Opening Xcode..."
echo ""
echo "📋 In Xcode, follow these steps:"
echo ""
echo "1. Wait for indexing (2-5 minutes)"
echo ""
echo "2. Configure Signing:"
echo "   - Click 'SpectIT' (blue icon)"
echo "   - Select 'SpectIT' under TARGETS"
echo "   - Go to 'Signing & Capabilities'"
echo "   - Select your team"
echo "   - Bundle ID should be: com.spectit.app"
echo ""
echo "3. Select Build Target:"
echo "   - Select 'Any iOS Device' (not simulator)"
echo ""
echo "4. Build & Archive:"
echo "   - Product → Archive"
echo "   - Wait 5-15 minutes"
echo ""
echo "5. Submit:"
echo "   - Organizer opens automatically"
echo "   - Click 'Distribute App'"
echo "   - Select 'App Store Connect'"
echo "   - Follow prompts"
echo ""

# Open Xcode
open "$PROJECT_PATH"

echo "✅ Xcode is opening..."
echo ""
echo "📖 Full guide: See XCODE_BUILD_STEPS.md"
echo ""

