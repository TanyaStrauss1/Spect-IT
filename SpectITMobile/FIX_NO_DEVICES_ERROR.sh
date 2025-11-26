#!/bin/bash

# Fix "No Devices" Error for App Store Build
# This error occurs when Xcode tries to create a development profile
# instead of an App Store distribution profile

set -e

cd "$(dirname "$0")"

echo ""
echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║     🔧 FIX: NO DEVICES ERROR                                             ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

echo "❌ ERROR:"
echo "   'Your team has no devices from which to generate a provisioning profile'"
echo ""
echo "🔍 CAUSE:"
echo "   Xcode is trying to create a DEVELOPMENT profile (needs device)"
echo "   Instead of APP STORE DISTRIBUTION profile (doesn't need device)"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ FIX STEPS IN XCODE:"
echo ""

echo "STEP 1: Select Correct Target"
echo "   1. In Xcode top toolbar"
echo "   2. Click device selector (shows current device/simulator)"
echo "   3. Select 'Any iOS Device' (NOT a simulator!)"
echo "   4. This tells Xcode to build for App Store distribution"
echo ""

echo "STEP 2: Verify Configuration"
echo "   1. Click project (blue icon) → Select 'SpectIT' target"
echo "   2. Go to 'Signing & Capabilities' tab"
echo "   3. ✅ CHECK 'Automatically manage signing'"
echo "   4. Team: UHMT4AX5T7"
echo "   5. Bundle ID: com.spectit.app"
echo "   6. Wait for green checkmark ✅"
echo ""

echo "STEP 3: Use Archive (NOT Build)"
echo "   1. Product → Archive (NOT Product → Build)"
echo "   2. Archive creates App Store distribution profile"
echo "   3. Build tries to create development profile (causes error)"
echo ""

echo "STEP 4: If Still Fails"
echo "   1. Product → Clean Build Folder (⌘⇧K)"
echo "   2. Close Xcode completely"
echo "   3. Delete derived data:"
echo "      rm -rf ~/Library/Developer/Xcode/DerivedData/SpectIT-*"
echo "   4. Reopen Xcode"
echo "   5. Try Archive again"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 QUICK CHECKLIST:"
echo ""
echo "   [ ] Selected 'Any iOS Device' (not simulator)"
echo "   [ ] Using 'Release' configuration"
echo "   [ ] Team is set: UHMT4AX5T7"
echo "   [ ] Using Product → Archive (not Build)"
echo "   [ ] 'Automatically manage signing' is checked"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔧 ALTERNATIVE: Manual Provisioning Profile"
echo ""
echo "   If automatic signing fails:"
echo "   1. Go to: https://developer.apple.com/account/resources/profiles/list"
echo "   2. Click '+' to create new profile"
echo "   3. Select 'App Store' (not Development)"
echo "   4. Select App ID: com.spectit.app"
echo "   5. Select certificate"
echo "   6. Name: 'Spect-IT App Store'"
echo "   7. Download and install"
echo "   8. In Xcode, select this profile manually"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ MOST IMPORTANT:"
echo ""
echo "   • Select 'Any iOS Device' (not simulator)"
echo "   • Use Product → Archive (not Build)"
echo "   • This creates App Store profile (no device needed)"
echo ""

