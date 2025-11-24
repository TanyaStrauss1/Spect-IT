#!/bin/bash

# Create placeholder assets for Expo app

cd /Users/tanyastrauss/Spect-IT/SpectITMobile

echo "Creating assets folder..."
mkdir -p assets

# Check if we can use sips (macOS built-in)
if command -v sips &> /dev/null; then
    echo "Creating icon.png (1024x1024)..."
    # Create a simple colored square as icon
    sips -z 1024 1024 --setProperty format png /System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/GenericApplicationIcon.icns --out assets/icon.png 2>/dev/null || \
    sips -z 1024 1024 -c 1024 1024 --setProperty format png /System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/GenericDocumentIcon.icns --out assets/icon.png 2>/dev/null || \
    echo "Could not create icon with sips, will create placeholder"
    
    echo "Creating splash.png (1242x2436)..."
    sips -z 2436 1242 --setProperty format png /System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/GenericApplicationIcon.icns --out assets/splash.png 2>/dev/null || \
    echo "Could not create splash with sips, will create placeholder"
    
    echo "Creating favicon.png (48x48)..."
    sips -z 48 48 --setProperty format png /System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/GenericApplicationIcon.icns --out assets/favicon.png 2>/dev/null || \
    echo "Could not create favicon with sips, will create placeholder"
    
    echo "Creating adaptive-icon.png (1024x1024)..."
    sips -z 1024 1024 --setProperty format png /System/Library/CoreServices/CoreTypes.bundle/Contents/Resources/GenericApplicationIcon.icns --out assets/adaptive-icon.png 2>/dev/null || \
    echo "Could not create adaptive-icon with sips, will create placeholder"
fi

# If sips didn't work or files don't exist, create using Python or Node
if [ ! -f "assets/icon.png" ]; then
    echo "Creating placeholder images using Python..."
    python3 << 'EOF'
from PIL import Image, ImageDraw
import os

os.makedirs('assets', exist_ok=True)

# Create icon (1024x1024)
icon = Image.new('RGB', (1024, 1024), color='#667eea')
draw = ImageDraw.Draw(icon)
draw.ellipse([200, 200, 824, 824], fill='white')
icon.save('assets/icon.png')

# Create splash (1242x2436)
splash = Image.new('RGB', (1242, 2436), color='#667eea')
draw = ImageDraw.Draw(splash)
draw.ellipse([400, 800, 842, 1636], fill='white')
splash.save('assets/splash.png')

# Create favicon (48x48)
favicon = Image.new('RGB', (48, 48), color='#667eea')
draw = ImageDraw.Draw(favicon)
draw.ellipse([10, 10, 38, 38], fill='white')
favicon.save('assets/favicon.png')

# Create adaptive-icon (1024x1024)
adaptive = Image.new('RGB', (1024, 1024), color='#667eea')
draw = ImageDraw.Draw(adaptive)
draw.ellipse([200, 200, 824, 824], fill='white')
adaptive.save('assets/adaptive-icon.png')

print("✅ Created all placeholder assets")
EOF
fi

# Verify files exist
if [ -f "assets/icon.png" ]; then
    echo "✅ Assets created successfully!"
    ls -lh assets/
else
    echo "⚠️  Could not create assets automatically"
    echo "   Please create these files manually:"
    echo "   - assets/icon.png (1024x1024)"
    echo "   - assets/splash.png (1242x2436)"
    echo "   - assets/favicon.png (48x48)"
    echo "   - assets/adaptive-icon.png (1024x1024)"
fi

