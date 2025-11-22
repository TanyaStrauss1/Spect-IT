#!/bin/bash

# Execute Complete Build Process
# This script will guide you through each step

set -e

cd "$(dirname "$0")"

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║          🚀 SPECT-IT iOS BUILD & SUBMIT                                   ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""
echo "Email: strausstanya93@gmail.com"
echo ""

# Step 1: Login
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 1: EAS LOGIN (REQUIRES BROWSER)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⚠️  This will open your browser for authentication"
echo "    Please approve the login"
echo ""
read -p "Press Enter to start login..." 

eas login

echo ""
echo "✅ Login complete!"
eas whoami
echo ""

# Step 2: Build
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 2: BUILD iOS APP"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Building iOS app for App Store..."
echo "This may take 10-20 minutes"
echo ""
read -p "Press Enter to start build..." 

eas build --platform ios --profile production

echo ""
echo "✅ Build complete!"
echo ""

# Step 3: Submit
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "STEP 3: SUBMIT TO APP STORE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
read -p "Press Enter to submit to App Store..." 

eas submit --platform ios --latest

echo ""
echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║          ✅ COMPLETE!                                                     ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""
echo "Next: Complete app listing in App Store Connect"
echo "Link: https://appstoreconnect.apple.com"
echo ""

