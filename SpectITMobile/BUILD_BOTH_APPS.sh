#!/bin/bash
# Build both Android and iOS apps for Spect-IT

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║          🚀 BUILDING ANDROID & iOS APPS                                  ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Navigate to the SpectITMobile directory
cd /Users/tanyastrauss/Spect-IT/SpectITMobile

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    echo "❌ EAS CLI is not installed. Installing now..."
    npm install -g eas-cli
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install EAS CLI. Please install manually: npm install -g eas-cli"
        exit 1
    fi
    echo "✅ EAS CLI installed successfully"
fi

# Check EAS login status
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 STEP 1: CHECKING EAS LOGIN"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

EAS_WHOAMI_OUTPUT=$(eas whoami 2>&1)
if echo "$EAS_WHOAMI_OUTPUT" | grep -q "Not logged in"; then
    echo "⚠️  Not logged in to EAS. Please log in now."
    echo "Running 'eas login'..."
    eas login
    if [ $? -ne 0 ]; then
        echo "❌ EAS login failed. Please try again manually: eas login"
        exit 1
    fi
    echo "✅ Logged in to EAS."
else
    echo "✅ Already logged in to EAS."
    echo "$EAS_WHOAMI_OUTPUT"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔨 STEP 2: BUILDING ANDROID APP"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Building Android App Bundle (.aab) for Google Play Store..."
echo "This may take 10-20 minutes in the Expo cloud."
echo ""

eas build --platform android --profile production
ANDROID_BUILD_STATUS=$?

if [ $ANDROID_BUILD_STATUS -ne 0 ]; then
    echo "❌ Android build failed. Please check the Expo dashboard for errors."
    echo "Monitor at: https://expo.dev/accounts/tstrauss/projects/spectit-mobile/builds"
    exit 1
fi

echo ""
echo "✅ Android build started successfully!"
echo "Monitor build status at: https://expo.dev/accounts/tstrauss/projects/spectit-mobile/builds"
echo "You will need to download the .aab file from the Expo dashboard once the build is complete."
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🍎 STEP 3: BUILDING iOS APP"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Building iOS app (.ipa) for App Store..."
echo "This may take 10-20 minutes in the Expo cloud."
echo ""
echo "⚠️  Note: You may be prompted for Apple ID credentials during the build."
echo "   Apple ID: tanstrauss@gmail.com"
echo ""

eas build --platform ios --profile production
IOS_BUILD_STATUS=$?

if [ $IOS_BUILD_STATUS -ne 0 ]; then
    echo "❌ iOS build failed. Please check the Expo dashboard for errors."
    echo "Monitor at: https://expo.dev/accounts/tstrauss/projects/spectit-mobile/builds"
    echo ""
    echo "Common issues:"
    echo "  - Apple Developer Program membership required"
    echo "  - Apple ID credentials needed"
    echo "  - 2FA verification may be required"
    exit 1
fi

echo ""
echo "✅ iOS build started successfully!"
echo "Monitor build status at: https://expo.dev/accounts/tstrauss/projects/spectit-mobile/builds"
echo ""

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║          ✅ BOTH BUILDS INITIATED!                                       ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Monitor builds at: https://expo.dev/accounts/tstrauss/projects/spectit-mobile/builds"
echo ""
echo "2. Android (.aab):"
echo "   - Download from Expo dashboard when complete"
echo "   - Submit to Google Play Store: https://play.google.com/console"
echo "   - Developer Account ID: 6438572372972515481"
echo ""
echo "3. iOS (.ipa):"
echo "   - Download from Expo dashboard when complete"
echo "   - Submit to App Store Connect: https://appstoreconnect.apple.com"
echo "   - Apple ID: tanstrauss@gmail.com"
echo ""
echo "4. Or submit automatically:"
echo "   - Android: eas submit --platform android --latest"
echo "   - iOS: eas submit --platform ios --latest"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

