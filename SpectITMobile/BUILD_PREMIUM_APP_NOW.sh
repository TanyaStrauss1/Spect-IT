#!/bin/bash

# Build Premium Spect-IT App
# This builds the app with all premium features

cd /Users/tanyastrauss/Spect-IT/SpectITMobile

# Set JAVA_HOME for Android builds
export JAVA_HOME=$(/usr/libexec/java_home -v 17 2>/dev/null || echo "/opt/homebrew/opt/openjdk@17")
export PATH="$JAVA_HOME/bin:$PATH"

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║          ⭐ BUILDING PREMIUM SPECT-IT APP                                ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Verify Java
echo "☕ Java version:"
java -version 2>&1 | head -1
echo ""

# Clean any problematic files
echo "🧹 Cleaning build environment..."
rm -rf .docker 2>/dev/null
rm -rf node_modules/.cache 2>/dev/null

# Check EAS login
if ! eas whoami &>/dev/null; then
    echo "❌ Not logged in to EAS. Please run: eas login"
    exit 1
fi

echo "✅ EAS logged in"
echo ""

# Build Android
echo "🤖 Building Premium Android App..."
echo "   This includes all premium features:"
echo "   ✅ Advanced AI eye tracking"
echo "   ✅ 3D face mapping"
echo "   ✅ Premium analytics dashboard"
echo "   ✅ Professional-grade measurements"
echo ""
echo "⏱️  Build time: 10-20 minutes"
echo ""

eas build --platform android --profile production

if [ $? -eq 0 ]; then
    echo ""
    echo "╔══════════════════════════════════════════════════════════════════════════╗"
    echo "║          ✅ PREMIUM APP BUILD STARTED!                                    ║"
    echo "╚══════════════════════════════════════════════════════════════════════════╝"
    echo ""
    echo "📊 Monitor build at:"
    echo "   https://expo.dev/accounts/tstrauss/projects/spectit-mobile/builds"
    echo ""
    echo "📱 Your premium app will include:"
    echo "   • All premium website features"
    echo "   • Advanced AI capabilities"
    echo "   • Professional analytics"
    echo "   • Clinical-grade measurements"
    echo ""
else
    echo ""
    echo "❌ Build failed. You may need to:"
    echo "   1. Clean the project: rm -rf node_modules && npm install"
    echo "   2. Try building from a clean directory"
    echo "   3. Or build locally using Android Studio"
    exit 1
fi

