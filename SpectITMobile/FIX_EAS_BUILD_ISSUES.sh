#!/bin/bash

# Fix common EAS build issues

set -e

cd "$(dirname "$0")"

echo ""
echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║          🔧 FIXING EAS BUILD ISSUES                                      ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Check EAS CLI
echo "1️⃣  Checking EAS CLI..."
if ! command -v eas >/dev/null 2>&1; then
    echo "   ❌ EAS CLI not installed"
    echo ""
    echo "   📥 Installing EAS CLI..."
    npm install -g eas-cli
    echo "   ✅ EAS CLI installed"
else
    echo "   ✅ EAS CLI installed"
    eas --version 2>&1 | head -1
fi
echo ""

# Check login
echo "2️⃣  Checking EAS login..."
EAS_USER=$(eas whoami 2>&1 | head -1)
if [ $? -eq 0 ]; then
    echo "   ✅ Logged in as: $EAS_USER"
else
    echo "   ❌ Not logged in"
    echo ""
    echo "   🔐 Please login:"
    echo "   eas login"
    echo ""
    exit 1
fi
echo ""

# Check project configuration
echo "3️⃣  Checking project configuration..."
if [ ! -f "eas.json" ]; then
    echo "   ❌ eas.json not found"
    echo "   Creating eas.json..."
    cat > eas.json << 'EOF'
{
  "cli": {
    "version": ">= 5.2.0"
  },
  "build": {
    "production": {
      "distribution": "store",
      "ios": {
        "simulator": false,
        "distribution": "store"
      },
      "env": {
        "NODE_ENV": "production"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "tanstrauss@gmail.com"
      }
    }
  }
}
EOF
    echo "   ✅ eas.json created"
else
    echo "   ✅ eas.json exists"
fi
echo ""

# Check app.json
echo "4️⃣  Checking app.json..."
if [ ! -f "app.json" ]; then
    echo "   ❌ app.json not found"
    exit 1
else
    echo "   ✅ app.json exists"
    if grep -q '"projectId"' app.json; then
        echo "   ✅ Project ID configured"
    else
        echo "   ⚠️  Project ID not found (may need to run: eas init)"
    fi
fi
echo ""

# Check iOS project
echo "5️⃣  Checking iOS project..."
if [ -d "ios" ]; then
    echo "   ✅ iOS project exists"
    if [ -f "ios/SpectIT.xcworkspace" ] || [ -f "ios/SpectIT.xcodeproj" ]; then
        echo "   ✅ Xcode project found"
    else
        echo "   ⚠️  Xcode project not found"
        echo "   Run: npx expo prebuild --platform ios"
    fi
else
    echo "   ⚠️  iOS directory not found"
    echo "   Run: npx expo prebuild --platform ios"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ DIAGNOSTIC COMPLETE"
echo ""
echo "📋 NEXT STEPS:"
echo ""
echo "If everything looks good, try building:"
echo "   eas build --platform ios --profile production"
echo ""
echo "If you get credential errors:"
echo "   1. Run: eas credentials"
echo "   2. Select iOS → production"
echo "   3. Choose to set up credentials"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

