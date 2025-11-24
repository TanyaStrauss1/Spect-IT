#!/bin/bash

# Start iOS Build
# This script will start the build and handle credentials

cd /Users/tanyastrauss/Spect-IT/SpectITMobile

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║          🚀 STARTING iOS BUILD                                          ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""
echo "📱 Platform: iOS"
echo "🏗️  Profile: production"
echo ""
echo "⏳ Starting build..."
echo ""

# Start the build
eas build --platform ios --profile production

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Build command completed!"
echo ""
echo "📊 Monitor your build at:"
echo "   https://expo.dev/accounts/tstrauss/projects/spectit-mobile/builds"
echo ""
echo "⏱️  Build typically takes 15-30 minutes"
echo ""
