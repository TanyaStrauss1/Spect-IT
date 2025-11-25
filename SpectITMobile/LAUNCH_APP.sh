#!/bin/bash

# Launch Spect-IT app in iOS Simulator or Device

set -e

cd "$(dirname "$0")"

echo ""
echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║          🚀 LAUNCH SPECT-IT APP                                          ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Check if Xcode project exists
if [ ! -d "ios/SpectIT.xcworkspace" ] && [ ! -d "ios/SpectIT.xcodeproj" ]; then
    echo "❌ iOS project not found"
    echo "   Run: npx expo prebuild --platform ios"
    exit 1
fi

echo "📋 Choose how to launch:"
echo ""
echo "1. Launch in iOS Simulator (via Expo)"
echo "2. Launch in iOS Simulator (via Xcode)"
echo "3. Launch on connected device (via Expo)"
echo "4. Build and run in Xcode"
echo ""
read -p "Enter choice (1-4): " LAUNCH_CHOICE

case $LAUNCH_CHOICE in
    1)
        echo ""
        echo "🚀 Launching in iOS Simulator (Expo)..."
        echo ""
        npx expo start --ios
        ;;
    2)
        echo ""
        echo "🚀 Opening Xcode to launch in Simulator..."
        echo ""
        open ios/SpectIT.xcworkspace
        echo ""
        echo "📋 In Xcode:"
        echo "   1. Select a simulator (top toolbar)"
        echo "   2. Click Run button (▶️) or press Cmd+R"
        echo ""
        ;;
    3)
        echo ""
        echo "🚀 Launching on connected device (Expo)..."
        echo ""
        echo "📱 Make sure your device is:"
        echo "   - Connected via USB"
        echo "   - Trusted on this computer"
        echo "   - Has Expo Go app installed (or development build)"
        echo ""
        npx expo start
        ;;
    4)
        echo ""
        echo "🚀 Opening Xcode to build and run..."
        echo ""
        open ios/SpectIT.xcworkspace
        echo ""
        echo "📋 In Xcode:"
        echo "   1. Select device or simulator (top toolbar)"
        echo "   2. Click Run button (▶️) or press Cmd+R"
        echo "   3. Wait for build and launch"
        echo ""
        ;;
    *)
        echo "Invalid choice. Exiting."
        exit 1
        ;;
esac

echo ""

