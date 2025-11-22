# 👁️ Logo Image Setup Guide

## How to Add a Real Eye Image

### Option 1: Use Your Own Image (Recommended)

1. **Find or take a beautiful eye photo:**
   - High resolution (at least 600x600px)
   - Clear, well-lit eye
   - Professional quality
   - Square or circular crop works best

2. **Save the image:**
   - Save as `eye-logo.jpg` or `eye-logo.png` in the project root
   - Recommended formats: JPG (smaller file) or PNG (transparency)

3. **The code will automatically use it!**
   - The app is configured to use `eye-logo.jpg` or `eye-logo.png` if it exists
   - Falls back to SVG logo if image not found

### Option 2: Use Stock Photo Services

**Free Stock Photos:**
- **Unsplash**: https://unsplash.com/s/photos/eye (free, high quality)
- **Pexels**: https://www.pexels.com/search/eye/ (free, CC0 license)
- **Pixabay**: https://pixabay.com/images/search/eye/ (free, no attribution needed)

**Search terms to use:**
- "beautiful eye"
- "human eye close up"
- "eye macro"
- "blue eye"
- "green eye"
- "professional eye photography"

### Option 3: AI-Generated Eye Image

Use AI image generators:
- **DALL-E** (OpenAI)
- **Midjourney**
- **Stable Diffusion**
- **Adobe Firefly**

**Prompt example:**
```
"Professional macro photography of a beautiful human eye, 
highly detailed iris, perfect lighting, medical quality, 
sharp focus, studio lighting, professional photography"
```

### Image Requirements

- **Size**: Minimum 300x300px, recommended 600x600px or larger
- **Format**: JPG or PNG
- **File name**: `eye-logo.jpg` or `eye-logo.png`
- **Quality**: High resolution, clear focus on the iris
- **Background**: Transparent or solid color (will be styled)

### Current Setup

The app is configured to:
1. First try to load `eye-logo.jpg`
2. Then try `eye-logo.png`
3. Fall back to SVG logo if neither exists

This allows you to easily swap between real images and the vector logo.

---

## Quick Setup Steps

1. Download or create a beautiful eye image
2. Rename it to `eye-logo.jpg` (or `eye-logo.png`)
3. Place it in `/Users/tanyastrauss/eyetesting/` folder
4. Refresh the browser - the image will appear automatically!

---

**Note:** Make sure you have rights to use the image (your own photo, free stock photo, or purchased license).

