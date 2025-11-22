#!/bin/bash

cd /Users/tanyastrauss/Spect-IT/SpectITMobile

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║          🚀 BUILDING SPECT-IT APP                                        ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Check if logged in
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Checking EAS login status..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if eas whoami > /dev/null 2>&1; then
    EAS_USER=$(eas whoami 2>/dev/null)
    echo "✅ Logged in: $EAS_USER"
    echo ""
else
    echo "⚠️  Not logged in to EAS"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🔐 LOGIN REQUIRED - Starting login process..."
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Please enter your email when prompted:"
    echo "  Email: tanstrauss@gmail.com"
    echo ""
    echo "A browser window will open - approve the login there."
    echo ""
    eas login
    
    # Check if login was successful
    if eas whoami > /dev/null 2>&1; then
        echo ""
        echo "✅ Login successful!"
        echo ""
    else
        echo ""
        echo "❌ Login failed. Please try again."
        exit 1
    fi
fi

# Build Android
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
echo "Starting build..."
echo ""

eas build --platform android --profile production

BUILD_EXIT_CODE=$?

echo ""
if [ $BUILD_EXIT_CODE -eq 0 ]; then
    echo "╔══════════════════════════════════════════════════════════════════════════╗"
    echo "║          ✅ ANDROID BUILD COMPLETE!                                     ║"
    echo "╚══════════════════════════════════════════════════════════════════════════╝"
    echo ""
    echo "📱 Next Steps:"
    echo "  1. Download .aab file from Expo dashboard"
    echo "  2. Submit to Google Play Store"
    echo "  3. No Apple approval needed for Android!"
    echo ""
else
    echo "╔══════════════════════════════════════════════════════════════════════════╗"
    echo "║          ⚠️  BUILD ENCOUNTERED ISSUES                                    ║"
    echo "╚══════════════════════════════════════════════════════════════════════════╝"
    echo ""
    echo "Check the error messages above for details."
    echo "Monitor build status at:"
    echo "https://expo.dev/accounts/tanstrauss/projects/spectit-mobile/builds"
    echo ""
fi

