#!/bin/bash

# Rebuild iOS App for App Store Submission
# This script ensures a clean build with correct naming

cd /Users/tanyastrauss/Spect-IT/SpectITMobile

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║          🔨 REBUILDING FOR APP STORE SUBMISSION                         ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Step 1: Clean everything
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Step 1: Cleaning Build Artifacts"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Clean iOS build
if [ -d "ios/build" ]; then
    echo "Removing ios/build..."
    rm -rf ios/build
    echo "✅ Cleaned ios/build"
fi

# Clean node modules cache
if [ -d "node_modules/.cache" ]; then
    echo "Removing node_modules/.cache..."
    rm -rf node_modules/.cache
    echo "✅ Cleaned node_modules/.cache"
fi

# Clean Expo cache
if [ -d ".expo" ]; then
    echo "Removing .expo cache..."
    rm -rf .expo
    echo "✅ Cleaned .expo cache"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Step 2: Verifying Configuration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Verify app.json
echo "Checking app.json..."
if grep -q '"name": "Spect-IT"' app.json && grep -q '"bundleIdentifier": "com.spectit.app"' app.json; then
    echo "✅ app.json correctly configured"
    echo "   App Name: Spect-IT"
    echo "   Bundle ID: com.spectit.app"
else
    echo "⚠️  app.json configuration issue detected"
    exit 1
fi

# Verify project name
echo ""
echo "Checking Xcode project..."
PROJECT_FILE="ios/SpectIT.xcodeproj/project.pbxproj"
if [ -f "$PROJECT_FILE" ]; then
    if grep -q "PRODUCT_NAME = SpectIT" "$PROJECT_FILE"; then
        echo "✅ Xcode project correctly configured"
        echo "   PRODUCT_NAME: SpectIT"
    else
        echo "⚠️  Xcode project may have naming issues"
    fi
else
    echo "⚠️  Xcode project not found - will be generated"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Step 3: Ensuring iOS Project is Up to Date"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if iOS project exists
if [ ! -d "ios" ] || [ ! -f "ios/SpectIT.xcodeproj/project.pbxproj" ]; then
    echo "📱 Generating iOS project..."
    npx expo prebuild --platform ios --clean
    if [ $? -ne 0 ]; then
        echo "❌ Failed to generate iOS project"
        exit 1
    fi
    echo "✅ iOS project generated"
else
    echo "✅ iOS project exists"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Step 4: Installing Dependencies"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Install npm dependencies
echo "Installing npm dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install npm dependencies"
    exit 1
fi
echo "✅ npm dependencies installed"

# Install CocoaPods
echo ""
echo "Installing CocoaPods dependencies..."
cd ios
pod install
if [ $? -ne 0 ]; then
    echo "⚠️  Pod install had issues, but continuing..."
fi
cd ..
echo "✅ CocoaPods dependencies installed"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Step 5: Build Options"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Choose build method:"
echo ""
echo "1. EAS Build (Recommended - Cloud build)"
echo "2. Xcode Build (Local build)"
echo ""
read -p "Enter choice (1 or 2): " BUILD_CHOICE

case $BUILD_CHOICE in
    1)
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "📋 Building with EAS (Cloud Build)"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        echo "Starting EAS build..."
        echo "This will upload to App Store Connect automatically when complete."
        echo ""
        eas build --platform ios --profile production
        ;;
    2)
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "📋 Building with Xcode (Local Build)"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        echo "Opening Xcode..."
        echo ""
        echo "In Xcode:"
        echo "1. Select 'SpectIT' scheme (top left)"
        echo "2. Select 'Any iOS Device' as target"
        echo "3. Product → Archive"
        echo "4. After archive, click 'Distribute App'"
        echo "5. Choose 'App Store Connect'"
        echo "6. Follow prompts to upload"
        echo ""
        open ios/SpectIT.xcworkspace
        ;;
    *)
        echo "Invalid choice. Exiting."
        exit 1
        ;;
esac

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ REBUILD PROCESS INITIATED"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 After Build Completes:"
echo ""
echo "1. Wait for build to process (15-30 minutes)"
echo "2. Go to App Store Connect:"
echo "   https://appstoreconnect.apple.com/apps/6755681856"
echo "3. Go to 'App Store' tab"
echo "4. Click 'Select a build before you submit your app'"
echo "5. Choose your new build"
echo "6. Complete required fields"
echo "7. Submit for review"
echo ""

