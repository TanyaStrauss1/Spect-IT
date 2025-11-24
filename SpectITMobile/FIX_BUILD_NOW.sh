#!/bin/bash

# Interactive script to fix build failures
# Guides through all troubleshooting options

cd /Users/tanyastrauss/Spect-IT/SpectITMobile

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║          🔧 FIX BUILD FAILURE - INTERACTIVE GUIDE                       ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 STEP 1: CHECK APP ID EXISTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "First, let's verify the App ID exists in Apple Developer Portal."
echo ""
echo "🔗 Open this link:"
echo "   https://developer.apple.com/account/resources/identifiers/list"
echo ""
echo "Look for: com.spectit.app"
echo ""
read -p "Does the App ID 'com.spectit.app' exist? (y/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "⚠️  App ID doesn't exist. Let's create it!"
    echo ""
    echo "📋 Steps to create App ID:"
    echo ""
    echo "1. Go to: https://developer.apple.com/account/resources/identifiers/list"
    echo "2. Click '+' button"
    echo "3. Select 'App IDs' → 'Continue'"
    echo "4. Fill in:"
    echo "   - Description: Spect-IT"
    echo "   - Bundle ID: com.spectit.app (Explicit)"
    echo "   - Capabilities: Camera, Location Services, Photo Library"
    echo "5. Click 'Continue' → 'Register'"
    echo ""
    read -p "Press Enter after creating the App ID..."
    echo ""
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 STEP 2: VERIFY APPLE DEVELOPER ACCOUNT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Verify your Apple Developer account is active:"
echo ""
echo "🔗 Open: https://developer.apple.com/account"
echo "   Sign in with: tanstrauss@gmail.com"
echo ""
read -p "Can you access the account? (y/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "❌ Account access issue!"
    echo ""
    echo "Possible issues:"
    echo "  - Account not activated (wait 24-48 hours after payment)"
    echo "  - Wrong credentials"
    echo "  - Account locked"
    echo ""
    echo "Fix:"
    echo "  1. Check email for activation confirmation"
    echo "  2. Verify payment was processed"
    echo "  3. Try resetting password"
    echo ""
    read -p "Press Enter to continue anyway..."
    echo ""
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 STEP 3: CLEAR CREDENTIALS (Recommended First)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Clearing old credentials and regenerating them often fixes build issues."
echo ""
read -p "Would you like to clear and regenerate credentials? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🔧 Opening credentials manager..."
    echo ""
    echo "In the interactive menu:"
    echo "  1. Select 'iOS'"
    echo "  2. Select 'production'"
    echo "  3. Choose to regenerate credentials"
    echo ""
    eas credentials
    echo ""
    echo "✅ Credentials regenerated!"
    echo ""
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 STEP 4: SETUP APP-SPECIFIC PASSWORD (If 2FA Enabled)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "If you have 2FA enabled, use an app-specific password for better reliability."
echo ""
read -p "Do you have 2FA enabled? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "📋 Create App-Specific Password:"
    echo ""
    echo "1. Go to: https://appleid.apple.com/account/manage"
    echo "2. Sign in with: tanstrauss@gmail.com"
    echo "3. Go to 'Security' section"
    echo "4. Under 'App-Specific Passwords', click 'Generate Password'"
    echo "5. Label: 'EAS Build'"
    echo "6. Copy the password (you won't see it again!)"
    echo ""
    echo "⚠️  When prompted during build, use this app-specific password"
    echo "   (NOT your regular Apple ID password)"
    echo ""
    read -p "Press Enter after creating app-specific password..."
    echo ""
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 STEP 5: RETRY BUILD"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Now let's retry the build with fresh credentials."
echo ""
echo "⚠️  When prompted:"
echo "   - Apple ID: tanstrauss@gmail.com"
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "   - Password: Use your APP-SPECIFIC PASSWORD (not regular password)"
else
    echo "   - Password: Your Apple ID password"
fi
echo "   - 2FA Code: Enter code from your device (if enabled)"
echo ""
read -p "Ready to start build? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🚀 Starting build..."
    echo ""
    echo "⏱️  This will take 15-30 minutes"
    echo "🔗 Monitor: https://expo.dev/accounts/tstrauss/projects/spectit-mobile/builds"
    echo ""
    
    eas build --platform ios --profile production
    
    BUILD_EXIT_CODE=$?
    
    echo ""
    if [ $BUILD_EXIT_CODE -eq 0 ]; then
        echo "╔══════════════════════════════════════════════════════════════════════════╗"
        echo "║          ✅ BUILD STARTED SUCCESSFULLY!                                ║"
        echo "╚══════════════════════════════════════════════════════════════════════════╝"
        echo ""
        echo "📊 Monitor your build:"
        echo "   https://expo.dev/accounts/tstrauss/projects/spectit-mobile/builds"
        echo ""
    else
        echo "❌ Build failed again."
        echo ""
        echo "📋 Next steps:"
        echo "   1. Check build logs: https://expo.dev/accounts/tstrauss/projects/spectit-mobile/builds"
        echo "   2. Review error messages"
        echo "   3. See: TROUBLESHOOT_BUILD_FAILURE.md for more solutions"
        echo ""
        echo "💡 Alternative: Build locally in Xcode"
        echo "   ./BUILD_AND_UPLOAD_XCODE.sh"
        echo ""
    fi
else
    echo ""
    echo "Build cancelled. Run this script again when ready:"
    echo "  ./FIX_BUILD_NOW.sh"
    echo ""
fi

