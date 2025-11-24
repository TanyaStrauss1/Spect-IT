#!/bin/bash

# Quick fix for provisioning profile error
# This script provides the fastest solutions

cd /Users/tanyastrauss/Spect-IT/SpectITMobile

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║          🔧 QUICK FIX: PROVISIONING PROFILE ERROR                       ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

echo "❌ Error: No profiles for 'com.spectit.app' were found"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎯 SOLUTION 1: USE EAS BUILD (FASTEST - RECOMMENDED)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ EAS automatically creates provisioning profiles!"
echo "   No manual setup needed."
echo ""
echo "Run this command:"
echo "  ./BUILD_WITH_EAS_NO_DEVICE.sh"
echo ""
echo "Or:"
echo "  eas build --platform ios --profile production"
echo ""

read -p "Would you like to build with EAS now? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🚀 Starting EAS build..."
    echo ""
    ./BUILD_WITH_EAS_NO_DEVICE.sh
    exit 0
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎯 SOLUTION 2: FIX XCODE SIGNING"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Enable automatic signing in Xcode:"
echo ""
echo "1. Open Xcode project"
echo "2. Go to Signing & Capabilities tab"
echo "3. ✅ CHECK 'Automatically manage signing'"
echo "4. Select your team"
echo "5. Xcode creates profile automatically"
echo ""

read -p "Would you like to open Xcode to fix signing? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🚀 Opening Xcode..."
    echo ""
    ./FIX_XCODE_SIGNING.sh
    exit 0
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 MANUAL OPTIONS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Option A: Download profiles in Xcode"
echo "  Xcode → Preferences → Accounts"
echo "  Select your Apple ID"
echo "  Click 'Download Manual Profiles'"
echo ""
echo "Option B: Create profile manually"
echo "  https://developer.apple.com/account/resources/profiles/list"
echo "  Create new App Store profile for com.spectit.app"
echo ""
echo "📖 Full guide: FIX_PROVISIONING_PROFILE.md"
echo ""

