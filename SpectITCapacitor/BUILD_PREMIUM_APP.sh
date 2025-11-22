#!/bin/bash

# Build Premium Spect-IT App with All Advanced Features
# This builds the Capacitor app that wraps the premium website

cd /Users/tanyastrauss/Spect-IT/SpectITCapacitor

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║          ⭐ BUILDING PREMIUM SPECT-IT APP                                ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Sync website files to app
echo "🔄 Syncing premium website files to app..."
npx cap sync

if [ $? -ne 0 ]; then
    echo "❌ Sync failed"
    exit 1
fi

echo ""
echo "✅ Files synced successfully!"
echo ""

# Check EAS login
echo "📋 Checking EAS login..."
if ! eas whoami &>/dev/null; then
    echo "⚠️  Not logged in to EAS. Please run: eas login"
    exit 1
fi
echo "✅ EAS logged in"
echo ""

# Ask which platform to build
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📱 SELECT PLATFORM TO BUILD:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Android (Ready now - no payment needed)"
echo "2. iOS (Requires Apple Developer payment)"
echo "3. Both"
echo ""
read -p "Enter choice (1/2/3): " choice

case $choice in
    1)
        echo ""
        echo "🤖 Building Android app..."
        eas build --platform android --profile production
        ;;
    2)
        echo ""
        echo "🍎 Building iOS app..."
        echo "⚠️  You will be prompted for Apple ID credentials"
        eas build --platform ios --profile production
        ;;
    3)
        echo ""
        echo "🤖 Building Android app first..."
        eas build --platform android --profile production
        
        if [ $? -eq 0 ]; then
            echo ""
            echo "🍎 Building iOS app..."
            echo "⚠️  You will be prompted for Apple ID credentials"
            eas build --platform ios --profile production
        fi
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac

if [ $? -eq 0 ]; then
    echo ""
    echo "╔══════════════════════════════════════════════════════════════════════════╗"
    echo "║          ✅ PREMIUM APP BUILD STARTED!                                    ║"
    echo "╚══════════════════════════════════════════════════════════════════════════╝"
    echo ""
    echo "📊 Monitor builds at:"
    echo "   https://expo.dev/accounts/tstrauss/projects/spectit-premium/builds"
    echo ""
    echo "⏱️  Build time: 10-20 minutes"
    echo ""
    echo "📱 Your premium app includes:"
    echo "   ✅ Advanced AI eye tracking"
    echo "   ✅ 3D face mapping"
    echo "   ✅ Premium analytics dashboard"
    echo "   ✅ Professional-grade measurements"
    echo "   ✅ All premium features from website"
    echo ""
else
    echo ""
    echo "❌ Build failed. Check errors above."
    exit 1
fi

