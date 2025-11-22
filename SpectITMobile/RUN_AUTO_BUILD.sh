#!/bin/bash

# Fully Automated iOS Build - Uses expect to handle interactive prompts

cd /Users/tanyastrauss/Spect-IT/SpectITMobile

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║          🍎 AUTOMATED iOS BUILD                                           ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Check EAS login
if ! eas whoami &>/dev/null; then
    echo "❌ Not logged in to EAS. Please run: eas login"
    exit 1
fi
echo "✅ EAS logged in"
echo ""

# Check if expect is available
if ! command -v expect &> /dev/null; then
    echo "❌ 'expect' command not found. Installing..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install expect || {
            echo "❌ Could not install expect. Please install manually: brew install expect"
            exit 1
        }
    else
        echo "❌ Please install expect manually"
        exit 1
    fi
fi

echo "🔨 Starting automated iOS build..."
echo "   Apple ID: tanstrauss@gmail.com"
echo "   You will be prompted for password and 2FA code if needed"
echo ""

# Make expect script executable
chmod +x auto_build_ios.exp

# Run the expect script
./auto_build_ios.exp

if [ $? -eq 0 ]; then
    echo ""
    echo "╔══════════════════════════════════════════════════════════════════════════╗"
    echo "║          ✅ BUILD STARTED!                                               ║"
    echo "╚══════════════════════════════════════════════════════════════════════════╝"
    echo ""
    echo "📊 Monitor your build:"
    echo "   https://expo.dev/accounts/tstrauss/projects/spectit-mobile/builds"
    echo ""
    echo "⏱️  Build time: 10-20 minutes"
    echo ""
else
    echo ""
    echo "❌ Build failed. Check errors above."
    exit 1
fi

