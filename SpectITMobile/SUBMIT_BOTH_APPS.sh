#!/bin/bash
# Submit both Android and iOS apps to their respective app stores

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║          📤 SUBMITTING ANDROID & iOS APPS TO STORES                     ║"
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
echo "📱 STEP 2: SUBMITTING ANDROID APP TO GOOGLE PLAY STORE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Submitting latest Android build to Google Play Store..."
echo ""

eas submit --platform android --latest
ANDROID_SUBMIT_STATUS=$?

if [ $ANDROID_SUBMIT_STATUS -ne 0 ]; then
    echo ""
    echo "❌ Android submission failed. Please check the error messages above."
    echo ""
    echo "Alternative: Submit manually via Play Console:"
    echo "  1. Download .aab from: https://expo.dev/accounts/tstrauss/projects/spectit-mobile/builds"
    echo "  2. Go to: https://play.google.com/console/u/0/developers/6438572372972515481"
    echo "  3. Upload .aab file manually"
    exit 1
fi

echo ""
echo "✅ Android app submitted successfully!"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🍎 STEP 3: SUBMITTING iOS APP TO APP STORE CONNECT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Submitting latest iOS build to App Store Connect..."
echo ""
echo "⚠️  Note: You may be prompted for Apple ID credentials during submission."
echo "   Apple ID: tanstrauss@gmail.com"
echo ""

eas submit --platform ios --latest
IOS_SUBMIT_STATUS=$?

if [ $IOS_SUBMIT_STATUS -ne 0 ]; then
    echo ""
    echo "❌ iOS submission failed. Please check the error messages above."
    echo ""
    echo "Common issues:"
    echo "  - Apple Developer Program membership required"
    echo "  - Apple ID credentials needed"
    echo "  - 2FA verification may be required"
    echo "  - App must be created in App Store Connect first"
    echo ""
    echo "Alternative: Submit manually via App Store Connect:"
    echo "  1. Download .ipa from: https://expo.dev/accounts/tstrauss/projects/spectit-mobile/builds"
    echo "  2. Go to: https://appstoreconnect.apple.com"
    echo "  3. Sign in with: tanstrauss@gmail.com"
    echo "  4. Upload .ipa file manually"
    exit 1
fi

echo ""
echo "✅ iOS app submitted successfully!"
echo ""

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║          ✅ BOTH APPS SUBMITTED!                                         ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Google Play Store:"
echo "   - Go to: https://play.google.com/console/u/0/developers/6438572372972515481"
echo "   - Complete store listing (screenshots, description, privacy policy)"
echo "   - Submit for review"
echo ""
echo "2. App Store Connect:"
echo "   - Go to: https://appstoreconnect.apple.com"
echo "   - Sign in with: tanstrauss@gmail.com"
echo "   - Complete app listing (screenshots, description, privacy policy)"
echo "   - Submit for review"
echo ""
echo "3. Monitor submissions:"
echo "   - Android: Check Play Console for review status"
echo "   - iOS: Check App Store Connect for review status"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

