#!/bin/bash

# Quick submit script for existing builds

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║          📤 SUBMITTING TO APP STORES                                    ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

cd /Users/tanyastrauss/Spect-IT/SpectITMobile

echo "🤖 Submitting Android app to Google Play Store..."
eas submit --platform android --latest

echo ""
echo "🍎 Submitting iOS app to App Store Connect..."
eas submit --platform ios --latest

echo ""
echo "✅ Submission complete!"
echo ""
echo "📋 Next Steps:"
echo "   • Android: https://play.google.com/console/u/0/developers/6438572372972515481"
echo "   • iOS: https://appstoreconnect.apple.com"
echo ""

