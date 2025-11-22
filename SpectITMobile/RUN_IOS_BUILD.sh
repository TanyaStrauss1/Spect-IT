#!/bin/bash
# Run this script to build iOS app interactively

cd /Users/tanyastrauss/Spect-IT/SpectITMobile
echo "🍎 Starting iOS build..."
echo ""
echo "You will be prompted for:"
echo "  • Apple ID: tanstrauss@gmail.com"
echo "  • Password: [Your password]"
echo "  • 2FA Code: [If enabled]"
echo ""
eas build --platform ios --profile production
