#!/bin/bash

# Build and Push All - Complete workflow

cd /Users/tanyastrauss/Spect-IT/SpectITMobile

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║          🚀 BUILD AND PUSH ALL                                          ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Step 1: Ensure assets exist
if [ ! -f "assets/icon.png" ]; then
    echo "📦 Creating missing assets..."
    ./create_assets.sh
fi

# Step 2: Generate iOS project if needed
if [ ! -d "ios" ]; then
    echo "📱 Generating iOS project..."
    npx expo prebuild --platform ios
    if [ $? -ne 0 ]; then
        echo "❌ Failed to generate iOS project"
        exit 1
    fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 3: Build options
echo "Choose build method:"
echo "1. EAS Build (Cloud - Recommended)"
echo "2. Xcode (Local - Requires Xcode)"
echo ""
read -p "Enter choice (1 or 2): " choice

case $choice in
    1)
        echo ""
        echo "☁️  Starting EAS Build..."
        echo ""
        eas build --platform ios --profile production
        ;;
    2)
        echo ""
        echo "🍎 Opening Xcode..."
        echo ""
        if [ -f "ios/spectit-mobile.xcworkspace" ]; then
            open ios/spectit-mobile.xcworkspace
        else
            open ios/spectit-mobile.xcodeproj
        fi
        echo ""
        echo "📋 In Xcode:"
        echo "   1. Select 'Any iOS Device'"
        echo "   2. Go to Product → Archive"
        echo "   3. Follow prompts to upload"
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Monitor builds:"
echo "   https://expo.dev/accounts/tstrauss/projects/spectit-mobile/builds"
echo ""
echo "📤 After build completes, submit with:"
echo "   eas submit --platform ios --latest"
echo ""

