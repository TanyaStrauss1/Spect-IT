#!/bin/bash

# Xcode Cloud Pre-Build Script
# Runs before building the app

set -e

echo "🚀 Xcode Cloud Pre-Build Script"
echo "================================"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
cd "$CI_WORKSPACE"
npm install

# Install CocoaPods dependencies
echo "📦 Installing CocoaPods..."
cd ios
pod install
cd ..

echo "✅ Pre-build complete"
echo ""
