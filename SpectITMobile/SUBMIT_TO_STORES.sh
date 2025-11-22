#!/bin/bash

# Complete App Store Submission Script
# Submits both iOS and Android apps to their respective stores

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║          🚀 SUBMIT TO APP STORES - iOS & ANDROID                        ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

cd /Users/tanyastrauss/Spect-IT/SpectITMobile

# Check EAS login
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 STEP 1: CHECKING EAS LOGIN"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

EAS_WHOAMI_OUTPUT=$(eas whoami 2>&1)
if echo "$EAS_WHOAMI_OUTPUT" | grep -q "Not logged in"; then
    echo "⚠️  Not logged in to EAS. Logging in now..."
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
echo "📱 STEP 2: CHECKING FOR EXISTING BUILDS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "Checking for latest builds..."
echo "Visit: https://expo.dev/accounts/tanstrauss/projects/spectit-mobile/builds"
echo ""

read -p "Do you have existing builds ready to submit? (y/n): " HAS_BUILDS

if [ "$HAS_BUILDS" = "y" ] || [ "$HAS_BUILDS" = "Y" ]; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📤 STEP 3: SUBMITTING EXISTING BUILDS"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    # Submit iOS
    echo "🍎 Submitting iOS app to App Store Connect..."
    eas submit --platform ios --latest
    
    if [ $? -eq 0 ]; then
        echo "✅ iOS app submitted successfully!"
    else
        echo "⚠️  iOS submission had issues. Check the output above."
    fi
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    # Submit Android
    echo "🤖 Submitting Android app to Google Play Store..."
    eas submit --platform android --latest
    
    if [ $? -eq 0 ]; then
        echo "✅ Android app submitted successfully!"
    else
        echo "⚠️  Android submission had issues. Check the output above."
    fi
    
else
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🔨 STEP 3: BUILDING APPS"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    read -p "Build iOS? (y/n): " BUILD_IOS
    read -p "Build Android? (y/n): " BUILD_ANDROID
    
    if [ "$BUILD_IOS" = "y" ] || [ "$BUILD_IOS" = "Y" ]; then
        echo ""
        echo "🍎 Building iOS app..."
        eas build --platform ios --profile production
        echo ""
        echo "✅ iOS build started. Monitor at: https://expo.dev/accounts/tanstrauss/projects/spectit-mobile/builds"
        echo "Once complete, run this script again to submit."
    fi
    
    if [ "$BUILD_ANDROID" = "y" ] || [ "$BUILD_ANDROID" = "Y" ]; then
        echo ""
        echo "🤖 Building Android app..."
        eas build --platform android --profile production
        echo ""
        echo "✅ Android build started. Monitor at: https://expo.dev/accounts/tanstrauss/projects/spectit-mobile/builds"
        echo "Once complete, run this script again to submit."
    fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ SUBMISSION PROCESS COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Next Steps:"
echo ""
echo "🍎 iOS App Store:"
echo "   1. Go to: https://appstoreconnect.apple.com"
echo "   2. Sign in with: tanstrauss@gmail.com"
echo "   3. Complete app listing (screenshots, description, privacy policy)"
echo "   4. Submit for review"
echo ""
echo "🤖 Google Play Store:"
echo "   1. Go to: https://play.google.com/console/u/0/developers/6438572372972515481"
echo "   2. Create app or navigate to existing Spect-IT app"
echo "   3. Complete store listing"
echo "   4. Upload .aab file (if not submitted via EAS)"
echo "   5. Submit for review"
echo ""
echo "📄 Guides:"
echo "   • iOS: SpectITMobile/IOS_APP_SETUP_GUIDE.md"
echo "   • Android: SpectITMobile/PLAY_STORE_CONFIG.md"
echo ""

