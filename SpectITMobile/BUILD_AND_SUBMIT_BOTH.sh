#!/bin/bash

# Complete Build and Submit Script for iOS and Android
# This script builds and submits both apps to their respective app stores

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║          🚀 BUILD & SUBMIT iOS & ANDROID APPS                            ║"
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
echo "🔨 STEP 2: BUILDING ANDROID APP BUNDLE (.aab)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Building Android App Bundle for Google Play Store..."
echo "This may take 10-20 minutes in the Expo cloud."
echo ""

eas build --platform android --profile production

if [ $? -ne 0 ]; then
    echo "❌ Android build failed. Check the error messages above."
    echo "Monitor at: https://expo.dev/accounts/tanstrauss/projects/spectit-mobile/builds"
    exit 1
fi

echo ""
echo "✅ Android build started successfully!"
echo "Monitor build status at: https://expo.dev/accounts/tanstrauss/projects/spectit-mobile/builds"
echo ""

# Wait for user to confirm Android build is complete
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⏸️  WAITING FOR ANDROID BUILD"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Please wait for the Android build to complete."
echo "Check status at: https://expo.dev/accounts/tanstrauss/projects/spectit-mobile/builds"
echo ""
read -p "Press Enter once the Android build is complete and you're ready to continue..."

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🍎 STEP 3: BUILDING iOS APP (.ipa)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Building iOS app for App Store..."
echo "This may take 15-25 minutes in the Expo cloud."
echo ""

eas build --platform ios --profile production

if [ $? -ne 0 ]; then
    echo "❌ iOS build failed. Check the error messages above."
    echo "Monitor at: https://expo.dev/accounts/tanstrauss/projects/spectit-mobile/builds"
    exit 1
fi

echo ""
echo "✅ iOS build started successfully!"
echo "Monitor build status at: https://expo.dev/accounts/tanstrauss/projects/spectit-mobile/builds"
echo ""

# Wait for user to confirm iOS build is complete
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⏸️  WAITING FOR iOS BUILD"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Please wait for the iOS build to complete."
echo "Check status at: https://expo.dev/accounts/tanstrauss/projects/spectit-mobile/builds"
echo ""
read -p "Press Enter once the iOS build is complete and you're ready to continue..."

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📤 STEP 4: SUBMITTING ANDROID APP TO GOOGLE PLAY STORE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

eas submit --platform android --latest

if [ $? -ne 0 ]; then
    echo "⚠️  Android submission may have failed or requires manual steps."
    echo "You can also submit manually:"
    echo "1. Go to: https://play.google.com/console/u/0/developers/6438572372972515481"
    echo "2. Download .aab from: https://expo.dev/accounts/tanstrauss/projects/spectit-mobile/builds"
    echo "3. Upload to Play Console → Production track"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📤 STEP 5: SUBMITTING iOS APP TO APP STORE CONNECT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

eas submit --platform ios --latest

if [ $? -ne 0 ]; then
    echo "⚠️  iOS submission may have failed or requires manual steps."
    echo "You can also submit manually:"
    echo "1. Go to: https://appstoreconnect.apple.com"
    echo "2. Download .ipa from: https://expo.dev/accounts/tanstrauss/projects/spectit-mobile/builds"
    echo "3. Upload via Transporter or App Store Connect"
fi

echo ""
echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║          ✅ BUILD & SUBMIT PROCESS COMPLETE!                              ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""
echo "📋 Next Steps:"
echo ""
echo "📱 ANDROID (Google Play Store):"
echo "   1. Go to: https://play.google.com/console/u/0/developers/6438572372972515481"
echo "   2. Complete app listing (screenshots, description, privacy policy)"
echo "   3. Submit for review"
echo ""
echo "🍎 iOS (App Store Connect):"
echo "   1. Go to: https://appstoreconnect.apple.com"
echo "   2. Sign in with: tanstrauss@gmail.com"
echo "   3. Complete app listing (screenshots, description, privacy policy)"
echo "   4. Submit for review"
echo ""
echo "📊 Monitor Builds:"
echo "   https://expo.dev/accounts/tanstrauss/projects/spectit-mobile/builds"
echo ""

