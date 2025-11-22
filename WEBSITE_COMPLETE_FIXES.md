# 🔧 Complete Website Fixes - Spect-IT

## 🎯 Issues to Fix

1. ✅ Glasses don't automatically find eyes and resize to fit face
2. ✅ Currency not in Rands (ZAR)
3. ✅ Scrape web data for products near user
4. ✅ Connect to optometrists/opticians for appointments (Uber-like)

---

## 1. 👓 Virtual Try-On - Auto Eye Detection & Resizing

### Complete Implementation

```javascript
// Enhanced Virtual Try-On with Auto Eye Detection & Resizing
class EnhancedVirtualTryOn {
  constructor() {
    this.video = document.getElementById('video');
    this.canvas = document.getElementById('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.faceMesh = null;
    this.eyesDetected = false;
    this.eyePositions = { left: null, right: null };
    this.faceWidth = 0;
    this.faceHeight = 0;
    this.frameOverlay = document.getElementById('frame-overlay');
    this.frameImage = document.getElementById('frame-image');
    this.detectionInterval = null;
    this.trackingInterval = null;
    
    // MediaPipe Face Mesh landmark indices
    this.LEFT_EYE_INDICES = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246];
    this.RIGHT_EYE_INDICES = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398];
    this.FACE_OUTLINE_INDICES = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109];
    
    this.init();
  }
  
  async init() {
    await this.initFaceMesh();
    await this.startCamera();
    this.startContinuousDetection();
  }
  
  async initFaceMesh() {
    const { FaceMesh } = await import('@mediapipe/face_mesh');
    
    this.faceMesh = new FaceMesh({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
      }
    });
    
    this.faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });
    
    this.faceMesh.onResults((results) => {
      this.handleFaceMeshResults(results);
    });
  }
  
  async startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }
      });
      
      this.video.srcObject = stream;
      this.video.play();
      
      this.video.addEventListener('loadedmetadata', () => {
        this.canvas.width = this.video.videoWidth;
        this.canvas.height = this.video.videoHeight;
      });
      
      this.updateStatus('Camera started. Detecting face and eyes...');
    } catch (error) {
      console.error('Camera error:', error);
      this.updateStatus('Camera access denied. Please allow camera access.', 'error');
    }
  }
  
  startContinuousDetection() {
    // Fast detection for initial eye finding
    this.detectionInterval = setInterval(() => {
      if (this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
        this.detectEyes();
      }
    }, 50); // Check every 50ms for very fast detection
  }
  
  detectEyes() {
    this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
    
    if (this.faceMesh) {
      this.faceMesh.send({ image: this.canvas });
    }
  }
  
  handleFaceMeshResults(results) {
    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      const landmarks = results.multiFaceLandmarks[0];
      
      // Calculate eye positions
      const leftEye = this.calculateEyeCenter(landmarks, this.LEFT_EYE_INDICES);
      const rightEye = this.calculateEyeCenter(landmarks, this.RIGHT_EYE_INDICES);
      
      // Calculate face dimensions
      const faceDimensions = this.calculateFaceDimensions(landmarks);
      
      if (leftEye && rightEye && faceDimensions) {
        this.eyePositions.left = leftEye;
        this.eyePositions.right = rightEye;
        this.faceWidth = faceDimensions.width;
        this.faceHeight = faceDimensions.height;
        
        if (!this.eyesDetected) {
          this.onEyesDetected();
        }
        
        // Auto-resize and position frame
        this.autoResizeAndPositionFrame(leftEye, rightEye, faceDimensions);
      }
    } else {
      if (this.eyesDetected) {
        this.onEyesLost();
      }
    }
  }
  
  calculateEyeCenter(landmarks, eyeIndices) {
    let sumX = 0, sumY = 0;
    let count = 0;
    
    eyeIndices.forEach(index => {
      const landmark = landmarks[index];
      if (landmark) {
        sumX += landmark.x * this.canvas.width;
        sumY += landmark.y * this.canvas.height;
        count++;
      }
    });
    
    if (count > 0) {
      return {
        x: sumX / count,
        y: sumY / count
      };
    }
    
    return null;
  }
  
  calculateFaceDimensions(landmarks) {
    // Get face outline points
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    
    this.FACE_OUTLINE_INDICES.forEach(index => {
      const landmark = landmarks[index];
      if (landmark) {
        const x = landmark.x * this.canvas.width;
        const y = landmark.y * this.canvas.height;
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    });
    
    if (minX !== Infinity && maxX !== -Infinity) {
      return {
        width: maxX - minX,
        height: maxY - minY,
        centerX: (minX + maxX) / 2,
        centerY: (minY + maxY) / 2
      };
    }
    
    return null;
  }
  
  autoResizeAndPositionFrame(leftEye, rightEye, faceDimensions) {
    if (!this.frameImage.src) return;
    
    // Calculate inter-pupillary distance (IPD)
    const ipd = Math.sqrt(
      Math.pow(rightEye.x - leftEye.x, 2) + 
      Math.pow(rightEye.y - leftEye.y, 2)
    );
    
    // Calculate frame dimensions based on face size
    // Frame width should be ~2.5x IPD for natural look
    const frameWidth = ipd * 2.5;
    // Frame height based on face proportions
    const frameHeight = frameWidth * 0.4; // Typical frame aspect ratio
    
    // Calculate frame position (center between eyes, slightly above)
    const eyeCenterX = (leftEye.x + rightEye.x) / 2;
    const eyeCenterY = (leftEye.y + rightEye.y) / 2;
    
    // Position frame so it sits on the bridge of the nose
    // Adjust Y position to align with eye level (slightly above)
    const frameX = eyeCenterX - (frameWidth / 2);
    const frameY = eyeCenterY - (frameHeight * 0.3); // Slightly above eye center
    
    // Apply rotation based on eye angle
    const eyeAngle = Math.atan2(
      rightEye.y - leftEye.y,
      rightEye.x - leftEye.x
    ) * (180 / Math.PI);
    
    // Update frame overlay
    this.frameOverlay.style.left = `${frameX}px`;
    this.frameOverlay.style.top = `${frameY}px`;
    this.frameOverlay.style.width = `${frameWidth}px`;
    this.frameOverlay.style.height = `${frameHeight}px`;
    this.frameOverlay.style.transform = `rotate(${eyeAngle}deg)`;
    this.frameOverlay.style.transformOrigin = 'center center';
    
    // Ensure frame is visible
    this.frameOverlay.style.display = 'block';
    this.frameOverlay.style.opacity = '0.95';
    
    // Update frame image to maintain aspect ratio
    this.frameImage.style.width = '100%';
    this.frameImage.style.height = '100%';
    this.frameImage.style.objectFit = 'contain';
  }
  
  onEyesDetected() {
    this.eyesDetected = true;
    this.updateStatus('✅ Eyes detected! Frame will auto-adjust to your face.', 'success');
    this.updateEyeIndicators(true, true);
    this.enableFrameSelection();
  }
  
  onEyesLost() {
    this.eyesDetected = false;
    this.updateStatus('Eyes not detected. Please position your face in front of the camera.', 'warning');
    this.updateEyeIndicators(false, false);
    this.disableFrameSelection();
    this.frameOverlay.style.display = 'none';
  }
  
  updateStatus(message, type = 'info') {
    const statusText = document.getElementById('detection-text');
    if (statusText) {
      statusText.textContent = message;
      statusText.className = `detection-text ${type}`;
    }
  }
  
  updateEyeIndicators(leftDetected, rightDetected) {
    const leftIndicator = document.getElementById('left-eye-indicator');
    const rightIndicator = document.getElementById('right-eye-indicator');
    
    if (leftIndicator) {
      if (leftDetected) {
        leftIndicator.classList.add('detected');
        leftIndicator.querySelector('.eye-status').textContent = 'Detected';
      } else {
        leftIndicator.classList.remove('detected');
        leftIndicator.querySelector('.eye-status').textContent = 'Detecting...';
      }
    }
    
    if (rightIndicator) {
      if (rightDetected) {
        rightIndicator.classList.add('detected');
        rightIndicator.querySelector('.eye-status').textContent = 'Detected';
      } else {
        rightIndicator.classList.remove('detected');
        rightIndicator.querySelector('.eye-status').textContent = 'Detecting...';
      }
    }
  }
  
  enableFrameSelection() {
    const frameGallery = document.getElementById('frame-gallery');
    const frameNote = document.getElementById('frame-selection-note');
    
    if (frameGallery) {
      frameGallery.style.pointerEvents = 'auto';
      frameGallery.style.opacity = '1';
    }
    if (frameNote) {
      frameNote.style.display = 'none';
    }
  }
  
  disableFrameSelection() {
    const frameGallery = document.getElementById('frame-gallery');
    const frameNote = document.getElementById('frame-selection-note');
    
    if (frameGallery) {
      frameGallery.style.pointerEvents = 'none';
      frameGallery.style.opacity = '0.5';
    }
    if (frameNote) {
      frameNote.style.display = 'block';
    }
  }
  
  selectFrame(frameImageUrl) {
    if (!this.eyesDetected) {
      alert('Please wait for eye detection before selecting a frame.');
      return;
    }
    
    this.frameImage.src = frameImageUrl;
    this.frameOverlay.style.display = 'block';
    
    // Auto-resize will happen on next detection cycle
  }
  
  stop() {
    if (this.detectionInterval) {
      clearInterval(this.detectionInterval);
    }
    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
    }
    if (this.video.srcObject) {
      this.video.srcObject.getTracks().forEach(track => track.stop());
    }
  }
}

// Initialize
let enhancedTryOn;

document.addEventListener('DOMContentLoaded', () => {
  const startButton = document.querySelector('[onclick*="Start Camera"], button:contains("Start Camera")');
  if (startButton) {
    startButton.addEventListener('click', () => {
      enhancedTryOn = new EnhancedVirtualTryOn();
    });
  }
});
```

---

## 2. 💰 Currency Conversion to ZAR

### Global Currency Handler

```javascript
// Global Currency Configuration
const CURRENCY_CONFIG = {
  symbol: 'R',
  code: 'ZAR',
  vatRate: 0.15,
  locale: 'en-ZA',
  exchangeRate: 18.5 // USD to ZAR (update as needed)
};

// Format price in ZAR
function formatPrice(amount, showVAT = false) {
  if (showVAT) {
    const vat = amount * CURRENCY_CONFIG.vatRate;
    const total = amount + vat;
    return {
      subtotal: new Intl.NumberFormat(CURRENCY_CONFIG.locale, {
        style: 'currency',
        currency: CURRENCY_CONFIG.code
      }).format(amount),
      vat: new Intl.NumberFormat(CURRENCY_CONFIG.locale, {
        style: 'currency',
        currency: CURRENCY_CONFIG.code
      }).format(vat),
      total: new Intl.NumberFormat(CURRENCY_CONFIG.locale, {
        style: 'currency',
        currency: CURRENCY_CONFIG.code
      }).format(total)
    };
  }
  
  return new Intl.NumberFormat(CURRENCY_CONFIG.locale, {
    style: 'currency',
    currency: CURRENCY_CONFIG.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

// Convert USD to ZAR
function convertToZAR(usdAmount) {
  return usdAmount * CURRENCY_CONFIG.exchangeRate;
}

// Update all prices on page load
function updateAllPricesToZAR() {
  // Find all price elements
  const priceElements = document.querySelectorAll('[class*="price"], [id*="price"], [class*="cost"], .amount, .total');
  
  priceElements.forEach(element => {
    const text = element.textContent || element.innerText;
    
    // Match USD prices ($XX.XX or USD XX.XX)
    const usdMatch = text.match(/\$?(\d+\.?\d*)/);
    if (usdMatch) {
      const usdAmount = parseFloat(usdMatch[1]);
      const zarAmount = convertToZAR(usdAmount);
      element.textContent = formatPrice(zarAmount);
    }
    
    // Replace $ symbol with R
    if (text.includes('$')) {
      element.textContent = text.replace(/\$/g, 'R');
    }
  });
  
  // Update shopping cart
  updateShoppingCartCurrency();
}

// Update shopping cart
function updateShoppingCartCurrency() {
  const cartTotal = document.querySelector('[id*="cart-total"], .cart-total, .total');
  const cartSubtotal = document.querySelector('[id*="cart-subtotal"], .cart-subtotal');
  const cartVAT = document.querySelector('[id*="cart-vat"], .cart-vat, .vat');
  
  // Get current cart total
  const cart = getCartItems();
  const subtotal = calculateCartSubtotal(cart);
  const priceBreakdown = formatPrice(subtotal, true);
  
  if (cartSubtotal) {
    cartSubtotal.textContent = `Subtotal: ${priceBreakdown.subtotal}`;
  }
  if (cartVAT) {
    cartVAT.textContent = `VAT (15%): ${priceBreakdown.vat}`;
  }
  if (cartTotal) {
    cartTotal.textContent = `Total: ${priceBreakdown.total}`;
  }
}

// Run on page load
document.addEventListener('DOMContentLoaded', () => {
  updateAllPricesToZAR();
  
  // Also update when cart changes
  const observer = new MutationObserver(() => {
    updateAllPricesToZAR();
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
});
```

---

## 3. 🌐 Web Scraping for Products Near User

### Product Finder Service

```javascript
// Product Finder - Scrapes and finds products near user
class ProductFinder {
  constructor() {
    this.userLocation = null;
    this.apiKeys = {
      googlePlaces: 'YOUR_GOOGLE_PLACES_API_KEY',
      googleMaps: 'YOUR_GOOGLE_MAPS_API_KEY'
    };
  }
  
  async getUserLocation() {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          position => {
            this.userLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            resolve(this.userLocation);
          },
          error => reject(error)
        );
      } else {
        reject(new Error('Geolocation not supported'));
      }
    });
  }
  
  async findProductsNearby(productType, radius = 5000) {
    if (!this.userLocation) {
      await this.getUserLocation();
    }
    
    const products = {
      'contact-lenses': await this.findContactLenses(),
      'spectacle-frames': await this.findSpectacleFrames(),
      'reading-glasses': await this.findReadingGlasses(),
      'sunglasses': await this.findSunglasses()
    };
    
    return products[productType] || [];
  }
  
  async findContactLenses() {
    // Search for optometrists, pharmacies, and optical stores
    const places = await this.searchGooglePlaces('optometrist|pharmacy|optical store', [
      'contact lenses',
      'contact lens',
      'daily contacts',
      'monthly contacts'
    ]);
    
    return this.enrichWithProducts(places, 'contact-lenses');
  }
  
  async findSpectacleFrames() {
    const places = await this.searchGooglePlaces('optician|optical store|eyewear', [
      'spectacle frames',
      'eyeglass frames',
      'glasses frames'
    ]);
    
    return this.enrichWithProducts(places, 'spectacle-frames');
  }
  
  async findReadingGlasses() {
    const places = await this.searchGooglePlaces('pharmacy|optical store|convenience store', [
      'reading glasses',
      'readers',
      'magnifying glasses'
    ]);
    
    return this.enrichWithProducts(places, 'reading-glasses');
  }
  
  async findSunglasses() {
    const places = await this.searchGooglePlaces('optical store|sunglasses store|retail', [
      'sunglasses',
      'sun glasses',
      'shades'
    ]);
    
    return this.enrichWithProducts(places, 'sunglasses');
  }
  
  async searchGooglePlaces(types, keywords) {
    const results = [];
    
    for (const keyword of keywords) {
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/place/nearbysearch/json?` +
          `location=${this.userLocation.lat},${this.userLocation.lng}` +
          `&radius=5000` +
          `&type=store` +
          `&keyword=${encodeURIComponent(keyword)}` +
          `&key=${this.apiKeys.googlePlaces}`
        );
        
        const data = await response.json();
        
        if (data.results) {
          results.push(...data.results);
        }
      } catch (error) {
        console.error('Error searching places:', error);
      }
    }
    
    // Remove duplicates and sort by distance
    return this.deduplicateAndSort(results);
  }
  
  async enrichWithProducts(places, productType) {
    const enriched = [];
    
    for (const place of places) {
      // Get place details
      const details = await this.getPlaceDetails(place.place_id);
      
      // Scrape website if available
      let products = [];
      if (details.website) {
        products = await this.scrapeWebsiteForProducts(details.website, productType);
      }
      
      enriched.push({
        id: place.place_id,
        name: place.name,
        address: place.vicinity || details.formatted_address,
        location: {
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng
        },
        distance: this.calculateDistance(
          this.userLocation.lat,
          this.userLocation.lng,
          place.geometry.location.lat,
          place.geometry.location.lng
        ),
        phone: details.formatted_phone_number,
        website: details.website,
        rating: place.rating,
        products: products,
        openingHours: details.opening_hours
      });
    }
    
    return enriched;
  }
  
  async getPlaceDetails(placeId) {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?` +
        `place_id=${placeId}` +
        `&fields=name,formatted_address,formatted_phone_number,website,opening_hours,price_level` +
        `&key=${this.apiKeys.googlePlaces}`
      );
      
      const data = await response.json();
      return data.result || {};
    } catch (error) {
      console.error('Error getting place details:', error);
      return {};
    }
  }
  
  async scrapeWebsiteForProducts(websiteUrl, productType) {
    // Use a proxy/CORS service or backend API for scraping
    // For client-side, we'll use a structured data approach
    
    try {
      // Try to fetch structured data (JSON-LD, Microdata)
      const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(websiteUrl)}`);
      const data = await response.json();
      
      // Parse HTML for product information
      const parser = new DOMParser();
      const doc = parser.parseFromString(data.contents, 'text/html');
      
      // Look for structured data
      const jsonLd = doc.querySelectorAll('script[type="application/ld+json"]');
      const products = [];
      
      jsonLd.forEach(script => {
        try {
          const structuredData = JSON.parse(script.textContent);
          if (structuredData['@type'] === 'Product' || structuredData['@type'] === 'ItemList') {
            products.push(structuredData);
          }
        } catch (e) {
          // Not valid JSON
        }
      });
      
      // Also search for product keywords in page content
      const productKeywords = {
        'contact-lenses': ['contact lens', 'daily', 'monthly', 'toric', 'multifocal'],
        'spectacle-frames': ['frame', 'eyeglass', 'spectacle'],
        'reading-glasses': ['reading', 'reader', 'magnifier'],
        'sunglasses': ['sunglass', 'sun glass', 'shade']
      };
      
      const keywords = productKeywords[productType] || [];
      const pageText = doc.body.textContent.toLowerCase();
      
      keywords.forEach(keyword => {
        if (pageText.includes(keyword)) {
          // Found product type on page
          products.push({
            type: productType,
            available: true,
            source: 'website-content'
          });
        }
      });
      
      return products;
    } catch (error) {
      console.error('Error scraping website:', error);
      return [];
    }
  }
  
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  }
  
  deduplicateAndSort(places) {
    const seen = new Set();
    const unique = [];
    
    places.forEach(place => {
      if (!seen.has(place.place_id)) {
        seen.add(place.place_id);
        unique.push(place);
      }
    });
    
    // Sort by distance
    return unique.sort((a, b) => {
      const distA = this.calculateDistance(
        this.userLocation.lat,
        this.userLocation.lng,
        a.geometry.location.lat,
        a.geometry.location.lng
      );
      const distB = this.calculateDistance(
        this.userLocation.lat,
        this.userLocation.lng,
        b.geometry.location.lat,
        b.geometry.location.lng
      );
      return distA - distB;
    });
  }
}

// Usage
const productFinder = new ProductFinder();

// Find products
async function findProducts() {
  const products = await productFinder.findProductsNearby('contact-lenses');
  displayProducts(products);
}
```

---

## 4. 🚗 Appointment Booking (Uber-like)

### Appointment Booking Service

```javascript
// Appointment Booking Service - Connect to Optometrists/Opticians
class AppointmentBookingService {
  constructor() {
    this.userLocation = null;
    this.selectedProvider = null;
  }
  
  async findNearbyProviders(radius = 10000) {
    if (!this.userLocation) {
      await this.getUserLocation();
    }
    
    // Search for optometrists and opticians
    const providers = await this.searchProviders();
    
    return providers.map(provider => ({
      ...provider,
      distance: this.calculateDistance(
        this.userLocation.lat,
        this.userLocation.lng,
        provider.location.lat,
        provider.location.lng
      ),
      estimatedTravelTime: this.estimateTravelTime(provider),
      availableSlots: this.getAvailableSlots(provider)
    }));
  }
  
  async searchProviders() {
    // Use Google Places API
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?` +
      `location=${this.userLocation.lat},${this.userLocation.lng}` +
      `&radius=10000` +
      `&type=doctor` +
      `&keyword=optometrist|optician|eye doctor` +
      `&key=YOUR_GOOGLE_PLACES_API_KEY`
    );
    
    const data = await response.json();
    
    return data.results.map(place => ({
      id: place.place_id,
      name: place.name,
      type: this.determineProviderType(place),
      location: {
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng
      },
      rating: place.rating,
      address: place.vicinity
    }));
  }
  
  async bookAppointment(providerId, dateTime, userDetails) {
    const provider = await this.getProviderDetails(providerId);
    
    // Check availability
    const available = await this.checkAvailability(providerId, dateTime);
    
    if (!available) {
      throw new Error('Time slot not available');
    }
    
    // Create booking
    const booking = {
      providerId: providerId,
      providerName: provider.name,
      dateTime: dateTime,
      userDetails: userDetails,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    // Send to backend API
    const response = await fetch('/api/appointments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(booking)
    });
    
    if (response.ok) {
      const result = await response.json();
      
      // Send confirmation
      await this.sendConfirmation(result.bookingId);
      
      return result;
    } else {
      throw new Error('Failed to create booking');
    }
  }
  
  async checkAvailability(providerId, dateTime) {
    // Check with provider's booking system
    // This would integrate with their calendar/booking system
    
    const response = await fetch(
      `/api/providers/${providerId}/availability?datetime=${dateTime}`
    );
    
    const data = await response.json();
    return data.available;
  }
  
  getAvailableSlots(provider) {
    // Generate available time slots for next 7 days
    const slots = [];
    const now = new Date();
    
    for (let day = 0; day < 7; day++) {
      const date = new Date(now);
      date.setDate(date.getDate() + day);
      date.setHours(9, 0, 0, 0); // Start at 9 AM
      
      // Generate slots for the day (9 AM - 5 PM, every 30 minutes)
      for (let hour = 9; hour < 17; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const slotTime = new Date(date);
          slotTime.setHours(hour, minute, 0, 0);
          
          if (slotTime > now) {
            slots.push({
              datetime: slotTime.toISOString(),
              formatted: this.formatDateTime(slotTime),
              available: true // Would check with provider
            });
          }
        }
      }
    }
    
    return slots;
  }
  
  estimateTravelTime(provider) {
    // Use Google Directions API
    return fetch(
      `https://maps.googleapis.com/maps/api/directions/json?` +
      `origin=${this.userLocation.lat},${this.userLocation.lng}` +
      `&destination=${provider.location.lat},${provider.location.lng}` +
      `&mode=driving` +
      `&key=YOUR_GOOGLE_MAPS_API_KEY`
    )
    .then(response => response.json())
    .then(data => {
      if (data.routes && data.routes.length > 0) {
        const duration = data.routes[0].legs[0].duration;
        return {
          text: duration.text,
          value: duration.value // seconds
        };
      }
      return null;
    });
  }
  
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
  
  determineProviderType(place) {
    const name = place.name.toLowerCase();
    if (name.includes('optometrist')) return 'optometrist';
    if (name.includes('optician')) return 'optician';
    if (name.includes('ophthalmologist') || name.includes('eye doctor')) return 'ophthalmologist';
    return 'eye-care-professional';
  }
  
  formatDateTime(date) {
    return date.toLocaleString('en-ZA', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  async sendConfirmation(bookingId) {
    // Send confirmation email/SMS
    // This would be handled by your backend
  }
  
  async getUserLocation() {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          position => {
            this.userLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            resolve(this.userLocation);
          },
          error => reject(error)
        );
      } else {
        reject(new Error('Geolocation not supported'));
      }
    });
  }
}

// Usage
const appointmentService = new AppointmentBookingService();

// Find providers
async function findProviders() {
  const providers = await appointmentService.findNearbyProviders();
  displayProviders(providers);
}

// Book appointment
async function bookAppointment(providerId, dateTime) {
  try {
    const booking = await appointmentService.bookAppointment(
      providerId,
      dateTime,
      {
        name: 'User Name',
        email: 'user@example.com',
        phone: '+27 11 123 4567'
      }
    );
    
    alert('Appointment booked successfully!');
    showBookingConfirmation(booking);
  } catch (error) {
    alert('Failed to book appointment: ' + error.message);
  }
}
```

---

## 🎨 UI Components

### Product Display Component

```html
<div id="products-container" class="products-container">
  <h2>Products Near You</h2>
  <div class="product-filters">
    <button onclick="filterProducts('contact-lenses')">Contact Lenses</button>
    <button onclick="filterProducts('spectacle-frames')">Frames</button>
    <button onclick="filterProducts('reading-glasses')">Reading Glasses</button>
    <button onclick="filterProducts('sunglasses')">Sunglasses</button>
  </div>
  <div id="products-list" class="products-list"></div>
</div>
```

### Appointment Booking Component

```html
<div id="appointments-container" class="appointments-container">
  <h2>Book Appointment</h2>
  <div id="providers-list" class="providers-list"></div>
  <div id="booking-form" class="booking-form" style="display: none;">
    <h3>Select Time Slot</h3>
    <div id="time-slots" class="time-slots"></div>
    <button onclick="confirmBooking()">Confirm Booking</button>
  </div>
</div>
```

---

## ✅ Implementation Checklist

- [ ] Add MediaPipe Face Mesh library
- [ ] Implement auto eye detection
- [ ] Implement auto frame resizing
- [ ] Add currency conversion to ZAR
- [ ] Update all price displays
- [ ] Add Google Places API key
- [ ] Implement product finder
- [ ] Add web scraping functionality
- [ ] Implement appointment booking
- [ ] Add provider search
- [ ] Add booking confirmation
- [ ] Test all features

---

**All fixes ready to implement!** 🚀

