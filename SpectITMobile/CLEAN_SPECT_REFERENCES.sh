#!/bin/bash

# Clean old "Spect" references and ensure everything uses SpectIT/Spect-IT

set -e

cd "$(dirname "$0")"

echo ""
echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║          🧹 CLEANING OLD "SPECT" REFERENCES                               ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Clean derived data
echo "1️⃣  Cleaning Xcode derived data..."
rm -rf ~/Library/Developer/Xcode/DerivedData/Spect-* 2>/dev/null || true
rm -rf ~/Library/Developer/Xcode/DerivedData/SpectIT-* 2>/dev/null || true
echo "✅ Derived data cleaned"
echo ""

# Check for old scheme files
echo "2️⃣  Checking for old scheme files..."
OLD_SCHEMES=$(find ios -name "*Spect.xcscheme" 2>/dev/null | grep -v SpectIT || true)
if [ -n "$OLD_SCHEMES" ]; then
    echo "   ⚠️  Found old scheme files:"
    echo "$OLD_SCHEMES" | sed 's/^/      /'
    echo ""
    echo "   💡 Delete these in Xcode:"
    echo "      Product → Scheme → Manage Schemes..."
else
    echo "   ✅ No old scheme files found"
fi
echo ""

# Verify current configuration
echo "3️⃣  Verifying current configuration..."
echo ""

PROJECT_FILE="ios/SpectIT.xcodeproj/project.pbxproj"

if [ -f "$PROJECT_FILE" ]; then
    echo "   Project file: ✅ Found"
    
    # Check PRODUCT_NAME
    PRODUCT_NAME=$(grep "PRODUCT_NAME = " "$PROJECT_FILE" | grep -v "//" | head -1 | sed 's/.*PRODUCT_NAME = \([^;]*\);.*/\1/')
    if [ "$PRODUCT_NAME" = "SpectIT" ]; then
        echo "   PRODUCT_NAME: ✅ SpectIT (correct)"
    else
        echo "   PRODUCT_NAME: ⚠️  $PRODUCT_NAME (should be SpectIT)"
    fi
    
    # Check Bundle ID
    BUNDLE_ID=$(grep "PRODUCT_BUNDLE_IDENTIFIER = " "$PROJECT_FILE" | grep -v "//" | head -1 | sed 's/.*PRODUCT_BUNDLE_IDENTIFIER = \([^;]*\);.*/\1/')
    if [ "$BUNDLE_ID" = "com.spectit.app" ]; then
        echo "   Bundle ID: ✅ com.spectit.app (correct)"
    else
        echo "   Bundle ID: ⚠️  $BUNDLE_ID (should be com.spectit.app)"
    fi
else
    echo "   ⚠️  Project file not found"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 NEXT STEPS IN XCODE:"
echo ""
echo "1. Open Xcode:"
echo "   open ios/SpectIT.xcworkspace"
echo ""
echo "2. Go to Main Project View:"
echo "   - Click project icon (blue, top of left sidebar)"
echo ""
echo "3. Check Scheme:"
echo "   - Look at scheme dropdown (top left)"
echo "   - Should show: 'SpectIT'"
echo "   - If 'Spect' appears:"
echo "     Product → Scheme → Manage Schemes..."
echo "     Delete 'Spect' scheme"
echo ""
echo "4. Verify Target:"
echo "   - Under TARGETS, should see: 'SpectIT'"
echo "   - If 'Spect' appears, it's cached (restart Xcode)"
echo ""
echo "5. Restart Xcode:"
echo "   - Close Xcode completely"
echo "   - Reopen: open ios/SpectIT.xcworkspace"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Cleanup complete! Open Xcode and verify."
echo ""

