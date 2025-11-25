#!/bin/bash

# Update iOS Deployment Target to 15.0 for App Store requirements

set -e

cd "$(dirname "$0")"

echo ""
echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║          🔧 UPDATING iOS DEPLOYMENT TARGET TO 15.0                       ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

PROJECT_FILE="ios/SpectIT.xcodeproj/project.pbxproj"

if [ ! -f "$PROJECT_FILE" ]; then
    echo "❌ Xcode project file not found: $PROJECT_FILE"
    exit 1
fi

echo "📝 Current iOS deployment target:"
grep "IPHONEOS_DEPLOYMENT_TARGET" "$PROJECT_FILE" | grep "=" | head -1

echo ""
echo "🔧 Updating to iOS 15.0..."

# Backup
cp "$PROJECT_FILE" "$PROJECT_FILE.backup"
echo "   ✅ Backup created: $PROJECT_FILE.backup"

# Update all instances
sed -i '' 's/IPHONEOS_DEPLOYMENT_TARGET = 13.4;/IPHONEOS_DEPLOYMENT_TARGET = 15.0;/g' "$PROJECT_FILE"

echo ""
echo "✅ Updated iOS deployment target to 15.0"
echo ""
echo "📝 New iOS deployment target:"
grep "IPHONEOS_DEPLOYMENT_TARGET" "$PROJECT_FILE" | grep "=" | head -1

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 NEXT STEPS:"
echo ""
echo "1. Clean build folder in Xcode:"
echo "   Product → Clean Build Folder (Cmd+Shift+K)"
echo ""
echo "2. Rebuild:"
echo "   Product → Archive"
echo ""
echo "OR use EAS cloud build:"
echo "   eas build --platform ios --profile production"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

