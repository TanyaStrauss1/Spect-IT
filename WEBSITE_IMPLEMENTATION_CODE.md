# 🌐 Spect-IT Website Implementation Code - ZAR Updates

## 💰 Currency Conversion Code

### JavaScript Currency Helper

```javascript
// Currency configuration
const CURRENCY = {
  symbol: 'R',
  code: 'ZAR',
  vatRate: 0.15, // 15% VAT in South Africa
  locale: 'en-ZA'
};

// Format price in ZAR
function formatPrice(amount) {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

// Calculate price with VAT
function calculatePriceWithVAT(amount) {
  return amount * (1 + CURRENCY.vatRate);
}

// Format price with VAT
function formatPriceWithVAT(amount) {
  const withVAT = calculatePriceWithVAT(amount);
  return {
    subtotal: formatPrice(amount),
    vat: formatPrice(amount * CURRENCY.vatRate),
    total: formatPrice(withVAT),
    breakdown: {
      subtotal: amount,
      vat: amount * CURRENCY.vatRate,
      total: withVAT
    }
  };
}
```

---

## 🛒 Shopping Cart Updates

### HTML Update

**Before:**
```html
<div class="shopping-cart">
  <h3>🛒 Shopping Cart (0)</h3>
  <p><strong>Total: $0.00</strong></p>
  <button>Proceed to Checkout</button>
</div>
```

**After:**
```html
<div class="shopping-cart">
  <h3>🛒 Shopping Cart (<span id="cart-count">0</span>)</h3>
  <div class="cart-summary">
    <p>Subtotal: <span id="cart-subtotal">R0.00</span></p>
    <p>VAT (15%): <span id="cart-vat">R0.00</span></p>
    <p><strong>Total: <span id="cart-total">R0.00</span></strong></p>
  </div>
  <button>Proceed to Checkout</button>
  <p class="currency-note">All prices in South African Rands (ZAR). VAT included.</p>
</div>
```

### JavaScript Cart Update

```javascript
// Update cart display
function updateCartDisplay() {
  const cart = getCartItems();
  const subtotal = calculateSubtotal(cart);
  const priceBreakdown = formatPriceWithVAT(subtotal);
  
  document.getElementById('cart-count').textContent = cart.length;
  document.getElementById('cart-subtotal').textContent = priceBreakdown.subtotal;
  document.getElementById('cart-vat').textContent = priceBreakdown.vat;
  document.getElementById('cart-total').textContent = priceBreakdown.total;
}

// Calculate subtotal
function calculateSubtotal(cart) {
  return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}
```

---

## 🏪 Shop Section Updates

### HTML Update

**Before:**
```html
<h2>🛍️ Eyewear Shop</h2>
```

**After:**
```html
<h2>🛍️ Eyewear Shop - South African Retailers</h2>
<p class="shop-description">
  Browse eyewear from leading South African retailers including Spec-Savers, OPSM, 
  and Vision Express. Find frames, contact lenses, and sunglasses. 
  All prices in South African Rands (ZAR).
</p>
```

### Product Pricing Data

```javascript
// Product pricing in ZAR
const PRODUCTS = {
  frames: {
    budget: { min: 500, max: 1500, label: 'Budget Frames' },
    midRange: { min: 1500, max: 4000, label: 'Mid-Range Frames' },
    premium: { min: 4000, max: 10000, label: 'Premium Frames' },
    designer: { min: 10000, max: 20000, label: 'Designer Frames' }
  },
  contactLenses: {
    daily: { min: 200, max: 350, label: 'Daily Disposable (30 pack)' },
    monthly: { min: 250, max: 500, label: 'Monthly (6 pack)' },
    toric: { min: 350, max: 600, label: 'Toric (Astigmatism)' },
    multifocal: { min: 450, max: 800, label: 'Multifocal' }
  },
  sunglasses: {
    basic: { min: 300, max: 1000, label: 'Basic Sunglasses' },
    midRange: { min: 1000, max: 3000, label: 'Mid-Range Sunglasses' },
    premium: { min: 3000, max: 8000, label: 'Premium Sunglasses' },
    designer: { min: 8000, max: 15000, label: 'Designer Sunglasses' }
  }
};

// Display product with ZAR pricing
function displayProduct(product) {
  const priceRange = `${formatPrice(product.min)} - ${formatPrice(product.max)}`;
  return `
    <div class="product-card">
      <h3>${product.label}</h3>
      <p class="price">${priceRange}</p>
      <p class="currency">ZAR</p>
      <button>View Options</button>
    </div>
  `;
}
```

---

## 📍 Find Local Retailers Section

### HTML Update

**Before:**
```html
<h3>📍 Find Local Retailers</h3>
<button>Search Retailers</button>
<button>📍 Use Current Location</button>
```

**After:**
```html
<h3>📍 Find Local Retailers in South Africa</h3>
<p class="retailer-description">
  Discover eyewear retailers and optometrists near you. Search by city, suburb, 
  or use your current location. Connect with Spec-Savers, OPSM, Vision Express, 
  and independent eye care professionals throughout South Africa.
</p>
<div class="search-options">
  <input type="text" id="location-search" placeholder="Search by city or suburb...">
  <button onclick="searchByLocation()">Search Retailers</button>
  <button onclick="useCurrentLocation()">📍 Use Current Location</button>
</div>
<div id="retailer-results"></div>
```

### JavaScript Retailer Search

```javascript
// South African retailers data
const SA_RETAILERS = [
  {
    name: 'Spec-Savers',
    type: 'optician',
    stores: 200,
    phone: '0860 773 227',
    website: 'https://www.specsavers.co.za',
    priceRange: 'R500+',
    cities: ['Johannesburg', 'Cape Town', 'Durban', 'Pretoria', 'Port Elizabeth']
  },
  {
    name: 'OPSM',
    type: 'optician',
    stores: 50,
    phone: '0861 677 677',
    website: 'https://www.opsm.co.za',
    priceRange: 'R1,500+',
    cities: ['Johannesburg', 'Cape Town', 'Durban']
  },
  {
    name: 'Vision Express',
    type: 'optician',
    stores: 100,
    phone: '0861 847 466',
    website: 'https://www.visionexpress.co.za',
    priceRange: 'R800+',
    cities: ['Johannesburg', 'Cape Town', 'Durban', 'Pretoria']
  }
];

// Search retailers
function searchByLocation() {
  const query = document.getElementById('location-search').value;
  const results = SA_RETAILERS.filter(retailer => 
    retailer.cities.some(city => 
      city.toLowerCase().includes(query.toLowerCase())
    )
  );
  displayRetailerResults(results);
}

// Display retailer results
function displayRetailerResults(retailers) {
  const container = document.getElementById('retailer-results');
  container.innerHTML = retailers.map(retailer => `
    <div class="retailer-card">
      <h4>${retailer.name}</h4>
      <p><strong>Type:</strong> ${retailer.type}</p>
      <p><strong>Stores:</strong> ${retailer.stores}+ nationwide</p>
      <p><strong>Price Range:</strong> ${retailer.priceRange}</p>
      <p><strong>Phone:</strong> ${retailer.phone}</p>
      <p><strong>Website:</strong> <a href="${retailer.website}" target="_blank">${retailer.website}</a></p>
      <button onclick="findNearestStore('${retailer.name}')">Find Nearest Store</button>
    </div>
  `).join('');
}
```

---

## 👨‍⚕️ Find Eye Care Professional Section

### HTML Update

**Before:**
```html
<h3>👨‍⚕️ Find Local Eye Care Professional</h3>
```

**After:**
```html
<h3>👨‍⚕️ Find Eye Care Professionals in South Africa</h3>
<p class="professional-description">
  Search for optometrists, ophthalmologists, and opticians near you. 
  Filter by type, distance, and location. Connect with registered eye care 
  professionals throughout South Africa.
</p>
<div class="search-filters">
  <select id="professional-type">
    <option value="all">All Types</option>
    <option value="optometrist">Optometrist</option>
    <option value="ophthalmologist">Ophthalmologist</option>
    <option value="optician">Optician</option>
  </select>
  <select id="distance-filter">
    <option value="5">Within 5 km</option>
    <option value="10">Within 10 km</option>
    <option value="25">Within 25 km</option>
    <option value="50">Within 50 km</option>
  </select>
  <button onclick="searchProfessionals()">Search</button>
</div>
<div id="professional-results"></div>
```

### JavaScript Professional Search

```javascript
// Search professionals
function searchProfessionals() {
  const type = document.getElementById('professional-type').value;
  const distance = parseInt(document.getElementById('distance-filter').value);
  
  // Use location services or search API
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      position => findNearbyProfessionals(position.coords, type, distance),
      error => handleLocationError(error)
    );
  } else {
    alert('Geolocation is not supported by your browser.');
  }
}

// Find nearby professionals
function findNearbyProfessionals(coords, type, maxDistance) {
  // This would integrate with Google Maps API or your backend
  // For now, show example results
  const results = [
    {
      name: 'Rosebank Optometrists',
      type: 'optometrist',
      distance: '2.5 km',
      address: '123 Main Rd, Rosebank, Cape Town',
      phone: '+27 21 685 1234',
      hours: 'Mon-Fri: 8am-5pm SAST'
    }
  ];
  
  displayProfessionalResults(results);
}

// Display professional results
function displayProfessionalResults(professionals) {
  const container = document.getElementById('professional-results');
  container.innerHTML = professionals.map(prof => `
    <div class="professional-card">
      <h4>${prof.name}</h4>
      <p><strong>Type:</strong> ${prof.type}</p>
      <p><strong>Distance:</strong> ${prof.distance}</p>
      <p><strong>Address:</strong> ${prof.address}</p>
      <p><strong>Phone:</strong> ${prof.phone}</p>
      <p><strong>Hours:</strong> ${prof.hours}</p>
      <button onclick="getDirections('${prof.address}')">Get Directions</button>
    </div>
  `).join('');
}
```

---

## 💳 Payment Methods Section

### HTML Update

```html
<div class="payment-methods">
  <h3>Accepted Payment Methods</h3>
  <div class="payment-options">
    <div class="payment-option">
      <img src="/images/visa.png" alt="Visa">
      <span>Visa</span>
    </div>
    <div class="payment-option">
      <img src="/images/mastercard.png" alt="Mastercard">
      <span>Mastercard</span>
    </div>
    <div class="payment-option">
      <img src="/images/snapscan.png" alt="SnapScan">
      <span>SnapScan</span>
    </div>
    <div class="payment-option">
      <img src="/images/zapper.png" alt="Zapper">
      <span>Zapper</span>
    </div>
    <div class="payment-option">
      <img src="/images/payfast.png" alt="PayFast">
      <span>PayFast</span>
    </div>
  </div>
  <p class="payment-note">
    All prices in South African Rands (ZAR). VAT (15%) included where applicable.
    EFT and bank transfer options available.
  </p>
</div>
```

---

## 🏠 Homepage Updates

### HTML Update

**Add to Homepage:**
```html
<section class="south-africa-focus">
  <div class="container">
    <h2>🇿🇦 Serving South Africa</h2>
    <p>
      Spect-IT connects you with eye care professionals and retailers throughout 
      South Africa. Find optometrists, browse eyewear, and monitor your vision 
      health - all in South African Rands (ZAR).
    </p>
    <div class="features">
      <div class="feature">
        <h3>📍 Location-Based Search</h3>
        <p>Find retailers and professionals near you</p>
      </div>
      <div class="feature">
        <h3>💰 ZAR Pricing</h3>
        <p>All prices in South African Rands</p>
      </div>
      <div class="feature">
        <h3>🏪 Local Retailers</h3>
        <p>Spec-Savers, OPSM, Vision Express, and more</p>
      </div>
    </div>
  </div>
</section>
```

---

## 📞 Contact Information Updates

### HTML Update

```html
<div class="contact-info">
  <h3>Contact Us</h3>
  <p><strong>Phone:</strong> <a href="tel:+27111234567">+27 11 123 4567</a></p>
  <p><strong>Email:</strong> <a href="mailto:info@spect-it.com">info@spect-it.com</a></p>
  <p><strong>Address:</strong></p>
  <address>
    123 Main Street<br>
    Sandton<br>
    Johannesburg, Gauteng<br>
    2196<br>
    South Africa
  </address>
  <p><strong>Business Hours:</strong> Monday - Friday: 9:00 - 17:00 SAST</p>
</div>
```

---

## 🎨 CSS Updates

### Currency Styling

```css
.currency-note {
  font-size: 0.9em;
  color: #666;
  font-style: italic;
  margin-top: 10px;
}

.price {
  font-size: 1.5em;
  font-weight: bold;
  color: #667eea;
}

.currency {
  font-size: 0.9em;
  color: #999;
  text-transform: uppercase;
}

.cart-summary {
  margin: 15px 0;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 5px;
}

.cart-summary p {
  margin: 5px 0;
  display: flex;
  justify-content: space-between;
}

.cart-summary p:last-child {
  font-weight: bold;
  font-size: 1.2em;
  border-top: 2px solid #ddd;
  padding-top: 10px;
  margin-top: 10px;
}
```

---

## ✅ Implementation Checklist

### Immediate Updates
- [ ] Replace all `$` with `R` in HTML
- [ ] Update currency formatting functions
- [ ] Add VAT calculation (15%)
- [ ] Update shopping cart display
- [ ] Update product pricing data
- [ ] Add South African retailer information
- [ ] Update location finder text
- [ ] Add payment methods section
- [ ] Update contact information format

### Enhanced Updates
- [ ] Integrate Google Maps API for location search
- [ ] Add retailer database
- [ ] Implement distance calculations
- [ ] Add province/city filters
- [ ] Update timezone to SAST
- [ ] Add South African phone number validation
- [ ] Implement payment gateway integration

---

## 🚀 Quick Implementation Steps

1. **Update Currency Display**
   - Find all instances of `$` and replace with `R`
   - Update currency formatting functions
   - Add VAT calculation

2. **Update Shop Section**
   - Change header to "South African Retailers"
   - Update product pricing to ZAR
   - Add retailer information

3. **Update Location Finder**
   - Change text to "South Africa"
   - Update search functionality
   - Add distance in kilometers

4. **Update Payment Methods**
   - Add South African payment options
   - Update checkout process
   - Add VAT information

5. **Update Contact Information**
   - Format phone numbers (+27)
   - Add South African address format
   - Update timezone (SAST)

---

**All code is ready to implement on https://www.spect-it.com!** 🇿🇦

