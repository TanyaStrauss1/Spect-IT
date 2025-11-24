#!/bin/bash

# Simplified automatic build and deploy
# Uses EAS for build, then submits automatically

cd /Users/tanyastrauss/Spect-IT/SpectITMobile

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║     🚀 AUTOMATIC BUILD & DEPLOY (EAS Method)                           ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Step 1: Build
echo "📦 Step 1: Building iOS app..."
echo "   This takes 15-30 minutes..."
echo ""

eas build --platform ios --profile production --non-interactive --wait

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Build failed"
    exit 1
fi

echo ""
echo "✅ Build completed!"
echo ""

# Step 2: Submit
echo "📤 Step 2: Submitting to App Store Connect..."
echo ""

eas submit --platform ios --latest --non-interactive

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
    echo "⚠️  Submission may have failed. Try manually:"
    echo "   eas submit --platform ios --latest"
fi

