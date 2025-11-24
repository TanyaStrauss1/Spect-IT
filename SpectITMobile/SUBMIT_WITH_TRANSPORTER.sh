#!/bin/bash

# Guide to submit using Apple Transporter app
# This is the most reliable alternative to terminal submission

cd /Users/tanyastrauss/Spect-IT/Spect-IT/SpectITMobile

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║          📤 SUBMIT WITH APPLE TRANSPORTER (MOST RELIABLE)              ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📥 STEP 1: INSTALL TRANSPORTER"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if command -v transporter &> /dev/null; then
    echo "✅ Transporter already installed"
else
    echo "📥 Installing Transporter..."
    echo ""
    echo "1. Open Mac App Store"
    echo "2. Search for 'Transporter'"
    echo "3. Install (free, by Apple)"
    echo ""
    echo "Or run: open 'macappstore://apps.apple.com/app/transporter/id1450874784'"
    echo ""
    read -p "Press Enter after installing Transporter..."
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 STEP 2: GET .ipa FILE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "Checking for available builds..."
echo ""

# Check for EAS builds
BUILDS=$(eas build:list --platform ios --limit 1 2>/dev/null || echo "")

if [ -n "$BUILDS" ]; then
    echo "✅ Found builds. To download:"
    echo "   eas build:download [BUILD_ID]"
    echo ""
    echo "Or visit: https://expo.dev/accounts/tstrauss/projects/spectit-mobile/builds"
    echo ""
else
    echo "⚠️  No builds found. You need to build first."
    echo ""
    echo "Options:"
    echo "  1. Build with EAS: eas build --platform ios --profile production"
    echo "  2. Build with Xcode: Product → Archive"
    echo ""
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📤 STEP 3: UPLOAD WITH TRANSPORTER"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "1. Open Transporter app"
echo "2. Sign in with: tanstrauss@gmail.com"
echo "3. Drag your .ipa file into Transporter window"
echo "4. Click 'Deliver' button"
echo "5. Wait for upload (5-10 minutes)"
echo ""

echo "Opening Transporter..."
open -a "Transporter" 2>/dev/null || echo "⚠️  Transporter not found. Please open it manually from Applications."

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ AFTER UPLOAD"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Wait 15-30 minutes for processing"
echo "2. Go to: https://appstoreconnect.apple.com/apps/6755681856"
echo "3. Build will appear in TestFlight tab"
echo "4. Complete app listing"
echo "5. Submit for review"
echo ""

