#!/bin/bash

# Xcode Cloud Pre-Build Script
# Runs before building the app

# Don't exit on error initially - we want to see what's happening
set -e

echo "🚀 Xcode Cloud Pre-Build Script"
echo "================================"
echo ""
echo "Environment:"
echo "  CI_WORKSPACE: $CI_WORKSPACE"
echo "  PWD: $(pwd)"
echo "  PATH: $PATH"
echo ""

# Function to find project root
find_project_root() {
    local search_path="$1"
    
    # Try multiple possible locations
    if [ -d "$search_path/SpectITMobile" ] && [ -f "$search_path/SpectITMobile/package.json" ]; then
        echo "$search_path/SpectITMobile"
        return 0
    elif [ -f "$search_path/package.json" ]; then
        echo "$search_path"
        return 0
    elif [ -f "package.json" ]; then
        echo "$(pwd)"
        return 0
    fi
    
    return 1
}

# Find project root
PROJECT_ROOT=""
if [ -n "$CI_WORKSPACE" ]; then
    PROJECT_ROOT=$(find_project_root "$CI_WORKSPACE")
fi

if [ -z "$PROJECT_ROOT" ]; then
    # Try current directory
    PROJECT_ROOT=$(find_project_root ".")
fi

if [ -z "$PROJECT_ROOT" ]; then
    echo "❌ Error: Could not find project root"
    echo "Searching in: $CI_WORKSPACE"
    echo "Current directory contents:"
    ls -la || echo "Cannot list current directory"
    if [ -n "$CI_WORKSPACE" ]; then
        echo "CI_WORKSPACE contents:"
        ls -la "$CI_WORKSPACE" || echo "Cannot list CI_WORKSPACE"
    fi
    exit 1
fi

echo "📁 Project root found: $PROJECT_ROOT"
cd "$PROJECT_ROOT"
echo "📁 Changed to: $(pwd)"
echo ""

# Verify we're in the right place
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found in $PROJECT_ROOT"
    exit 1
fi

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
if ! npm ci --legacy-peer-deps 2>&1; then
    echo "⚠️  npm ci failed, trying npm install..."
    if ! npm install --legacy-peer-deps 2>&1; then
        echo "❌ Error: npm install failed"
        exit 1
    fi
fi
echo "✅ Node.js dependencies installed"
echo ""

# Verify node_modules exists
if [ ! -d "node_modules" ]; then
    echo "❌ Error: node_modules directory not created"
    exit 1
fi

# Install CocoaPods dependencies
echo "📦 Installing CocoaPods dependencies..."
IOS_DIR="$PROJECT_ROOT/ios"
if [ ! -d "$IOS_DIR" ]; then
    echo "❌ Error: ios directory not found at $IOS_DIR"
    exit 1
fi

cd "$IOS_DIR"
echo "📁 Changed to iOS directory: $(pwd)"

if [ ! -f "Podfile" ]; then
    echo "❌ Error: Podfile not found at $IOS_DIR/Podfile"
    exit 1
fi

# Check if CocoaPods is available
if ! command -v pod &> /dev/null; then
    echo "⚠️  CocoaPods not in PATH, trying to install..."
    if command -v gem &> /dev/null; then
        gem install cocoapods --no-document || echo "⚠️  Could not install CocoaPods via gem"
    else
        echo "⚠️  gem not found, CocoaPods may not be available"
    fi
fi

# Run pod install
echo "📁 Running pod install in: $(pwd)"
if ! pod install --repo-update 2>&1; then
    echo "⚠️  pod install --repo-update failed, trying pod install..."
    if ! pod install 2>&1; then
        echo "❌ Error: pod install failed"
        echo "Podfile contents:"
        head -20 Podfile || echo "Cannot read Podfile"
        exit 1
    fi
fi
echo "✅ CocoaPods dependencies installed"
echo ""

# Verify xcconfig files exist
XCCONFIG_DIR="$IOS_DIR/Pods/Target Support Files/Pods-SpectIT"
if [ -f "$XCCONFIG_DIR/Pods-SpectIT.release.xcconfig" ]; then
    echo "✅ Verified: Pods-SpectIT.release.xcconfig exists"
else
    echo "⚠️  Warning: Pods-SpectIT.release.xcconfig not found"
    echo "Checking Pods directory structure..."
    if [ -d "$IOS_DIR/Pods" ]; then
        echo "Pods directory exists"
        if [ -d "$IOS_DIR/Pods/Target Support Files" ]; then
            echo "Target Support Files exists"
            ls -la "$IOS_DIR/Pods/Target Support Files/" || echo "Cannot list"
        else
            echo "Target Support Files directory not found"
        fi
    else
        echo "Pods directory not found - pod install may have failed silently"
    fi
fi

echo ""
echo "✅ Pre-build complete"
echo "Final location: $(pwd)"
echo "Project root: $PROJECT_ROOT"
echo ""
