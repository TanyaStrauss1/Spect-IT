#!/bin/bash

# Fix EAS Credentials and Build - Complete Solution

set -e

cd "$(dirname "$0")"

echo ""
echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║     🔧 FIX EAS CREDENTIALS & BUILD - COMPLETE SOLUTION                   ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

echo "📋 This will set up EAS credentials and build your app."
echo ""
echo "⚠️  IMPORTANT: You'll need to provide your Apple ID password."
echo "   If you have 2FA enabled, use an app-specific password."
echo ""
read -p "Press Enter to continue or Ctrl+C to cancel..."

echo ""
echo "1️⃣  Setting up EAS credentials..."
echo ""

# Set up credentials interactively
echo "   Running: eas credentials"
echo "   Follow the prompts:"
echo "   - Select: iOS"
echo "   - Select: production"
echo "   - Choose: Set up new credentials"
echo "   - Apple ID: tanstrauss@gmail.com"
echo "   - Password: (use app-specific password if 2FA enabled)"
echo ""

eas credentials

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "2️⃣  Starting EAS build..."
echo ""
echo "   ⏱️  This will take 15-30 minutes"
echo "   📊 Monitor at: https://expo.dev/accounts/tstrauss/projects/spectit-mobile/builds"
echo ""

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

