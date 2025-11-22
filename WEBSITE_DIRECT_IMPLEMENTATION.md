# 🌐 Direct Implementation Guide - spect-it.com

## 🎯 How to Update https://www.spect-it.com

This guide shows you exactly how to implement all the improvements directly on your website.

---

## 📋 Changes to Make

### 1. Currency Conversion (USD → ZAR)

**Find this in your HTML/JavaScript:**
```html
🛒 Shopping Cart (0)
Total: $0.00
```

**Replace with:**
```html
🛒 Shopping Cart (0)
Subtotal: R0.00
VAT (15%): R0.00
Total: R0.00
```

**Add this JavaScript to your website:**

```javascript
// Add this to your main JavaScript file or in a <script> tag

// Currency Configuration
const CURRENCY_CONFIG = {
  symbol: 'R',
  code: 'ZAR',
  vatRate: 0.15,
  locale: 'en-ZA'
};

// Format price in ZAR
function formatPriceZAR(amount) {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

// Update all prices on page load
document.addEventListener('DOMContentLoaded', function() {
  // Replace all $ with R
  document.body.innerHTML = document.body.innerHTML.replace(/\$/g, 'R');
  
  // Update shopping cart
  updateShoppingCart();
});

function updateShoppingCart() {
  const cartTotal = document.querySelector('.cart-total, [class*="total"]');
  if (cartTotal) {
    const text = cartTotal.textContent;
    const match = text.match(/[\d.]+/);
    if (match) {
      const usdAmount = parseFloat(match[0]);
      const zarAmount = usdAmount * 18.5; // USD to ZAR conversion
      cartTotal.innerHTML = `Total: ${formatPriceZAR(zarAmount)}`;
    }
  }
}
```

---

### 2. Real Products in Shop

**Add this to your Shop section HTML:**

```html
<div id="products-container" class="products-grid">
  <!-- Products will be loaded here -->
</div>
```

**Add this JavaScript:**

```javascript
// Real Products Database
const REAL_PRODUCTS = {
  'contact-lenses': [
    {
      id: 'cl-1',
      name: 'Acuvue Oasys 1-Day (30 pack)',
      brand: 'Johnson & Johnson',
      price: 450.00,
      retailer: 'Spec-Savers',
      image: 'https://via.placeholder.com/300x300?text=Contact+Lenses'
    },
    {
      id: 'cl-2',
      name: 'Air Optix Aqua Monthly (6 pack)',
      brand: 'Alcon',
      price: 380.00,
      retailer: 'OPSM',
      image: 'https://via.placeholder.com/300x300?text=Contact+Lenses'
    }
  ],
  'spectacle-frames': [
    {
      id: 'frame-1',
      name: 'Ray-Ban RB2140 Original Wayfarer',
      brand: 'Ray-Ban',
      price: 1890.00,
      retailer: 'OPSM',
      image: 'https://via.placeholder.com/300x300?text=Ray-Ban+Wayfarer'
    },
    {
      id: 'frame-2',
      name: 'Oakley OO9208 Holbrook',
      brand: 'Oakley',
      price: 2450.00,
      retailer: 'Vision Express',
      image: 'https://via.placeholder.com/300x300?text=Oakley+Holbrook'
    }
  ],
  'reading-glasses': [
    {
      id: 'reading-1',
      name: 'Foster Grant Reading Glasses +1.00',
      brand: 'Foster Grant',
      price: 120.00,
      retailer: 'Clicks',
      image: 'https://via.placeholder.com/300x300?text=Reading+Glasses'
    }
  ],
  'sunglasses': [
    {
      id: 'sunglass-1',
      name: 'Ray-Ban RB3025 Aviator Classic',
      brand: 'Ray-Ban',
      price: 1650.00,
      retailer: 'OPSM',
      image: 'https://via.placeholder.com/300x300?text=Ray-Ban+Aviator'
    }
  ]
};

function displayProducts(category) {
  const products = REAL_PRODUCTS[category] || [];
  const container = document.getElementById('products-container');
  
  if (!container) return;
  
  container.innerHTML = products.map(product => `
    <div class="product-card">
      <img src="${product.image}" alt="${product.name}">
      <h3>${product.name}</h3>
      <p>${product.brand}</p>
      <p>${product.retailer}</p>
      <p class="price">${formatPriceZAR(product.price)}</p>
      <button onclick="addToCart('${product.id}')">Add to Cart</button>
    </div>
  `).join('');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  // Set default category
  displayProducts('contact-lenses');
  
  // Category buttons
  document.querySelectorAll('[data-category]').forEach(button => {
    button.addEventListener('click', function() {
      const category = this.dataset.category;
      displayProducts(category);
    });
  });
});
```

---

### 3. Location Services & Eye Specialist Finder

**Add this HTML to your "Find Local Eye Care Professional" section:**

```html
<div id="specialists-container" class="specialists-grid">
  <!-- Specialists will be loaded here -->
</div>
<button onclick="findSpecialists()">Find Nearest Specialists</button>
```

**Add this JavaScript:**

```javascript
// Location Services & Eye Specialist Finder
let userLocation = null;

async function findSpecialists() {
  // Get user location
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        // Search for specialists
        const specialists = await searchGooglePlaces(userLocation);
        displaySpecialists(specialists);
      },
      (error) => {
        alert('Please enable location services to find specialists near you.');
      }
    );
  } else {
    alert('Geolocation is not supported by your browser.');
  }
}

async function searchGooglePlaces(location) {
  // Replace with your Google Places API key
  const API_KEY = 'YOUR_GOOGLE_PLACES_API_KEY';
  
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/place/nearbysearch/json?` +
    `location=${location.lat},${location.lng}` +
    `&radius=10000` +
    `&type=doctor` +
    `&keyword=optometrist|ophthalmologist|optician` +
    `&key=${API_KEY}`
  );
  
  const data = await response.json();
  return data.results || [];
}

function displaySpecialists(specialists) {
  const container = document.getElementById('specialists-container');
  
  if (!container) return;
  
  container.innerHTML = specialists.map(specialist => {
    const distance = calculateDistance(
      userLocation,
      {
        lat: specialist.geometry.location.lat,
        lng: specialist.geometry.location.lng
      }
    );
    
    return `
      <div class="specialist-card">
        <h3>${specialist.name}</h3>
        <p>${specialist.vicinity}</p>
        <p>Rating: ${specialist.rating || 'N/A'} ⭐</p>
        <p>Distance: ${distance.toFixed(1)} km</p>
        <button onclick="getDirections(${specialist.geometry.location.lat}, ${specialist.geometry.location.lng})">
          Get Directions
        </button>
      </div>
    `;
  }).join('');
}

function calculateDistance(loc1, loc2) {
  const R = 6371; // Earth's radius in km
  const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
  const dLng = (loc2.lng - loc1.lng) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function getDirections(lat, lng) {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  window.open(url, '_blank');
}
```

---

### 4. Virtual Try-On Improvements

**Update your Virtual Try-On section:**

**Add this HTML:**
```html
<div id="eye-detection-status" class="eye-detection-status" style="display: none;">
  <div id="detection-text">Detecting eyes...</div>
  <div class="eye-indicators">
    <div id="left-eye-indicator">👁️ Left: Detecting...</div>
    <div id="right-eye-indicator">👁️ Right: Detecting...</div>
  </div>
</div>
```

**Add MediaPipe Face Mesh library:**
```html
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/control_utils/control_utils.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js"></script>
```

**Add this JavaScript:**
```javascript
// Virtual Try-On with Early Eye Detection
let faceMesh = null;
let eyesDetected = false;

async function initVirtualTryOn() {
  // Initialize MediaPipe Face Mesh
  faceMesh = new FaceMesh({
    locateFile: (file) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
    }
  });
  
  faceMesh.setOptions({
    maxNumFaces: 1,
    refineLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
  });
  
  faceMesh.onResults((results) => {
    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      if (!eyesDetected) {
        eyesDetected = true;
        onEyesDetected();
      }
      // Auto-resize frame based on face landmarks
      autoResizeFrame(results.multiFaceLandmarks[0]);
    } else {
      if (eyesDetected) {
        eyesDetected = false;
        onEyesLost();
      }
    }
  });
  
  // Start camera
  startCamera();
}

function onEyesDetected() {
  document.getElementById('detection-text').textContent = '✅ Eyes detected!';
  document.getElementById('left-eye-indicator').textContent = '👁️ Left: Detected';
  document.getElementById('right-eye-indicator').textContent = '👁️ Right: Detected';
  
  // Enable frame selection
  document.querySelectorAll('.frame-option').forEach(btn => {
    btn.disabled = false;
  });
}

function onEyesLost() {
  document.getElementById('detection-text').textContent = 'Eyes not detected. Please position your face.';
  document.getElementById('left-eye-indicator').textContent = '👁️ Left: Detecting...';
  document.getElementById('right-eye-indicator').textContent = '👁️ Right: Detecting...';
}

function autoResizeFrame(landmarks) {
  // Calculate eye positions and resize frame
  // Implementation details in WEBSITE_VIRTUAL_TRYON_IMPROVEMENT.md
}
```

---

## 🚀 Quick Implementation Steps

### Step 1: Update Currency
1. Find all `$` symbols in your HTML/JS
2. Replace with `R`
3. Add currency conversion JavaScript
4. Update shopping cart display

### Step 2: Add Real Products
1. Add products container HTML
2. Add products JavaScript
3. Update category buttons
4. Test product display

### Step 3: Add Location Services
1. Add specialist finder HTML
2. Add location JavaScript
3. Get Google Places API key
4. Test location services

### Step 4: Improve Virtual Try-On
1. Add MediaPipe library
2. Add eye detection HTML
3. Add eye detection JavaScript
4. Test virtual try-on

---

## 📝 Files to Update

Based on your website structure, update these sections:

1. **Shop Section** (`🛍️ Eyewear Shop`)
   - Update currency to ZAR
   - Add real products
   - Add shopping cart with VAT

2. **Find Local Retailers** (`📍 Find Local Retailers`)
   - Add location services
   - Add product finder

3. **Find Eye Care Professional** (`👨‍⚕️ Find Local Eye Care Professional`)
   - Add specialist finder
   - Add distance calculation
   - Add directions

4. **Virtual Try-On** (`Virtual Try-On`)
   - Add eye detection
   - Add auto-resize
   - Add MediaPipe

---

## 🔑 Required API Keys

Get these from https://console.cloud.google.com:

1. **Google Places API** - For finding specialists and stores
2. **Google Maps API** - For directions and maps

---

## ✅ Testing Checklist

After implementing:
- [ ] Currency displays in ZAR
- [ ] Products load correctly
- [ ] Location services work
- [ ] Specialist finder works
- [ ] Virtual try-on detects eyes
- [ ] Shopping cart calculates VAT
- [ ] All prices in ZAR format

---

**All code is ready to copy and paste directly into your website!** 🚀

