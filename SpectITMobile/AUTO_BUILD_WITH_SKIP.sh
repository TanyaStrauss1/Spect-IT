#!/bin/bash

# Automated iOS Build - Attempts to skip Apple account login if possible

cd /Users/tanyastrauss/Spect-IT/SpectITMobile

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║          🍎 AUTOMATED iOS BUILD (NON-INTERACTIVE)                        ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Check EAS login
if ! eas whoami &>/dev/null; then
    echo "❌ Not logged in to EAS"
    exit 1
fi
echo "✅ EAS logged in"

# Try to build without Apple account login (using existing credentials)
echo ""
echo "🔨 Attempting non-interactive build..."
echo "   (Using existing credentials if available)"
echo ""

# Try building with --non-interactive flag
eas build --platform ios --profile production --non-interactive 2>&1

BUILD_EXIT=$?

if [ $BUILD_EXIT -eq 0 ]; then
    echo ""
    echo "✅ Build started successfully!"
    echo "📊 Monitor: https://expo.dev/accounts/tstrauss/projects/spectit-mobile/builds"
else
    echo ""
    echo "⚠️  Non-interactive build failed. Credentials may need to be configured."
    echo ""
    echo "📋 Next steps:"
    echo "   1. Configure credentials first:"
    echo "      eas credentials --platform ios"
    echo ""
    echo "   2. Then run this script again, or:"
    echo "      eas build --platform ios --profile production"
    exit $BUILD_EXIT
fi

