#!/bin/bash

# Fix Authentication Issues - Step by Step Guide

cd /Users/tanyastrauss/Spect-IT/SpectITMobile

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║          🔐 FIX APPLE ID AUTHENTICATION                                  ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

APPLE_ID="tanstrauss@gmail.com"

echo "❌ Current Issue: Invalid username and password combination"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "🔍 Step 1: Verify Your Password Works"
echo ""
echo "Please test your password manually:"
echo "   1. Go to: https://appleid.apple.com"
echo "   2. Try logging in with:"
echo "      - Apple ID: $APPLE_ID"
echo "      - Password: [Your password]"
echo ""
read -p "Did the password work at appleid.apple.com? (y/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "❌ Password is incorrect!"
    echo ""
    echo "📝 Solution: Reset your password"
    echo "   1. Go to: https://iforgot.apple.com"
    echo "   2. Enter: $APPLE_ID"
    echo "   3. Follow password reset steps"
    echo "   4. Use new password in build command"
    echo ""
    exit 1
fi

echo ""
echo "✅ Password works on website"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "🔍 Step 2: Check 2FA Status"
echo ""
echo "If 2FA is enabled, you need an app-specific password:"
echo ""
read -p "Is 2FA enabled on your Apple ID? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "✅ 2FA is enabled - you need an app-specific password"
    echo ""
    echo "📝 How to create app-specific password:"
    echo "   1. Go to: https://appleid.apple.com"
    echo "   2. Sign in"
    echo "   3. Go to: Security section"
    echo "   4. Find: App-Specific Passwords"
    echo "   5. Click: Generate Password"
    echo "   6. Label it: 'EAS Build' or 'Expo Build'"
    echo "   7. Copy the password (looks like: xxxx-xxxx-xxxx-xxxx)"
    echo ""
    echo "📝 Then use this app-specific password in build command"
    echo "   (NOT your regular Apple ID password)"
    echo ""
    
    read -p "Do you have an app-specific password ready? (y/n): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo ""
        echo "✅ Great! Use the app-specific password when prompted"
        echo ""
        echo "🚀 Now try building again:"
        echo "   ./RUN_AUTO_BUILD_NOW.sh"
        echo ""
        echo "   When asked for password, use the app-specific password"
        exit 0
    else
        echo ""
        echo "⚠️  Please create an app-specific password first"
        echo "   Then run this script again"
        exit 1
    fi
fi

echo ""
echo "✅ 2FA is not enabled"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "🔍 Step 3: Try Alternative Methods"
echo ""
echo "Since password works but EAS build fails, try:"
echo ""
echo "Option A: Use Xcode (Easier authentication)"
echo "   1. Open: ios/SpectIT.xcodeproj in Xcode"
echo "   2. Sign in to Xcode with your Apple ID"
echo "   3. Build and archive from Xcode"
echo "   4. Submit from Xcode Organizer"
echo ""
echo "Option B: Use Transporter App"
echo "   1. Build with EAS (may work after password reset)"
echo "   2. Download .ipa file"
echo "   3. Upload via Transporter app"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "📋 Recommended Next Steps:"
echo ""
echo "1. If 2FA enabled: Create app-specific password"
echo "2. If password wrong: Reset at https://iforgot.apple.com"
echo "3. Try Xcode method (often easier):"
echo "   open ios/SpectIT.xcodeproj"
echo ""

