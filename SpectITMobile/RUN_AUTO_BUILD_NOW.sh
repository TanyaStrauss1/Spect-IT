#!/bin/bash

# Run automatic build - handles authentication interactively

cd /Users/tanyastrauss/Spect-IT/SpectITMobile

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║     🚀 AUTOMATIC BUILD & DEPLOY                                         ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

echo "📋 This script will:"
echo "   1. Build iOS app (15-30 minutes)"
echo "   2. Submit to App Store Connect automatically"
echo ""
echo "⚠️  You will be prompted for Apple ID credentials"
echo ""

read -p "Continue? (y/n): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 0
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 1: Build
echo "📦 Step 1: Building iOS app..."
echo ""

eas build --platform ios --profile production --wait

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Build failed"
    echo "   Check the error messages above"
    exit 1
fi

echo ""
echo "✅ Build completed!"
echo ""

# Step 2: Submit
echo "📤 Step 2: Submitting to App Store Connect..."
echo ""

eas submit --platform ios --latest

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Submission successful!"
    echo ""
    echo "📊 Next Steps:"
    echo "   Go to: https://appstoreconnect.apple.com/apps/6755681856/distribution/ios/version/inflight"
    echo "   Wait 10-30 minutes for build to appear"
    echo "   Select build and submit for review"
else
    echo ""
    echo "⚠️  Submission failed. You can try manually:"
    echo "   eas submit --platform ios --latest"
fi

