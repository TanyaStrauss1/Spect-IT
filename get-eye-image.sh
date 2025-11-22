#!/bin/bash

# Script to download a beautiful eye image for Spect-IT logo
# This downloads from Unsplash (free stock photos)

echo "Downloading beautiful eye image for Spect-IT logo..."

# Option 1: Download from Unsplash (requires direct URL)
# Uncomment and modify the URL below if you have a specific Unsplash image ID

# curl -L "https://images.unsplash.com/photo-[IMAGE_ID]?w=600&h=600&fit=crop&q=80" -o eye-logo.jpg

# Option 2: Use this placeholder - replace with your own image
echo ""
echo "To use a real eye image:"
echo "1. Visit https://unsplash.com/s/photos/beautiful-eye"
echo "2. Download a high-quality eye photo"
echo "3. Save it as 'eye-logo.jpg' in this directory"
echo "4. Or use your own eye photo"
echo ""
echo "The app will automatically use 'eye-logo.jpg' if it exists!"
echo "Falls back to SVG logo if image not found."

