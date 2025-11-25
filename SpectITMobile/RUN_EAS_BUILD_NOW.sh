#!/bin/bash

# Run EAS Build - Interactive Script
# Run this in your terminal to build with EAS

cd "$(dirname "$0")"

echo ""
echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║     🚀 EAS CLOUD BUILD - OPTION 1                                         ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

echo "📋 Step 1: Setting up EAS credentials..."
echo ""
echo "   You'll be prompted to:"
echo "   1. Select: iOS"
echo "   2. Select: production"
echo "   3. Choose: Set up new credentials (or use existing)"
echo "   4. Apple ID: tanstrauss@gmail.com"
echo "   5. Password: (use app-specific password if 2FA enabled)"
echo ""
echo "   💡 If you have 2FA enabled, get app-specific password:"
echo "      https://appleid.apple.com/account/manage → Security → App-Specific Passwords"
echo ""

read -p "Press Enter to start credentials setup..."

eas credentials --platform ios

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "📋 Step 2: Starting EAS build..."
echo ""
echo "   ⏱️  This will take 15-30 minutes"
echo "   📊 Monitor at: https://expo.dev/accounts/tstrauss/projects/spectit-mobile/builds"
echo ""

read -p "Press Enter to start build..."

eas build --platform ios --profile production

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Build started!"
echo ""
echo "📋 Next steps:"
echo "   1. Wait for build to complete (15-30 minutes)"
echo "   2. Build will automatically upload to App Store Connect"
echo "   3. Go to: https://appstoreconnect.apple.com/apps/6755681856"
echo "   4. Wait for processing (15-30 minutes)"
echo "   5. Select build in App Store tab"
echo "   6. Complete required fields"
echo "   7. Submit for review"
echo ""

