#!/bin/bash

cd /Users/tanyastrauss/Spect-IT/SpectITMobile

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║          🚀 STARTING BUILD PROCESS                                         ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Check EAS login
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 STEP 1: CHECKING EAS LOGIN"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if eas whoami > /dev/null 2>&1; then
    echo "✅ Already logged in to EAS"
    EAS_USER=$(eas whoami 2>/dev/null | grep -o "Logged in as.*" || echo "")
    echo "   $EAS_USER"
    echo ""
else
    echo "⚠️  Not logged in to EAS"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🔐 LOGIN REQUIRED"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Please run this command to login:"
    echo "  eas login"
    echo ""
    echo "When prompted:"
    echo "  • Enter: tanstrauss@gmail.com"
    echo "  • Browser will open - approve the login"
    echo ""
    echo "After login, run this script again to continue building."
    echo ""
    exit 1
fi

# Ask which platform to build
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📱 STEP 2: CHOOSE PLATFORM"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Which platform would you like to build?"
echo ""
echo "1. Android (✅ No Apple approval needed - can build now!)"
echo "2. iOS (⚠️  Requires Apple Developer Program approval - wait 24-48 hours)"
echo ""
read -p "Enter choice (1 or 2): " choice

case $choice in
    1)
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "🔨 BUILDING ANDROID APP"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        echo "Building Android App Bundle (.aab) for Google Play Store..."
        echo "This will take 10-20 minutes"
        echo ""
        echo "Monitor build at:"
        echo "https://expo.dev/accounts/tanstrauss/projects/spectit-mobile/builds"
        echo ""
        eas build --platform android --profile production
        ;;
    2)
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "🍎 BUILDING iOS APP"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        echo "⚠️  WARNING: iOS builds require Apple Developer Program approval"
        echo "Make sure you have:"
        echo "  • Completed Apple Developer Program purchase"
        echo "  • Received approval email (24-48 hours after payment)"
        echo "  • Can access https://developer.apple.com/account"
        echo ""
        read -p "Continue with iOS build? (y/n): " confirm
        if [ "$confirm" = "y" ]; then
            echo ""
            echo "Building iOS app for App Store..."
            echo "This will take 10-20 minutes"
            echo ""
            echo "Monitor build at:"
            echo "https://expo.dev/accounts/tanstrauss/projects/spectit-mobile/builds"
            echo ""
            ./build_with_tanstrauss.exp
        else
            echo ""
            echo "Build cancelled. Run this script again when ready."
            exit 0
        fi
        ;;
    *)
        echo ""
        echo "Invalid choice. Please run the script again and select 1 or 2."
        exit 1
        ;;
esac

echo ""
echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║          ✅ BUILD PROCESS COMPLETE                                       ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

