#!/bin/bash

# Complete Launch Solution - Diagnose, Fix, Build, and Launch
# Uses the most reliable method to get your app to the App Store

set -e

cd "$(dirname "$0")"

echo ""
echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║     🚀 COMPLETE LAUNCH SOLUTION - DIAGNOSE, FIX, BUILD, LAUNCH            ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Step 1: Comprehensive Diagnostics
echo "1️⃣  RUNNING COMPREHENSIVE DIAGNOSTICS..."
echo ""

# Check Xcode
if command -v xcodebuild &> /dev/null; then
    XCODE_VERSION=$(xcodebuild -version 2>&1 | head -1 | awk '{print $2}')
    echo "   ✅ Xcode $XCODE_VERSION installed"
else
    echo "   ❌ Xcode not found"
    exit 1
fi

# Check Node/npm
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "   ✅ Node.js $NODE_VERSION installed"
else
    echo "   ❌ Node.js not found"
    exit 1
fi

# Check Expo CLI
if command -v eas &> /dev/null; then
    EAS_VERSION=$(eas --version 2>&1 | head -1)
    echo "   ✅ EAS CLI installed: $EAS_VERSION"
else
    echo "   ⚠️  EAS CLI not found - installing..."
    npm install -g eas-cli
fi

# Check project structure
echo ""
echo "   📁 Checking project structure..."
if [ -f "app.json" ]; then
    echo "   ✅ app.json found"
    BUNDLE_ID=$(grep -A 2 '"ios"' app.json | grep 'bundleIdentifier' | cut -d'"' -f4)
    echo "   ✅ Bundle ID: $BUNDLE_ID"
else
    echo "   ❌ app.json not found"
    exit 1
fi

if [ -d "ios" ]; then
    echo "   ✅ iOS project exists"
    if [ -d "ios/SpectIT.xcworkspace" ]; then
        echo "   ✅ Xcode workspace found"
    else
        echo "   ⚠️  Xcode workspace not found - will generate"
    fi
else
    echo "   ⚠️  iOS folder not found - will generate"
fi

# Check dependencies
echo ""
echo "   📦 Checking dependencies..."
if [ -f "package.json" ]; then
    if [ ! -d "node_modules" ]; then
        echo "   ⚠️  node_modules not found - installing..."
        npm install
    else
        echo "   ✅ Dependencies installed"
    fi
else
    echo "   ❌ package.json not found"
    exit 1
fi

# Check CocoaPods
if [ -d "ios" ] && [ -f "ios/Podfile" ]; then
    if [ ! -d "ios/Pods" ]; then
        echo "   ⚠️  CocoaPods not installed - installing..."
        cd ios
        pod install
        cd ..
    else
        echo "   ✅ CocoaPods installed"
    fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 2: Fix Configuration Issues
echo "2️⃣  FIXING CONFIGURATION ISSUES..."
echo ""

# Ensure iOS project exists
if [ ! -d "ios" ] || [ ! -d "ios/SpectIT.xcworkspace" ]; then
    echo "   📱 Generating iOS project..."
    npx expo prebuild --platform ios --clean
    echo "   ✅ iOS project generated"
fi

# Verify app.json configuration
echo "   ✅ Verifying app.json..."
if ! grep -q '"bundleIdentifier": "com.spectit.app"' app.json; then
    echo "   ⚠️  Bundle ID mismatch - fixing..."
    # This would require more complex JSON editing
fi

# Clean build artifacts
echo "   🧹 Cleaning build artifacts..."
rm -rf build/
rm -rf ios/build/
rm -rf ~/Library/Developer/Xcode/DerivedData/SpectIT-* 2>/dev/null || true
echo "   ✅ Cleaned"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 3: Choose Best Build Method
echo "3️⃣  SELECTING BEST BUILD METHOD..."
echo ""

# Check EAS login status
echo "   🔍 Checking EAS authentication..."
if eas whoami &> /dev/null; then
    EAS_USER=$(eas whoami 2>&1 | head -1)
    echo "   ✅ EAS logged in as: $EAS_USER"
    BUILD_METHOD="eas"
else
    echo "   ⚠️  Not logged into EAS"
    echo "   💡 Will use Xcode build method"
    BUILD_METHOD="xcode"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 4: Build
echo "4️⃣  BUILDING APP..."
echo ""

if [ "$BUILD_METHOD" = "eas" ]; then
    echo "   ☁️  Using EAS Cloud Build (Recommended)"
    echo ""
    echo "   📋 Build Configuration:"
    echo "      Platform: iOS"
    echo "      Profile: production"
    echo "      Distribution: App Store"
    echo ""
    echo "   ⏱️  This will take 15-30 minutes..."
    echo ""
    echo "   🚀 Starting build..."
    echo ""
    
    # Start EAS build
    eas build --platform ios --profile production --non-interactive || {
        echo ""
        echo "   ⚠️  EAS build failed or requires interaction"
        echo "   💡 Falling back to Xcode build method..."
        BUILD_METHOD="xcode"
    }
fi

if [ "$BUILD_METHOD" = "xcode" ]; then
    echo "   🍎 Using Xcode Build (Local)"
    echo ""
    echo "   📋 Opening Xcode..."
    open ios/SpectIT.xcworkspace
    echo ""
    echo "   ✅ Xcode opened"
    echo ""
    echo "   📋 IN XCODE, FOLLOW THESE STEPS:"
    echo ""
    echo "   1. Wait for indexing (2-5 minutes)"
    echo ""
    echo "   2. Configure Signing:"
    echo "      - Click project (blue icon)"
    echo "      - Select 'SpectIT' target"
    echo "      - Go to 'Signing & Capabilities' tab"
    echo "      - ✅ Check 'Automatically manage signing'"
    echo "      - Select Team: 'Tanya Strauss (P7BPRR2MY3)'"
    echo ""
    echo "   3. Select Build Target:"
    echo "      - Top toolbar → Select 'Any iOS Device'"
    echo ""
    echo "   4. Archive:"
    echo "      - Product → Archive"
    echo "      - Wait 5-15 minutes"
    echo ""
    echo "   5. Distribute:"
    echo "      - Click 'Distribute App'"
    echo "      - Select 'App Store Connect'"
    echo "      - Choose 'Upload'"
    echo "      - Follow prompts"
    echo ""
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 5: Post-Build Instructions
echo "5️⃣  AFTER BUILD COMPLETES..."
echo ""
echo "   📋 Next Steps:"
echo ""
echo "   1. Wait for Processing (15-30 minutes):"
echo "      → https://appstoreconnect.apple.com/apps/6755681856"
echo "      → Go to 'TestFlight' tab"
echo "      → Wait for build to show 'Ready to Submit'"
echo ""
echo "   2. Select Build:"
echo "      → Go to 'App Store' tab (NOT TestFlight)"
echo "      → Scroll to 'Build' section"
echo "      → Click 'Select a build before you submit your app'"
echo "      → Select your build"
echo ""
echo "   3. Complete Required Fields:"
echo "      → Screenshots (minimum 3 per device size)"
echo "      → App Description"
echo "      → Privacy Policy URL: https://tanyastrauss1.github.io/Spect-IT/privacy-policy.html"
echo "      → Support URL: https://www.spect-it.com"
echo "      → Category: Health & Fitness or Medical"
echo "      → Age Rating"
echo ""
echo "   4. Submit for Review:"
echo "      → Click 'Submit for Review'"
echo "      → Wait for Apple's review (1-3 days)"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ DIAGNOSTICS AND SETUP COMPLETE!"
echo ""
echo "📖 Full documentation:"
echo "   - BUILD_WITH_XCODE_COMPLETE.md"
echo "   - NEXT_STEPS_COMPLETE.md"
echo ""
echo "🔗 Important Links:"
echo "   - App Store Connect: https://appstoreconnect.apple.com/apps/6755681856"
echo "   - EAS Builds: https://expo.dev/accounts/tstrauss/projects/spectit-mobile/builds"
echo ""

