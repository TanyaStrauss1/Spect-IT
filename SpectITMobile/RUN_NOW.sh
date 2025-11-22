#!/bin/bash

# Complete Build Process - Run This Script
# Email: strausstanya93@gmail.com
# Apple ID Password: SoniKim1979!

set -e

cd "$(dirname "$0")"

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║          🚀 SPECT-IT iOS BUILD PROCESS                                    ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Check EAS login
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 CHECKING EAS LOGIN STATUS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if ! eas whoami &>/dev/null; then
    echo "❌ Not logged in to EAS"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🔐 STEP 1: LOGIN TO EAS (REQUIRED)"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "⚠️  Browser will open for authentication"
    echo "📧 Email: strausstanya93@gmail.com"
    echo ""
    echo "Starting login process..."
    echo ""
    
    eas login
    
    echo ""
    echo "✅ Login complete!"
else
    echo "✅ Already logged in:"
    eas whoami
    echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔨 STEP 2: BUILDING iOS APP (AUTOMATED)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Starting automated build with Apple ID credentials..."
echo "Apple ID: strausstanya93@gmail.com"
echo "Password: [configured in script]"
echo ""
echo "This may take 10-20 minutes"
echo ""

# Run the automated build script
./build_with_password.exp

echo ""
echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║          ✅ BUILD PROCESS COMPLETE!                                      ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""
echo "📋 Next Steps:"
echo "  1. Monitor build: https://expo.dev/accounts/strausstanya93/projects/spectit-mobile/builds"
echo "  2. After build completes, submit to App Store:"
echo "     eas submit --platform ios --latest"
echo "  3. Complete app listing in App Store Connect"
echo ""

