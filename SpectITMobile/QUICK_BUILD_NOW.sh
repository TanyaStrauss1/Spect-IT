#!/bin/bash

# Quick Build Script - Run this in your terminal for interactive build

cd /Users/tanyastrauss/Spect-IT/SpectITMobile

echo "🍎 Building iOS app..."
echo ""
echo "You will be prompted for:"
echo "  • Apple ID: tanstrauss@gmail.com"
echo "  • Password: [Enter your password]"
echo "  • 2FA Code: [If enabled]"
echo ""

eas build --platform ios --profile production

