#!/bin/bash

# Xcode Cloud Pre-Build Script
# Runs before building the app

set -e

echo "🚀 Xcode Cloud Pre-Build Script"
echo "================================"
echo ""
echo "CI_WORKSPACE: $CI_WORKSPACE"
echo "PWD: $(pwd)"
echo ""

# Navigate to workspace root (SpectITMobile directory)
# Xcode Cloud workspace path: /Volumes/workspace/repository
if [ -d "$CI_WORKSPACE/SpectITMobile" ]; then
    PROJECT_ROOT="$CI_WORKSPACE/SpectITMobile"
    echo "📁 Found project at: $PROJECT_ROOT"
    cd "$PROJECT_ROOT"
elif [ -f "$CI_WORKSPACE/package.json" ]; then
    PROJECT_ROOT="$CI_WORKSPACE"
    echo "📁 Found project at: $PROJECT_ROOT"
    cd "$PROJECT_ROOT"
elif [ -f "package.json" ]; then
    PROJECT_ROOT="$(pwd)"
    echo "📁 Using current directory: $PROJECT_ROOT"
else
    echo "⚠️  Warning: Could not find project root"
    echo "CI_WORKSPACE contents:"
    ls -la "$CI_WORKSPACE" || echo "Cannot list CI_WORKSPACE"
    exit 1
fi

echo "📁 Project root: $PROJECT_ROOT"
echo ""

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
if [ -f "$PROJECT_ROOT/package.json" ]; then
    cd "$PROJECT_ROOT"
    npm ci --legacy-peer-deps || npm install --legacy-peer-deps
    echo "✅ Node.js dependencies installed"
else
    echo "❌ Error: package.json not found at $PROJECT_ROOT/package.json"
    exit 1
fi

# Install CocoaPods dependencies
echo ""
echo "📦 Installing CocoaPods dependencies..."
IOS_DIR="$PROJECT_ROOT/ios"
if [ -d "$IOS_DIR" ]; then
    cd "$IOS_DIR"
    if [ -f "Podfile" ]; then
        echo "📁 Running pod install in: $(pwd)"
        # Ensure CocoaPods is available
        if ! command -v pod &> /dev/null; then
            echo "⚠️  CocoaPods not found, installing..."
            gem install cocoapods --no-document || echo "⚠️  Could not install CocoaPods"
        fi
        # Run pod install
        pod install --repo-update || {
            echo "⚠️  pod install failed, trying without repo-update..."
            pod install || {
                echo "❌ Error: pod install failed"
                exit 1
            }
        }
        echo "✅ CocoaPods dependencies installed"
        
        # Verify xcconfig files exist
        XCCONFIG_DIR="$IOS_DIR/Pods/Target Support Files/Pods-SpectIT"
        if [ -f "$XCCONFIG_DIR/Pods-SpectIT.release.xcconfig" ]; then
            echo "✅ Verified: Pods-SpectIT.release.xcconfig exists"
        else
            echo "⚠️  Warning: Pods-SpectIT.release.xcconfig not found at: $XCCONFIG_DIR"
            echo "Contents of Pods/Target Support Files:"
            ls -la "$IOS_DIR/Pods/Target Support Files/" || echo "Cannot list"
        fi
    else
        echo "❌ Error: Podfile not found at $IOS_DIR/Podfile"
        exit 1
    fi
else
    echo "❌ Error: ios directory not found at $IOS_DIR"
    exit 1
fi

echo ""
echo "✅ Pre-build complete"
echo "Final location: $(pwd)"
echo ""
