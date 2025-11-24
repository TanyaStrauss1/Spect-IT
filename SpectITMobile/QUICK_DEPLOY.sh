#!/bin/bash

# Quick Deploy - One command to build and submit
# Simplest way to deploy Spect-IT

cd /Users/tanyastrauss/Spect-IT/SpectITMobile

echo "🚀 Quick Deploy for Spect-IT"
echo ""
echo "This will:"
echo "  1. Build iOS app (15-30 min)"
echo "  2. Submit to App Store Connect (5-10 min)"
echo ""
echo "You'll be prompted for your NEW Apple ID password"
echo ""

./COMPLETE_BUILD_AND_DEPLOY.sh

