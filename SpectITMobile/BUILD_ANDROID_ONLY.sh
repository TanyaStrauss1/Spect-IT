#!/bin/bash
# Build Android app (workaround for socket file issue)

echo "🚀 Building Android App..."

cd /Users/tanyastrauss/Spect-IT/SpectITMobile

# Check EAS login
eas whoami > /dev/null 2>&1 || {
    echo "⚠️  Not logged in. Running eas login..."
    eas login
}

# Try building with --local flag to avoid socket file issues
echo "Building Android app..."
eas build --platform android --profile production --local

if [ $? -eq 0 ]; then
    echo "✅ Android build successful!"
    echo "Next: Submit with: eas submit --platform android --latest"
else
    echo "❌ Build failed. Trying alternative method..."
    echo "Alternative: Build in Expo cloud (may take longer but avoids local file issues)"
    eas build --platform android --profile production
fi
