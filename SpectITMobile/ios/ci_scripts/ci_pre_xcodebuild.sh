#!/bin/bash
# Pre-build script for Xcode Cloud
# This runs before the build starts

set -e

echo "🚀 Xcode Cloud Pre-Build Script"
echo ""

# Install dependencies if needed
if [ -f "package.json" ]; then
    echo "📦 Installing npm dependencies..."
    npm install
fi

# Install CocoaPods if needed
if [ -f "ios/Podfile" ]; then
    echo "📦 Installing CocoaPods dependencies..."
    cd ios
    pod install
    cd ..
fi

echo "✅ Pre-build complete"
