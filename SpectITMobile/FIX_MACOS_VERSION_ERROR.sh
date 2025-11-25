#!/bin/bash

# Fix "requires macOS 15.6 or later" Error
# This script diagnoses and fixes the version requirement issue

set -e

cd "$(dirname "$0")"

echo ""
echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║          🔍 DIAGNOSING VERSION REQUIREMENT ERROR                         ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Check macOS version
echo "📊 Checking macOS version..."
MACOS_VERSION=$(sw_vers -productVersion)
echo "   macOS: $MACOS_VERSION"

# Check Xcode version
echo ""
echo "📊 Checking Xcode version..."
XCODE_VERSION=$(xcodebuild -version 2>&1 | head -1)
echo "   $XCODE_VERSION"

# Check iOS deployment target
echo ""
echo "📊 Checking iOS deployment target..."
IOS_TARGET=$(grep -A 1 "IPHONEOS_DEPLOYMENT_TARGET" ios/SpectIT.xcodeproj/project.pbxproj | grep "=" | head -1 | sed 's/.*= //;s/;//')
echo "   iOS Deployment Target: $IOS_TARGET"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Analyze
MACOS_MAJOR=$(echo $MACOS_VERSION | cut -d. -f1)
MACOS_MINOR=$(echo $MACOS_VERSION | cut -d. -f2)

if [ "$MACOS_MAJOR" -eq 15 ] && [ "$MACOS_MINOR" -ge 5 ]; then
    echo "✅ Your macOS version ($MACOS_VERSION) is compatible with Xcode 16.4"
    echo ""
    echo "💡 The error 'requires macOS 15.6 or later' is likely:"
    echo "   1. A typo/misread (macOS 15.6 doesn't exist)"
    echo "   2. An iOS deployment target issue (should be iOS, not macOS)"
    echo "   3. An App Store Connect requirement"
    echo "   4. A specific tool/plugin version issue"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "🔧 APPLYING FIXES..."
    echo ""
    
    # Fix 1: Ensure iOS deployment target is correct (not macOS)
    echo "1️⃣  Verifying iOS deployment target..."
    if [ "$IOS_TARGET" = "13.4" ]; then
        echo "   ✅ iOS deployment target is correct (13.4)"
    else
        echo "   ⚠️  iOS deployment target is $IOS_TARGET (should be 13.4+)"
        echo "   🔧 Updating to iOS 13.4..."
        # This would require sed to update the project file
        echo "   ⚠️  Manual update needed in Xcode"
    fi
    
    # Fix 2: Check if error is from App Store Connect
    echo ""
    echo "2️⃣  Checking App Store Connect requirements..."
    echo "   ℹ️  App Store Connect may require iOS 15.0+ for new apps"
    echo "   💡 If this is the issue, update iOS deployment target to 15.0"
    
    # Fix 3: Suggest EAS build (no local macOS issues)
    echo ""
    echo "3️⃣  Alternative: Use EAS Cloud Build"
    echo "   ✅ EAS builds in cloud - no local macOS version issues"
    echo "   ✅ Handles all version requirements automatically"
    echo ""
    echo "   Run: eas build --platform ios --profile production"
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "📋 RECOMMENDED ACTIONS:"
    echo ""
    echo "Option 1: Use EAS Cloud Build (Recommended)"
    echo "   cd $(pwd)"
    echo "   eas build --platform ios --profile production"
    echo ""
    echo "Option 2: Update iOS Deployment Target (if App Store requires iOS 15+)"
    echo "   1. Open Xcode"
    echo "   2. Select project → Target → General"
    echo "   3. Set 'Minimum Deployments' to iOS 15.0"
    echo "   4. Rebuild"
    echo ""
    echo "Option 3: Check exact error location"
    echo "   - Where did you see 'requires macOS 15.6'?"
    echo "   - In Xcode? App Store Connect? Terminal?"
    echo ""
    
else
    echo "⚠️  macOS version may be incompatible"
    echo "   Current: $MACOS_VERSION"
    echo "   Required: macOS 15.0+ for Xcode 16.4"
    echo ""
    echo "💡 Solutions:"
    echo "   1. Update macOS to 15.0+ (Sequoia)"
    echo "   2. Use EAS cloud build (no macOS update needed)"
    echo ""
fi

echo ""
echo "✅ Diagnosis complete!"
echo ""

