#!/bin/bash

# ╔══════════════════════════════════════════════════════════════════════════╗
# ║     QUICK BUILD - DIRECT COMMAND                                         ║
# ╚══════════════════════════════════════════════════════════════════════════╝

cd "$(dirname "$0")"

echo "🚀 Starting EAS Build..."
echo ""
echo "This will:"
echo "  • Build in the cloud"
echo "  • Upload to App Store Connect automatically"
echo "  • Take 15-30 minutes"
echo ""

# Build directly
eas build --platform ios --profile production

echo ""
echo "✅ Build started!"
echo ""
echo "Monitor progress:"
echo "  https://expo.dev/accounts/tstrauss/projects/spectit-mobile/builds"
echo ""
echo "Check TestFlight (after 15-30 min):"
echo "  https://appstoreconnect.apple.com/teams/c5c5f5d2-8ebe-443d-957f-b4038c7db237/apps/6755681856/testflight"
echo ""

