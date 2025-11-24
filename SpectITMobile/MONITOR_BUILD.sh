#!/bin/bash

# Monitor Build Status

cd /Users/tanyastrauss/Spect-IT/SpectITMobile

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║          📊 MONITORING iOS BUILD                                        ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

echo "📋 Recent iOS builds:"
echo ""

eas build:list --platform ios --limit 5

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "🔗 Monitor in browser:"
echo "   https://expo.dev/accounts/tstrauss/projects/spectit-mobile/builds"
echo ""
echo "⏱️  Build typically takes 15-30 minutes"
echo ""

