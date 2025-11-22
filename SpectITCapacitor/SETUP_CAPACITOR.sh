#!/bin/bash

# Setup Capacitor App from Existing Website
# This wraps your website as a native mobile app

cd /Users/tanyastrauss/Spect-IT/SpectITCapacitor

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║          📱 SETTING UP CAPACITOR APP                                     ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Install dependencies
echo "📦 Installing Capacitor dependencies..."
npm install

# Initialize Capacitor
echo ""
echo "🔧 Initializing Capacitor..."
npx cap init "Spect-IT" "com.spectit.app" --web-dir="../website"

# Add iOS platform
echo ""
echo "🍎 Adding iOS platform..."
npx cap add ios

# Add Android platform
echo ""
echo "🤖 Adding Android platform..."
npx cap add android

# Sync files
echo ""
echo "🔄 Syncing files..."
npx cap sync

echo ""
echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║          ✅ CAPACITOR SETUP COMPLETE!                                     ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""
echo "📱 Your website is now wrapped as a native app!"
echo ""
echo "🚀 Next Steps:"
echo ""
echo "1. Open iOS project:"
echo "   cd /Users/tanyastrauss/Spect-IT/SpectITCapacitor"
echo "   npx cap open ios"
echo ""
echo "2. Open Android project:"
echo "   npx cap open android"
echo ""
echo "3. Build and run:"
echo "   • iOS: Build in Xcode"
echo "   • Android: Build in Android Studio"
echo ""
echo "4. Or build with EAS (like before):"
echo "   eas build --platform ios"
echo "   eas build --platform android"
echo ""

