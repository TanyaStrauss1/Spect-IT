#!/bin/bash

# Submit Spect-IT App to App Store - Complete Automation
# This handles the submission process after build is ready

set -e

cd "$(dirname "$0")"

echo ""
echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║     📤 SUBMIT SPECT-IT TO APP STORE - COMPLETE GUIDE                      ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

echo "📋 This script will guide you through submitting your app to the App Store."
echo ""

# Check if build exists in App Store Connect
echo "1️⃣  Checking build status..."
echo ""

echo "   🔗 App Store Connect:"
echo "      https://appstoreconnect.apple.com/apps/6755681856"
echo ""
echo "   📊 Check TestFlight tab for build status"
echo ""

read -p "   Is your build ready in TestFlight? (y/n): " BUILD_READY

if [ "$BUILD_READY" != "y" ] && [ "$BUILD_READY" != "Y" ]; then
    echo ""
    echo "   ⚠️  Please wait for build to process first"
    echo "   → Go to TestFlight tab"
    echo "   → Wait for 'Ready to Submit' status"
    echo "   → Then run this script again"
    exit 0
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "2️⃣  Opening App Store Connect..."
echo ""

# Open App Store Connect
open "https://appstoreconnect.apple.com/apps/6755681856"

echo "   ✅ App Store Connect opened in browser"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "3️⃣  SUBMISSION CHECKLIST..."
echo ""

cat << 'CHECKLIST'

📋 COMPLETE THESE STEPS IN APP STORE CONNECT:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 1: Select Build
   → Go to 'App Store' tab (NOT TestFlight)
   → Scroll to 'Build' section
   → Click 'Select a build before you submit your app'
   → Wait for builds to load (10-30 seconds)
   → Select your build (should show 'Ready to Submit')
   → Click 'Done'

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 2: Complete Required Information

   ✅ App Information:
      → Name: Spect-IT
      → Subtitle: (optional)
      → Category: Health & Fitness or Medical
      → Age Rating: Complete questionnaire (should be 4+ or 12+)

   ✅ Pricing and Availability:
      → Price: Free (or set price)
      → Availability: All countries (or select)

   ✅ Version Information:
      → What's New: (describe your app)
      → Description: (at least 10 characters)
      → Keywords: eye test, vision, optometry, health, medical
      → Support URL: https://www.spect-it.com
      → Marketing URL: (optional)
      → Privacy Policy URL: https://tanyastrauss1.github.io/Spect-IT/privacy-policy.html

   ✅ App Preview and Screenshots:
      → Minimum 3 screenshots per device size:
        • iPhone 6.7" (iPhone 14 Pro Max, iPhone 15 Pro Max)
        • iPhone 6.5" (iPhone 11 Pro Max, iPhone XS Max)
        • iPhone 5.5" (iPhone 8 Plus)
        • iPad Pro 12.9" (if supporting iPad)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STEP 3: Review and Submit

   → Review all information
   → Click 'Submit for Review' button (top right)
   → Confirm submission
   → Wait for Apple's review (typically 1-3 days)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CHECKLIST

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "✅ CHECKLIST DISPLAYED ABOVE"
echo ""
echo "📋 Quick Links:"
echo "   → App Store Connect: https://appstoreconnect.apple.com/apps/6755681856"
echo "   → Privacy Policy: https://tanyastrauss1.github.io/Spect-IT/privacy-policy.html"
echo "   → Support URL: https://www.spect-it.com"
echo ""
echo "🎯 Follow the checklist above to complete your submission!"
echo ""

