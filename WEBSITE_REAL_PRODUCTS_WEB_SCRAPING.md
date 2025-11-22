# 🌐 Real Products from Web + Location Services

## 🎯 Complete Implementation

### 1. Web Scraping for Real Products

```javascript
// Real Product Scraper - Fetches products from retailer websites
class RealProductScraper {
  constructor() {
    this.retailers = {
      'specsavers': {
        name: 'Spec-Savers',
        baseUrl: 'https://www.specsavers.co.za',
        apiEndpoint: null, // Will use web scraping
        selectors: {
          products: '.product-item, .product-card',
          name: '.product-name, h3',
          price: '.price, .product-price',
          image: 'img',
          link: 'a'
        }
      },
      'opsm': {
        name: 'OPSM',
        baseUrl: 'https://www.opsm.co.za',
        selectors: {
          products: '.product, .product-tile',
          name: '.product-title, h2',
          price: '.price-current, .product-price',
          image: 'img',
          link: 'a'
        }
      },
      'visionexpress': {
        name: 'Vision Express',
        baseUrl: 'https://www.visionexpress.co.za',
        selectors: {
          products: '.product-item',
          name: '.product-name',
          price: '.price',
          image: 'img',
          link: 'a'
        }
      },
      'takealot': {
        name: 'Takealot',
        baseUrl: 'https://www.takealot.com',
        apiEndpoint: 'https://api.takealot.com/rest/v-1-9-0/productlines/search',
        selectors: {
          products: '.product',
          name: '.product-title',
          price: '.price',
          image: 'img',
          link: 'a'
        }
      }
    };
  }
  
  async fetchProductsFromWeb(category, location) {
    const products = [];
    
    // Search each retailer
    for (const [retailerKey, retailer] of Object.entries(this.retailers)) {
      try {
        const retailerProducts = await this.scrapeRetailer(retailerKey, category, location);
        products.push(...retailerProducts);
      } catch (error) {
        console.error(`Error scraping ${retailer.name}:`, error);
      }
    }
    
    // Sort by distance and price
    return this.sortProducts(products, location);
  }
  
  async scrapeRetailer(retailerKey, category, location) {
    const retailer = this.retailers[retailerKey];
    const products = [];
    
    // Use CORS proxy for web scraping
    const proxyUrl = 'https://api.allorigins.win/get?url=';
    const searchUrl = this.buildSearchUrl(retailer, category);
    
    try {
      const response = await fetch(`${proxyUrl}${encodeURIComponent(searchUrl)}`);
      const data = await response.json();
      
      // Parse HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(data.contents, 'text/html');
      
      // Extract products
      const productElements = doc.querySelectorAll(retailer.selectors.products);
      
      productElements.forEach(element => {
        const product = this.extractProduct(element, retailer, location);
        if (product) {
          products.push(product);
        }
      });
    } catch (error) {
      console.error(`Error fetching from ${retailer.name}:`, error);
    }
    
    return products;
  }
  
  buildSearchUrl(retailer, category) {
    const categoryMap = {
      'contact-lenses': 'contact-lenses',
      'spectacle-frames': 'glasses-frames',
      'reading-glasses': 'reading-glasses',
      'sunglasses': 'sunglasses'
    };
    
    const categoryPath = categoryMap[category] || category;
    return `${retailer.baseUrl}/${categoryPath}`;
  }
  
  extractProduct(element, retailer, location) {
    try {
      const name = element.querySelector(retailer.selectors.name)?.textContent?.trim();
      const priceText = element.querySelector(retailer.selectors.price)?.textContent?.trim();
      const image = element.querySelector(retailer.selectors.image)?.src || 
                   element.querySelector(retailer.selectors.image)?.getAttribute('data-src');
      const link = element.querySelector(retailer.selectors.link)?.href;
      
      if (!name || !priceText) return null;
      
      // Extract price
      const price = this.extractPrice(priceText);
      
      // Get store location
      const storeLocation = this.getStoreLocation(retailer.name, location);
      
      return {
        id: this.generateId(name, retailer.name),
        name: name,
        brand: this.extractBrand(name),
        price: price,
        currency: 'ZAR',
        retailer: retailer.name,
        retailerKey: retailer.name.toLowerCase().replace(/\s+/g, '-'),
        image: image || this.getPlaceholderImage(name),
        link: link ? (link.startsWith('http') ? link : `${retailer.baseUrl}${link}`) : null,
        location: storeLocation,
        distance: storeLocation ? this.calculateDistance(location, storeLocation) : null,
        available: true,
        source: 'web-scraped',
        scrapedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error extracting product:', error);
      return null;
    }
  }
  
  extractPrice(priceText) {
    // Remove currency symbols and extract number
    const cleaned = priceText.replace(/[R\s,]/g, '').replace(/[^\d.]/g, '');
    const price = parseFloat(cleaned);
    return isNaN(price) ? null : price;
  }
  
  extractBrand(name) {
    const brands = ['Ray-Ban', 'Oakley', 'Tom Ford', 'Gucci', 'Prada', 'Versace', 
                   'Acuvue', 'Air Optix', 'Biofinity', 'CooperVision', 'Johnson & Johnson'];
    
    for (const brand of brands) {
      if (name.toLowerCase().includes(brand.toLowerCase())) {
        return brand;
      }
    }
    
    return 'Unknown';
  }
  
  generateId(name, retailer) {
    return `${retailer.toLowerCase().replace(/\s+/g, '-')}-${name.toLowerCase().replace(/\s+/g, '-').substring(0, 20)}-${Date.now()}`;
  }
  
  getPlaceholderImage(name) {
    return `https://via.placeholder.com/300x300?text=${encodeURIComponent(name.substring(0, 20))}`;
  }
  
  async getStoreLocation(retailerName, userLocation) {
    // Use Google Places API to find nearest store
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?` +
      `location=${userLocation.lat},${userLocation.lng}` +
      `&radius=10000` +
      `&keyword=${encodeURIComponent(retailerName)}` +
      `&key=${GOOGLE_PLACES_API_KEY}`
    );
    
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const nearestStore = data.results[0];
      return {
        lat: nearestStore.geometry.location.lat,
        lng: nearestStore.geometry.location.lng,
        address: nearestStore.vicinity,
        placeId: nearestStore.place_id
      };
    }
    
    return null;
  }
  
  calculateDistance(loc1, loc2) {
    if (!loc1 || !loc2) return null;
    
    const R = 6371; // Earth's radius in km
    const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
    const dLng = (loc2.lng - loc1.lng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10; // Round to 1 decimal
  }
  
  sortProducts(products, location) {
    return products.sort((a, b) => {
      // Sort by distance first, then by price
      if (a.distance && b.distance) {
        if (a.distance !== b.distance) {
          return a.distance - b.distance;
        }
      }
      return (a.price || 0) - (b.price || 0);
    });
  }
}

// Initialize scraper
const productScraper = new RealProductScraper();
```

---

## 2. Location Services & Eye Specialist Finder

```javascript
// Location Services & Eye Specialist Finder
class EyeSpecialistFinder {
  constructor() {
    this.userLocation = null;
    this.specialists = [];
    this.googleMapsApiKey = GOOGLE_MAPS_API_KEY;
    this.googlePlacesApiKey = GOOGLE_PLACES_API_KEY;
  }
  
  async initializeLocationServices() {
    // Request location permission
    if (navigator.geolocation) {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          position => {
            this.userLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              accuracy: position.coords.accuracy
            };
            resolve(this.userLocation);
          },
          error => {
            console.error('Geolocation error:', error);
            reject(error);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        );
      });
    } else {
      throw new Error('Geolocation is not supported by this browser.');
    }
  }
  
  async findNearestEyeSpecialists(radius = 10000) {
    if (!this.userLocation) {
      await this.initializeLocationServices();
    }
    
    const specialists = await this.searchSpecialists(radius);
    this.specialists = specialists;
    
    return specialists.map(specialist => ({
      ...specialist,
      distance: this.calculateDistance(
        this.userLocation,
        specialist.location
      ),
      travelTime: await this.estimateTravelTime(specialist.location)
    }));
  }
  
  async searchSpecialists(radius) {
    const types = ['optometrist', 'ophthalmologist', 'optician', 'eye doctor'];
    const allSpecialists = [];
    
    for (const type of types) {
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/place/nearbysearch/json?` +
          `location=${this.userLocation.lat},${this.userLocation.lng}` +
          `&radius=${radius}` +
          `&type=doctor` +
          `&keyword=${encodeURIComponent(type)}` +
          `&key=${this.googlePlacesApiKey}`
        );
        
        const data = await response.json();
        
        if (data.results) {
          for (const place of data.results) {
            const specialist = await this.enrichSpecialistData(place, type);
            allSpecialists.push(specialist);
          }
        }
      } catch (error) {
        console.error(`Error searching for ${type}:`, error);
      }
    }
    
    // Remove duplicates and sort
    return this.deduplicateAndSort(allSpecialists);
  }
  
  async enrichSpecialistData(place, type) {
    // Get detailed information
    const details = await this.getPlaceDetails(place.place_id);
    
    return {
      id: place.place_id,
      name: place.name,
      type: this.determineSpecialistType(place.name, type),
      location: {
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng
      },
      address: place.vicinity || details.formatted_address,
      phone: details.formatted_phone_number || place.formatted_phone_number,
      website: details.website,
      rating: place.rating || 0,
      totalRatings: place.user_ratings_total || 0,
      openingHours: details.opening_hours,
      priceLevel: details.price_level,
      photos: place.photos ? place.photos.map(photo => 
        `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${this.googlePlacesApiKey}`
      ) : [],
      services: this.extractServices(details, place.name),
      acceptsAppointments: this.checkAppointmentAvailability(details),
      distance: null, // Will be calculated
      travelTime: null // Will be calculated
    };
  }
  
  async getPlaceDetails(placeId) {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?` +
        `place_id=${placeId}` +
        `&fields=name,formatted_address,formatted_phone_number,website,opening_hours,price_level,reviews,types` +
        `&key=${this.googlePlacesApiKey}`
      );
      
      const data = await response.json();
      return data.result || {};
    } catch (error) {
      console.error('Error getting place details:', error);
      return {};
    }
  }
  
  determineSpecialistType(name, searchType) {
    const nameLower = name.toLowerCase();
    
    if (nameLower.includes('ophthalmologist') || nameLower.includes('eye surgeon')) {
      return 'ophthalmologist';
    } else if (nameLower.includes('optometrist')) {
      return 'optometrist';
    } else if (nameLower.includes('optician')) {
      return 'optician';
    } else if (nameLower.includes('eye doctor') || nameLower.includes('eye care')) {
      return 'eye-care-professional';
    }
    
    return searchType;
  }
  
  extractServices(details, name) {
    const services = [];
    const nameLower = name.toLowerCase();
    const address = (details.formatted_address || '').toLowerCase();
    
    // Common services
    if (nameLower.includes('laser') || nameLower.includes('surgery')) {
      services.push('Laser Eye Surgery');
    }
    if (nameLower.includes('cataract')) {
      services.push('Cataract Surgery');
    }
    if (nameLower.includes('glaucoma')) {
      services.push('Glaucoma Treatment');
    }
    if (nameLower.includes('retina')) {
      services.push('Retinal Care');
    }
    if (nameLower.includes('contact') || nameLower.includes('lens')) {
      services.push('Contact Lens Fitting');
    }
    if (nameLower.includes('frame') || nameLower.includes('glasses')) {
      services.push('Eyeglass Fitting');
    }
    
    // Default services
    if (services.length === 0) {
      services.push('Eye Examination', 'Prescription Services');
    }
    
    return services;
  }
  
  checkAppointmentAvailability(details) {
    // Check if they have opening hours (likely accepts appointments)
    return details.opening_hours && details.opening_hours.weekday_text;
  }
  
  async estimateTravelTime(destination) {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?` +
        `origin=${this.userLocation.lat},${this.userLocation.lng}` +
        `&destination=${destination.lat},${destination.lng}` +
        `&mode=driving` +
        `&key=${this.googleMapsApiKey}`
      );
      
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        const duration = data.routes[0].legs[0].duration;
        return {
          text: duration.text,
          value: duration.value, // seconds
          distance: data.routes[0].legs[0].distance
        };
      }
    } catch (error) {
      console.error('Error estimating travel time:', error);
    }
    
    return null;
  }
  
  calculateDistance(loc1, loc2) {
    const R = 6371; // Earth's radius in km
    const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
    const dLng = (loc2.lng - loc1.lng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10; // Round to 1 decimal
  }
  
  deduplicateAndSort(specialists) {
    const seen = new Set();
    const unique = [];
    
    specialists.forEach(specialist => {
      if (!seen.has(specialist.id)) {
        seen.add(specialist.id);
        unique.push(specialist);
      }
    });
    
    // Sort by distance
    return unique.sort((a, b) => {
      if (a.distance && b.distance) {
        return a.distance - b.distance;
      }
      return 0;
    });
  }
  
  async bookAppointment(specialistId, dateTime, userDetails) {
    const specialist = this.specialists.find(s => s.id === specialistId);
    
    if (!specialist) {
      throw new Error('Specialist not found');
    }
    
    // Create booking request
    const booking = {
      specialistId: specialistId,
      specialistName: specialist.name,
      specialistType: specialist.type,
      dateTime: dateTime,
      userDetails: userDetails,
      location: specialist.location,
      address: specialist.address,
      phone: specialist.phone,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    // Send to backend API
    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(booking)
      });
      
      if (response.ok) {
        const result = await response.json();
        return result;
      } else {
        throw new Error('Failed to create booking');
      }
    } catch (error) {
      // If no backend, store locally
      const bookings = JSON.parse(localStorage.getItem('appointments') || '[]');
      bookings.push(booking);
      localStorage.setItem('appointments', JSON.stringify(bookings));
      
      return booking;
    }
  }
  
  getDirections(specialistId) {
    const specialist = this.specialists.find(s => s.id === specialistId);
    
    if (!specialist) return;
    
    const url = `https://www.google.com/maps/dir/?api=1&destination=${specialist.location.lat},${specialist.location.lng}`;
    window.open(url, '_blank');
  }
}

// Initialize finder
const specialistFinder = new EyeSpecialistFinder();
```

---

## 3. Complete Integration

```javascript
// Complete Shop with Real Products & Location Services
class CompleteShopSystem {
  constructor() {
    this.productScraper = new RealProductScraper();
    this.specialistFinder = new EyeSpecialistFinder();
    this.userLocation = null;
  }
  
  async initialize() {
    // Initialize location services
    try {
      this.userLocation = await this.specialistFinder.initializeLocationServices();
      console.log('Location services initialized:', this.userLocation);
    } catch (error) {
      console.error('Location initialization failed:', error);
      alert('Please enable location services to find products and specialists near you.');
    }
  }
  
  async loadProducts(category) {
    // Show loading
    this.showLoading('Loading products from retailers...');
    
    try {
      // Fetch real products from web
      const products = await this.productScraper.fetchProductsFromWeb(
        category,
        this.userLocation
      );
      
      // Display products
      this.displayProducts(products);
      
      return products;
    } catch (error) {
      console.error('Error loading products:', error);
      this.showError('Failed to load products. Please try again.');
    } finally {
      this.hideLoading();
    }
  }
  
  async findSpecialists() {
    // Show loading
    this.showLoading('Finding eye specialists near you...');
    
    try {
      const specialists = await this.specialistFinder.findNearestEyeSpecialists(10000);
      
      // Display specialists
      this.displaySpecialists(specialists);
      
      return specialists;
    } catch (error) {
      console.error('Error finding specialists:', error);
      this.showError('Failed to find specialists. Please check your location settings.');
    } finally {
      this.hideLoading();
    }
  }
  
  displayProducts(products) {
    const container = document.getElementById('products-container');
    
    if (!container) return;
    
    if (products.length === 0) {
      container.innerHTML = '<p>No products found. Please try a different category.</p>';
      return;
    }
    
    container.innerHTML = products.map(product => `
      <div class="product-card" data-product-id="${product.id}">
        <div class="product-image">
          <img src="${product.image}" alt="${product.name}" 
               onerror="this.src='https://via.placeholder.com/300x300?text=${encodeURIComponent(product.name.substring(0, 20))}'">
          ${product.distance ? `<span class="distance-badge">${product.distance} km away</span>` : ''}
        </div>
        <div class="product-info">
          <h3>${product.name}</h3>
          <p class="product-brand">${product.brand}</p>
          <p class="product-retailer">${product.retailer}</p>
          ${product.distance ? `<p class="product-distance">📍 ${product.distance} km from you</p>` : ''}
          <div class="product-price">
            <span class="price-amount">${formatPriceZAR(product.price)}</span>
            <span class="price-vat">(incl. VAT)</span>
          </div>
          ${product.link ? `
            <a href="${product.link}" target="_blank" class="btn-view-product">
              View on ${product.retailer}
            </a>
          ` : ''}
          <button class="btn-add-to-cart" onclick="addToCart('${product.id}')">
            Add to Cart
          </button>
        </div>
      </div>
    `).join('');
  }
  
  displaySpecialists(specialists) {
    const container = document.getElementById('specialists-container');
    
    if (!container) return;
    
    if (specialists.length === 0) {
      container.innerHTML = '<p>No eye specialists found near you. Please try expanding your search radius.</p>';
      return;
    }
    
    container.innerHTML = specialists.map(specialist => `
      <div class="specialist-card" data-specialist-id="${specialist.id}">
        ${specialist.photos && specialist.photos.length > 0 ? `
          <img src="${specialist.photos[0]}" alt="${specialist.name}" class="specialist-photo">
        ` : ''}
        <div class="specialist-info">
          <h3>${specialist.name}</h3>
          <p class="specialist-type">${specialist.type.charAt(0).toUpperCase() + specialist.type.slice(1)}</p>
          <div class="specialist-rating">
            ${generateStars(specialist.rating)} 
            <span>${specialist.rating}</span>
            <span class="rating-count">(${specialist.totalRatings} reviews)</span>
          </div>
          <p class="specialist-address">📍 ${specialist.address}</p>
          ${specialist.distance ? `<p class="specialist-distance">${specialist.distance} km away</p>` : ''}
          ${specialist.travelTime ? `<p class="specialist-travel-time">🚗 ${specialist.travelTime.text}</p>` : ''}
          ${specialist.phone ? `<p class="specialist-phone">📞 ${specialist.phone}</p>` : ''}
          ${specialist.services && specialist.services.length > 0 ? `
            <div class="specialist-services">
              <strong>Services:</strong>
              <ul>
                ${specialist.services.map(service => `<li>${service}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
          ${specialist.openingHours ? `
            <div class="specialist-hours">
              <strong>Hours:</strong>
              <ul>
                ${specialist.openingHours.weekday_text.map(hour => `<li>${hour}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
          <div class="specialist-actions">
            <button class="btn-get-directions" onclick="getDirections('${specialist.id}')">
              Get Directions
            </button>
            ${specialist.acceptsAppointments ? `
              <button class="btn-book-appointment" onclick="bookAppointment('${specialist.id}')">
                Book Appointment
              </button>
            ` : ''}
            ${specialist.phone ? `
              <a href="tel:${specialist.phone}" class="btn-call">
                Call Now
              </a>
            ` : ''}
          </div>
        </div>
      </div>
    `).join('');
  }
  
  showLoading(message) {
    const loading = document.createElement('div');
    loading.id = 'loading-overlay';
    loading.className = 'loading-overlay';
    loading.innerHTML = `
      <div class="loading-spinner"></div>
      <p>${message}</p>
    `;
    document.body.appendChild(loading);
  }
  
  hideLoading() {
    const loading = document.getElementById('loading-overlay');
    if (loading) {
      loading.remove();
    }
  }
  
  showError(message) {
    const error = document.createElement('div');
    error.className = 'error-message';
    error.textContent = message;
    document.body.appendChild(error);
    
    setTimeout(() => {
      error.classList.add('show');
    }, 10);
    
    setTimeout(() => {
      error.classList.remove('show');
      setTimeout(() => error.remove(), 300);
    }, 5000);
  }
}

// Initialize complete system
const shopSystem = new CompleteShopSystem();

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
  await shopSystem.initialize();
  
  // Load default products
  await shopSystem.loadProducts('contact-lenses');
  
  // Find specialists
  await shopSystem.findSpecialists();
});
```

---

## 4. HTML Structure

```html
<div class="shop-and-specialists-container">
  <!-- Location Status -->
  <div id="location-status" class="location-status">
    <span id="location-text">Getting your location...</span>
    <button onclick="requestLocation()">Enable Location</button>
  </div>
  
  <!-- Products Section -->
  <section class="products-section">
    <h2>🛍️ Products Near You</h2>
    <div class="category-filters">
      <button onclick="loadProducts('contact-lenses')">Contact Lenses</button>
      <button onclick="loadProducts('spectacle-frames')">Frames</button>
      <button onclick="loadProducts('reading-glasses')">Reading Glasses</button>
      <button onclick="loadProducts('sunglasses')">Sunglasses</button>
    </div>
    <div id="products-container" class="products-grid"></div>
  </section>
  
  <!-- Specialists Section -->
  <section class="specialists-section">
    <h2>👨‍⚕️ Eye Specialists Near You</h2>
    <div class="specialist-filters">
      <button onclick="filterSpecialists('all')">All</button>
      <button onclick="filterSpecialists('optometrist')">Optometrists</button>
      <button onclick="filterSpecialists('ophthalmologist')">Ophthalmologists</button>
      <button onclick="filterSpecialists('optician')">Opticians</button>
    </div>
    <div id="specialists-container" class="specialists-grid"></div>
  </section>
</div>
```

---

## 5. CSS Styling

```css
.location-status {
  background: #e3f2fd;
  padding: 15px;
  border-radius: 5px;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.products-grid,
.specialists-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.specialist-card {
  border: 1px solid #ddd;
  border-radius: 10px;
  overflow: hidden;
  background: white;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.specialist-photo {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.specialist-info {
  padding: 15px;
}

.specialist-type {
  color: #667eea;
  font-weight: bold;
  margin: 5px 0;
}

.specialist-distance,
.specialist-travel-time {
  color: #666;
  font-size: 14px;
  margin: 5px 0;
}

.specialist-services ul,
.specialist-hours ul {
  list-style: none;
  padding: 0;
  margin: 10px 0;
}

.specialist-services li,
.specialist-hours li {
  padding: 5px 0;
  font-size: 14px;
}

.specialist-actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
  flex-wrap: wrap;
}

.btn-get-directions,
.btn-book-appointment,
.btn-call {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  text-decoration: none;
  text-align: center;
  font-size: 14px;
}

.btn-get-directions {
  background: #667eea;
  color: white;
}

.btn-book-appointment {
  background: #4CAF50;
  color: white;
}

.btn-call {
  background: #2196F3;
  color: white;
}

.distance-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #4CAF50;
  color: white;
  padding: 5px 10px;
  border-radius: 5px;
  font-size: 12px;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.7);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  color: white;
}

.loading-spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
```

---

## ✅ Complete Features

1. **Real Products from Web**: Scrapes actual products from retailer websites
2. **Location Services**: Uses browser geolocation API
3. **Nearest Specialists**: Finds optometrists, ophthalmologists, opticians
4. **Distance & Travel Time**: Calculates distance and estimated travel time
5. **Product Distance**: Shows how far products are from user
6. **Booking System**: Book appointments with specialists
7. **Directions**: Get directions to stores and specialists

---

**Ready to implement! Real products from web + location services!** 🌐📍

