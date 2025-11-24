#!/bin/bash

# Fix Apple Communication Issues
# This script helps resolve authentication and communication problems with Apple

cd /Users/tanyastrauss/Spect-IT/SpectITMobile

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║          🔧 FIX APPLE COMMUNICATION ISSUES                               ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 DIAGNOSTIC: CHECKING CONNECTION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check internet connection
echo "1. Checking internet connection..."
if ping -c 1 appstoreconnect.apple.com &> /dev/null; then
    echo "   ✅ Can reach App Store Connect"
else
    echo "   ⚠️  Cannot reach App Store Connect"
    echo "   Check your internet connection"
fi

# Check EAS CLI
echo ""
echo "2. Checking EAS CLI..."
if command -v eas &> /dev/null; then
    EAS_VERSION=$(eas --version 2>/dev/null || echo "unknown")
    echo "   ✅ EAS CLI installed: $EAS_VERSION"
else
    echo "   ❌ EAS CLI not found"
    echo "   Installing EAS CLI..."
    npm install -g eas-cli
fi

# Check EAS login
echo ""
echo "3. Checking EAS login..."
USER=$(eas whoami 2>/dev/null || echo "")
if [ -z "$USER" ]; then
    echo "   ⚠️  Not logged in to EAS"
    echo "   Logging in..."
    eas login
else
    echo "   ✅ Logged in as: $USER"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 SOLUTION: USE TERMINAL SUBMISSION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Xcode communication issues can be bypassed using terminal submission."
echo ""
echo "📋 Options:"
echo ""
echo "Option 1: Submit existing build"
echo "  ./SUBMIT_VIA_TERMINAL.sh"
echo ""
echo "Option 2: Build and submit in one go"
echo "  ./BUILD_AND_SUBMIT_COMPLETE.sh"
echo ""
echo "Option 3: Manual commands"
echo "  eas submit --platform ios --latest"
echo ""

read -p "Would you like to submit now? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "Starting submission..."
    echo ""
    eas submit --platform ios --latest
fi

