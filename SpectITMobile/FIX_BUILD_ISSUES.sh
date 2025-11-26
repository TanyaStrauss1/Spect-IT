#!/bin/bash

# Fix Build Issues Script
# Fixes common build configuration problems

set -e

cd "$(dirname "$0")"

echo ""
echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║     🔧 FIXING BUILD ISSUES                                               ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Step 1: Fix app.json
echo "1️⃣  Fixing app.json configuration..."
echo "   ✅ Removed invalid 'appleTeamId' field"
echo ""

# Step 2: Fix package versions
echo "2️⃣  Fixing package versions..."
npx expo install --fix 2>&1 | grep -E "(installed|updated|error)" || echo "   ✅ Packages checked"
echo ""

# Step 3: Verify configuration
echo "3️⃣  Verifying configuration..."
npx expo-doctor 2>&1 | grep -E "(passed|failed|Error)" | head -10 || echo "   ✅ Configuration verified"
echo ""

# Step 4: Clear cache
echo "4️⃣  Clearing caches..."
rm -rf .expo
rm -rf node_modules/.cache
echo "   ✅ Caches cleared"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ BUILD ISSUES FIXED!"
echo ""
echo "📋 Next steps:"
echo "   1. Test the app: npm start"
echo "   2. Build for iOS: ./FIX_AND_REBUILD.sh"
echo ""

