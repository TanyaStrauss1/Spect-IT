#!/bin/bash

cd /Users/tanyastrauss/Spect-IT/SpectITMobile

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║          🚀 COMPLETE BUILD PROCESS - ALL FROM HERE                       ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 BUILD INFORMATION:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "• EAS Email: tanstrauss@gmail.com"
echo "• Apple ID: tanstrauss@gmail.com"
echo "• Apple Password: Tulip105! (configured)"
echo "• Platform: iOS"
echo "• Profile: production"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 STEP 1: CHECKING EAS LOGIN"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if eas whoami > /dev/null 2>&1; then
    EAS_USER=$(eas whoami 2>/dev/null)
    echo "✅ Already logged in: $EAS_USER"
    echo ""
    LOGGED_IN=true
else
    echo "⚠️  Not logged in to EAS"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🔐 STEP 2: LOGIN TO EAS"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Starting EAS login..."
    echo "When prompted:"
    echo "  • Email: tanstrauss@gmail.com"
    echo "  • Password: Press Enter (uses browser auth)"
    echo "  • Browser will open - approve the login"
    echo ""
    echo "Starting login process..."
    echo ""
    
    eas login
    
    if eas whoami > /dev/null 2>&1; then
        echo ""
        echo "✅ Login successful!"
        echo ""
        LOGGED_IN=true
    else
        echo ""
        echo "❌ Login failed or not completed."
        echo ""
        echo "Please run this manually in your terminal:"
        echo "  eas login"
        echo ""
        echo "Then run this script again."
        exit 1
    fi
fi

if [ "$LOGGED_IN" = true ]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🔨 STEP 3: BUILDING iOS APP"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Building iOS app for App Store..."
    echo "This will take 10-20 minutes"
    echo ""
    echo "Monitor build at:"
    echo "https://expo.dev/accounts/tanstrauss/projects/spectit-mobile/builds"
    echo ""
    echo "Starting build..."
    echo ""
    
    ./build_with_tanstrauss.exp
    
    BUILD_EXIT=$?
    
    echo ""
    if [ $BUILD_EXIT -eq 0 ]; then
        echo "╔══════════════════════════════════════════════════════════════════════════╗"
        echo "║          ✅ BUILD COMPLETE!                                              ║"
        echo "╚══════════════════════════════════════════════════════════════════════════╝"
        echo ""
        echo "📱 Next Steps:"
        echo "  1. Check build status at Expo dashboard"
        echo "  2. Download .ipa file when ready"
        echo "  3. Submit to App Store Connect"
        echo ""
    else
        echo "╔══════════════════════════════════════════════════════════════════════════╗"
        echo "║          ⚠️  BUILD ENCOUNTERED ISSUES                                    ║"
        echo "╚══════════════════════════════════════════════════════════════════════════╝"
        echo ""
        echo "Check the error messages above for details."
        echo "Monitor build at:"
        echo "https://expo.dev/accounts/tanstrauss/projects/spectit-mobile/builds"
        echo ""
    fi
fi

