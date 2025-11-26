#!/bin/bash

# Xcode Cloud Pre-Build Script
# Runs before building the app

set -e

echo "🚀 Xcode Cloud Pre-Build Script"
echo "================================"
echo ""

# Navigate to workspace root (SpectITMobile directory)
if [ -d "$CI_WORKSPACE/SpectITMobile" ]; then
    cd "$CI_WORKSPACE/SpectITMobile"
elif [ -f "$CI_WORKSPACE/package.json" ]; then
    cd "$CI_WORKSPACE"
else
    echo "⚠️  Warning: Could not find project root, using CI_WORKSPACE: $CI_WORKSPACE"
    cd "$CI_WORKSPACE"
fi

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
if [ -f "package.json" ]; then
    npm ci --legacy-peer-deps || npm install --legacy-peer-deps
    echo "✅ Node.js dependencies installed"
else
    echo "⚠️  Warning: package.json not found"
fi

# Install CocoaPods dependencies
echo "📦 Installing CocoaPods dependencies..."
if [ -d "ios" ]; then
    cd ios
    if [ -f "Podfile" ]; then
        pod install --repo-update
        echo "✅ CocoaPods dependencies installed"
    else
        echo "⚠️  Warning: Podfile not found"
    fi
    cd ..
else
    echo "⚠️  Warning: ios directory not found"
fi

echo ""
echo "✅ Pre-build complete"
echo ""
