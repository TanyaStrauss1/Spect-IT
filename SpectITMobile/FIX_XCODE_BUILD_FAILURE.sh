#!/bin/bash

# Fix Xcode Build Failure
# This script fixes common Xcode build issues

set -e

cd "$(dirname "$0")"

echo "🔧 Fixing Xcode Build Failure"
echo "=============================="
echo ""

# Step 1: Clean everything
echo "1️⃣  Cleaning build artifacts..."
rm -rf ~/Library/Developer/Xcode/DerivedData/SpectIT-*
rm -rf ~/Library/Developer/Xcode/DerivedData/Spect-*
rm -rf ios/build
rm -rf build
echo "   ✅ Cleaned derived data and build folders"
echo ""

# Step 2: Reinstall CocoaPods
echo "2️⃣  Reinstalling CocoaPods dependencies..."
cd ios
if [ -d "Pods" ]; then
    rm -rf Pods
    rm -f Podfile.lock
    echo "   ✅ Removed old Pods"
fi

pod install --repo-update
echo "   ✅ CocoaPods reinstalled"
cd ..
echo ""

# Step 3: Verify project settings
echo "3️⃣  Verifying project settings..."
if grep -q "DEVELOPMENT_TEAM = P7BPRR2MY3" ios/SpectIT.xcodeproj/project.pbxproj; then
    echo "   ✅ Team ID correct"
else
    echo "   ❌ Team ID issue"
fi

if grep -q "CODE_SIGN_STYLE = Automatic" ios/SpectIT.xcodeproj/project.pbxproj; then
    echo "   ✅ Code signing automatic"
else
    echo "   ❌ Code signing issue"
fi
echo ""

# Step 4: Fix deployment target warnings
echo "4️⃣  Checking deployment target..."
DEPLOYMENT_TARGET=$(grep "IPHONEOS_DEPLOYMENT_TARGET" ios/SpectIT.xcodeproj/project.pbxproj | grep -v "//" | head -1 | sed 's/.*IPHONEOS_DEPLOYMENT_TARGET = \([^;]*\);.*/\1/')
if [ "$DEPLOYMENT_TARGET" = "15.0" ]; then
    echo "   ✅ Deployment target: $DEPLOYMENT_TARGET"
else
    echo "   ⚠️  Deployment target: $DEPLOYMENT_TARGET (should be 15.0)"
fi
echo ""

# Step 5: Update Podfile to fix deployment target warnings
echo "5️⃣  Updating Podfile to fix deployment target warnings..."
if [ -f "ios/Podfile.properties.json" ]; then
    # Ensure minimum deployment target is 13.4 or higher
    python3 << EOF
import json
import sys

try:
    with open('ios/Podfile.properties.json', 'r') as f:
        data = json.load(f)
    
    # Set minimum deployment target to 13.4 if not set or too low
    if 'ios' not in data:
        data['ios'] = {}
    if 'deploymentTarget' not in data['ios'] or float(data['ios']['deploymentTarget']) < 13.4:
        data['ios']['deploymentTarget'] = '13.4'
    
    with open('ios/Podfile.properties.json', 'w') as f:
        json.dump(data, f, indent=2)
    
    print("   ✅ Updated Podfile.properties.json")
except Exception as e:
    print(f"   ⚠️  Could not update Podfile.properties.json: {e}")
    sys.exit(0)
EOF
else
    echo "   ⚠️  Podfile.properties.json not found"
fi
echo ""

# Step 6: Reinstall pods with updated settings
echo "6️⃣  Reinstalling pods with updated settings..."
cd ios
pod install
cd ..
echo "   ✅ Pods reinstalled"
echo ""

echo "================================"
echo "✅ Build fix complete"
echo ""
echo "📋 Next Steps:"
echo "   1. Open Xcode: open ios/SpectIT.xcworkspace"
echo "   2. Product → Clean Build Folder (Cmd+Shift+K)"
echo "   3. Product → Archive"
echo ""

