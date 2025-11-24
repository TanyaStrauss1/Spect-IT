#!/bin/bash

# Quick Setup for Xcode Build

cd /Users/tanyastrauss/Spect-IT/SpectITMobile

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║          🍎 SETTING UP FOR XCODE BUILD                                 ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

echo "📱 Step 1: Generating iOS native project..."
echo ""

# Check if iOS folder exists
if [ -d "ios" ]; then
    echo "⚠️  iOS folder already exists"
    read -p "Do you want to regenerate it? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🗑️  Removing existing iOS folder..."
        rm -rf ios
    else
        echo "✅ Using existing iOS folder"
        echo ""
        echo "🚀 Opening Xcode..."
        if [ -f "ios/spectit-mobile.xcworkspace" ]; then
            open ios/spectit-mobile.xcworkspace
        elif [ -f "ios/spectit-mobile.xcodeproj" ]; then
            open ios/spectit-mobile.xcodeproj
        else
            echo "❌ Could not find Xcode project file"
            exit 1
        fi
        exit 0
    fi
fi

# Generate iOS project
echo "⏳ Running expo prebuild..."
npx expo prebuild --platform ios

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ iOS project generated successfully!"
    echo ""
    echo "🚀 Opening Xcode..."
    
    # Try to open workspace first, then project
    if [ -f "ios/spectit-mobile.xcworkspace" ]; then
        open ios/spectit-mobile.xcworkspace
    elif [ -f "ios/spectit-mobile.xcodeproj" ]; then
        open ios/spectit-mobile.xcodeproj
    else
        echo "⚠️  Xcode project not found, but iOS folder was created"
        echo "   Try opening Xcode manually and opening the ios/ folder"
    fi
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "📋 Next Steps:"
    echo ""
    echo "1. Wait for Xcode to open and index the project"
    echo "2. Select your team in Signing & Capabilities"
    echo "3. Select 'Any iOS Device' in the device selector"
    echo "4. Go to Product → Archive"
    echo "5. Follow the prompts to upload to App Store Connect"
    echo ""
    echo "📖 Full guide: See BUILD_WITH_XCODE.md"
    echo ""
else
    echo ""
    echo "❌ Failed to generate iOS project"
    echo "   Check the error messages above"
    exit 1
fi

