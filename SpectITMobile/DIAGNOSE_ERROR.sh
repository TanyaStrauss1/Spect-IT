#!/bin/bash

# Comprehensive Error Diagnostic Script

set -e

cd "$(dirname "$0")"

echo ""
echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║          🔍 COMPREHENSIVE ERROR DIAGNOSTIC                                ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Check system
echo "📊 SYSTEM CHECK:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
sw_vers | head -2
xcodebuild -version 2>&1 | head -1
echo ""

# Check project files
echo "📁 PROJECT FILES:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ -f "ios/SpectIT.xcodeproj/project.pbxproj" ]; then
    echo "✅ Xcode project exists"
    DEPLOYMENT_TARGET=$(grep "IPHONEOS_DEPLOYMENT_TARGET" ios/SpectIT.xcodeproj/project.pbxproj | grep "=" | head -1 | sed 's/.*= //;s/;//')
    echo "   iOS Deployment Target: $DEPLOYMENT_TARGET"
else
    echo "❌ Xcode project not found"
fi

if [ -f "app.json" ]; then
    echo "✅ app.json exists"
    BUNDLE_ID=$(grep -A 5 '"ios"' app.json | grep "bundleIdentifier" | head -1 | sed 's/.*"bundleIdentifier": "\([^"]*\)".*/\1/')
    echo "   Bundle ID: $BUNDLE_ID"
else
    echo "❌ app.json not found"
fi
echo ""

# Check recent build logs
echo "📋 RECENT BUILD LOGS:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ -f "build_final.log" ]; then
    echo "✅ build_final.log exists"
    ERROR_COUNT=$(grep -i "error\|failed" build_final.log 2>/dev/null | wc -l | tr -d ' ')
    if [ "$ERROR_COUNT" -gt 0 ]; then
        echo "   ⚠️  Found $ERROR_COUNT error(s)"
        echo ""
        echo "   Recent errors:"
        grep -i "error\|failed" build_final.log | tail -5 | sed 's/^/      /'
    else
        echo "   ✅ No errors found"
    fi
else
    echo "ℹ️  No build_final.log found"
fi
echo ""

# Check EAS build status
echo "☁️  EAS BUILD STATUS:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if command -v eas >/dev/null 2>&1; then
    echo "✅ EAS CLI installed"
    EAS_USER=$(eas whoami 2>&1 | head -1)
    echo "   Logged in as: $EAS_USER"
    echo ""
    echo "   Latest builds:"
    eas build:list --platform ios --limit 3 2>&1 | head -10 || echo "   ⚠️  Could not fetch builds"
else
    echo "❌ EAS CLI not installed"
fi
echo ""

# Check Xcode project validity
echo "🔧 XCODE PROJECT VALIDATION:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ -f "ios/SpectIT.xcodeproj/project.pbxproj" ]; then
    xcodebuild -list -project ios/SpectIT.xcodeproj 2>&1 | head -15 || echo "   ⚠️  Could not validate project"
else
    echo "   ⚠️  Project file not found"
fi
echo ""

# Check dependencies
echo "📦 DEPENDENCIES:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ -d "node_modules" ]; then
    echo "✅ node_modules exists"
else
    echo "❌ node_modules not found - run: npm install"
fi

if [ -d "ios/Pods" ]; then
    echo "✅ CocoaPods installed"
else
    echo "❌ CocoaPods not installed - run: cd ios && pod install"
fi
echo ""

# Check environment variables
echo "🔐 ENVIRONMENT:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ -f ".env" ]; then
    echo "✅ .env file exists"
    if grep -q "EXPO_PUBLIC_GOOGLE_MAPS_API_KEY" .env 2>/dev/null; then
        echo "   ✅ Google Maps API key configured"
    else
        echo "   ⚠️  Google Maps API key not found in .env"
    fi
else
    echo "⚠️  .env file not found"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💡 TO GET SPECIFIC HELP:"
echo ""
echo "   Please share:"
echo "   1. The exact error message"
echo "   2. Where you saw it (Xcode, terminal, App Store Connect, etc.)"
echo "   3. What you were doing when it appeared"
echo ""
echo "   Or run:"
echo "   ./DIAGNOSE_ERROR.sh > error_report.txt"
echo "   (Then share error_report.txt)"
echo ""

