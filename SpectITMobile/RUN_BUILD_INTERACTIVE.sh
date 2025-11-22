#!/bin/bash

# Interactive iOS Build - Run this in YOUR terminal (not automated)
# This script will prompt you for Apple credentials

cd /Users/tanyastrauss/Spect-IT/SpectITMobile

clear
echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║          🍎 iOS BUILD - INTERACTIVE MODE                                 ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Check EAS login
echo "📋 Checking EAS login..."
if ! eas whoami &>/dev/null; then
    echo "⚠️  Not logged in. Logging in now..."
    eas login
    if [ $? -ne 0 ]; then
        echo "❌ Login failed"
        exit 1
    fi
fi
echo "✅ Logged in to EAS"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔨 STARTING iOS BUILD"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 You will be prompted for:"
echo "   1. 'Do you want to log in to your Apple account?' → Type: y"
echo "   2. 'Apple ID:' → Type: tanstrauss@gmail.com"
echo "   3. 'Password:' → Type: [Your Apple ID password]"
echo "   4. 'Verification code:' → Type: [2FA code if enabled]"
echo ""
echo "⏱️  Build time: 10-20 minutes"
echo ""
read -p "Press Enter to start the build..."
echo ""

# Start the build
eas build --platform ios --profile production

if [ $? -eq 0 ]; then
    echo ""
    echo "╔══════════════════════════════════════════════════════════════════════════╗"
    echo "║          ✅ BUILD STARTED SUCCESSFULLY!                                 ║"
    echo "╚══════════════════════════════════════════════════════════════════════════╝"
    echo ""
    echo "📊 Monitor your build:"
    echo "   https://expo.dev/accounts/tstrauss/projects/spectit-mobile/builds"
    echo ""
    echo "📤 After build completes, submit with:"
    echo "   eas submit --platform ios --latest"
    echo ""
else
    echo ""
    echo "❌ Build failed. Check errors above."
    exit 1
fi

