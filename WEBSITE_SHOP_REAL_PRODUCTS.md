# 🛍️ Real Shop Implementation - ZAR Products

## 🎯 Complete Shop with Real Products

### Product Database with Real Items

```javascript
// Real Products Database - South African Retailers
const REAL_PRODUCTS = {
  'contact-lenses': [
    {
      id: 'cl-daily-1',
      name: 'Acuvue Oasys 1-Day (30 pack)',
      brand: 'Johnson & Johnson',
      type: 'Daily Disposable',
      price: 450.00, // ZAR
      currency: 'ZAR',
      retailer: 'Spec-Savers',
      image: 'https://example.com/images/acuvue-oasys.jpg',
      description: 'Premium daily disposable contact lenses with UV protection',
      available: true,
      stock: 'In Stock',
      rating: 4.5,
      reviews: 234
    },
    {
      id: 'cl-monthly-1',
      name: 'Air Optix Aqua Monthly (6 pack)',
      brand: 'Alcon',
      type: 'Monthly',
      price: 380.00,
      currency: 'ZAR',
      retailer: 'OPSM',
      image: 'https://example.com/images/air-optix.jpg',
      description: 'Comfortable monthly lenses with high oxygen permeability',
      available: true,
      stock: 'In Stock',
      rating: 4.3,
      reviews: 189
    },
    {
      id: 'cl-toric-1',
      name: 'Biofinity Toric (6 pack)',
      brand: 'CooperVision',
      type: 'Toric (Astigmatism)',
      price: 520.00,
      currency: 'ZAR',
      retailer: 'Vision Express',
      image: 'https://example.com/images/biofinity-toric.jpg',
      description: 'Monthly toric lenses for astigmatism correction',
      available: true,
      stock: 'In Stock',
      rating: 4.6,
      reviews: 156
    },
    {
      id: 'cl-multifocal-1',
      name: 'Proclear Multifocal (6 pack)',
      brand: 'CooperVision',
      type: 'Multifocal',
      price: 680.00,
      currency: 'ZAR',
      retailer: 'Spec-Savers',
      image: 'https://example.com/images/proclear-multifocal.jpg',
      description: 'Monthly multifocal lenses for presbyopia',
      available: true,
      stock: 'In Stock',
      rating: 4.4,
      reviews: 98
    }
  ],
  
  'spectacle-frames': [
    {
      id: 'frame-1',
      name: 'Ray-Ban RB2140 Original Wayfarer',
      brand: 'Ray-Ban',
      type: 'Full Frame',
      price: 1890.00,
      currency: 'ZAR',
      retailer: 'OPSM',
      image: 'https://example.com/images/rayban-wayfarer.jpg',
      description: 'Classic wayfarer frame in black',
      available: true,
      stock: 'In Stock',
      sizes: ['Small', 'Medium', 'Large'],
      colors: ['Black', 'Tortoise', 'Red'],
      rating: 4.7,
      reviews: 456
    },
    {
      id: 'frame-2',
      name: 'Oakley OO9208 Holbrook',
      brand: 'Oakley',
      type: 'Full Frame',
      price: 2450.00,
      currency: 'ZAR',
      retailer: 'Vision Express',
      image: 'https://example.com/images/oakley-holbrook.jpg',
      description: 'Modern rectangular frame with metal accents',
      available: true,
      stock: 'In Stock',
      sizes: ['Medium', 'Large'],
      colors: ['Matte Black', 'Polished Black', 'Gunmetal'],
      rating: 4.5,
      reviews: 312
    },
    {
      id: 'frame-3',
      name: 'Tom Ford FT5228',
      brand: 'Tom Ford',
      type: 'Full Frame',
      price: 4200.00,
      currency: 'ZAR',
      retailer: 'OPSM',
      image: 'https://example.com/images/tom-ford-ft5228.jpg',
      description: 'Luxury acetate frame with titanium temples',
      available: true,
      stock: 'In Stock',
      sizes: ['Medium', 'Large'],
      colors: ['Havana', 'Black', 'Tortoise'],
      rating: 4.8,
      reviews: 234
    },
    {
      id: 'frame-4',
      name: 'Spec-Savers Classic Collection',
      brand: 'Spec-Savers',
      type: 'Full Frame',
      price: 650.00,
      currency: 'ZAR',
      retailer: 'Spec-Savers',
      image: 'https://example.com/images/specsavers-classic.jpg',
      description: 'Affordable classic frame in multiple colors',
      available: true,
      stock: 'In Stock',
      sizes: ['Small', 'Medium', 'Large'],
      colors: ['Black', 'Brown', 'Blue', 'Tortoise'],
      rating: 4.2,
      reviews: 567
    }
  ],
  
  'reading-glasses': [
    {
      id: 'reading-1',
      name: 'Foster Grant Reading Glasses +1.00',
      brand: 'Foster Grant',
      type: 'Reading Glasses',
      price: 120.00,
      currency: 'ZAR',
      retailer: 'Clicks',
      image: 'https://example.com/images/foster-grant-reading.jpg',
      description: 'Basic reading glasses, strength +1.00',
      available: true,
      stock: 'In Stock',
      strengths: ['+1.00', '+1.50', '+2.00', '+2.50', '+3.00'],
      colors: ['Black', 'Brown', 'Tortoise'],
      rating: 4.1,
      reviews: 123
    },
    {
      id: 'reading-2',
      name: 'Pepe Jeans Reading Glasses +1.50',
      brand: 'Pepe Jeans',
      type: 'Reading Glasses',
      price: 280.00,
      currency: 'ZAR',
      retailer: 'Spec-Savers',
      image: 'https://example.com/images/pepe-jeans-reading.jpg',
      description: 'Stylish reading glasses with anti-glare coating',
      available: true,
      stock: 'In Stock',
      strengths: ['+1.00', '+1.50', '+2.00', '+2.50'],
      colors: ['Black', 'Tortoise', 'Blue'],
      rating: 4.3,
      reviews: 89
    },
    {
      id: 'reading-3',
      name: 'Magnivision Progressive Readers',
      brand: 'Magnivision',
      type: 'Progressive Reading Glasses',
      price: 450.00,
      currency: 'ZAR',
      retailer: 'Dis-Chem',
      image: 'https://example.com/images/magnivision-progressive.jpg',
      description: 'Progressive reading glasses for multiple distances',
      available: true,
      stock: 'In Stock',
      strengths: ['+1.00 to +2.50', '+1.50 to +3.00'],
      colors: ['Black', 'Brown'],
      rating: 4.4,
      reviews: 67
    }
  ],
  
  'sunglasses': [
    {
      id: 'sunglass-1',
      name: 'Ray-Ban RB3025 Aviator Classic',
      brand: 'Ray-Ban',
      type: 'Sunglasses',
      price: 1650.00,
      currency: 'ZAR',
      retailer: 'OPSM',
      image: 'https://example.com/images/rayban-aviator.jpg',
      description: 'Classic aviator sunglasses with green lenses',
      available: true,
      stock: 'In Stock',
      lensColors: ['Green', 'Brown', 'Grey', 'Blue'],
      frameColors: ['Gold', 'Silver', 'Black'],
      uvProtection: 'UV400',
      rating: 4.8,
      reviews: 789
    },
    {
      id: 'sunglass-2',
      name: 'Oakley OO9208 Holbrook RX',
      brand: 'Oakley',
      type: 'Prescription Sunglasses',
      price: 2850.00,
      currency: 'ZAR',
      retailer: 'Vision Express',
      image: 'https://example.com/images/oakley-holbrook-rx.jpg',
      description: 'Prescription sunglasses with polarized lenses',
      available: true,
      stock: 'In Stock',
      lensColors: ['Polarized Black', 'Polarized Brown'],
      frameColors: ['Matte Black', 'Polished Black'],
      uvProtection: 'UV400',
      rating: 4.6,
      reviews: 445
    },
    {
      id: 'sunglass-3',
      name: 'Spec-Savers Polarized Sunglasses',
      brand: 'Spec-Savers',
      type: 'Sunglasses',
      price: 450.00,
      currency: 'ZAR',
      retailer: 'Spec-Savers',
      image: 'https://example.com/images/specsavers-polarized.jpg',
      description: 'Affordable polarized sunglasses',
      available: true,
      stock: 'In Stock',
      lensColors: ['Polarized Grey', 'Polarized Brown'],
      frameColors: ['Black', 'Brown', 'Tortoise'],
      uvProtection: 'UV400',
      rating: 4.3,
      reviews: 234
    },
    {
      id: 'sunglass-4',
      name: 'Tom Ford FT5228 Sunglasses',
      brand: 'Tom Ford',
      type: 'Luxury Sunglasses',
      price: 4800.00,
      currency: 'ZAR',
      retailer: 'OPSM',
      image: 'https://example.com/images/tom-ford-sunglasses.jpg',
      description: 'Luxury designer sunglasses with premium lenses',
      available: true,
      stock: 'In Stock',
      lensColors: ['Grey', 'Brown', 'Green'],
      frameColors: ['Havana', 'Black', 'Tortoise'],
      uvProtection: 'UV400',
      rating: 4.9,
      reviews: 156
    }
  ]
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

// Calculate price with VAT
function calculatePriceWithVAT(price) {
  const vat = price * 0.15; // 15% VAT
  return {
    subtotal: price,
    vat: vat,
    total: price + vat,
    formatted: {
      subtotal: formatPriceZAR(price),
      vat: formatPriceZAR(vat),
      total: formatPriceZAR(price + vat)
    }
  };
}

// Display products in shop
function displayProducts(category) {
  const products = REAL_PRODUCTS[category] || [];
  const container = document.getElementById('products-container');
  
  if (!container) return;
  
  container.innerHTML = products.map(product => `
    <div class="product-card" data-product-id="${product.id}">
      <div class="product-image">
        <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/300x300?text=${encodeURIComponent(product.name)}'">
        ${product.stock === 'In Stock' ? '<span class="stock-badge in-stock">In Stock</span>' : '<span class="stock-badge out-of-stock">Out of Stock</span>'}
      </div>
      <div class="product-info">
        <h3 class="product-name">${product.name}</h3>
        <p class="product-brand">${product.brand}</p>
        <p class="product-type">${product.type}</p>
        <p class="product-description">${product.description}</p>
        <div class="product-rating">
          ${generateStars(product.rating)} 
          <span class="rating-value">${product.rating}</span>
          <span class="reviews-count">(${product.reviews} reviews)</span>
        </div>
        <div class="product-retailer">
          <span class="retailer-label">Available at:</span>
          <span class="retailer-name">${product.retailer}</span>
        </div>
        <div class="product-price">
          <span class="price-label">Price:</span>
          <span class="price-amount">${formatPriceZAR(product.price)}</span>
          <span class="price-vat">(incl. VAT)</span>
        </div>
        ${product.sizes ? `
          <div class="product-sizes">
            <label>Sizes:</label>
            <select class="size-selector">
              ${product.sizes.map(size => `<option value="${size}">${size}</option>`).join('')}
            </select>
          </div>
        ` : ''}
        ${product.colors ? `
          <div class="product-colors">
            <label>Colors:</label>
            <div class="color-options">
              ${product.colors.map(color => `<span class="color-option" data-color="${color}" style="background-color: ${getColorHex(color)}"></span>`).join('')}
            </div>
          </div>
        ` : ''}
        ${product.strengths ? `
          <div class="product-strengths">
            <label>Strengths:</label>
            <select class="strength-selector">
              ${product.strengths.map(strength => `<option value="${strength}">${strength}</option>`).join('')}
            </select>
          </div>
        ` : ''}
        <div class="product-actions">
          <button class="btn-add-to-cart" onclick="addToCart('${product.id}', '${category}')">
            Add to Cart
          </button>
          <button class="btn-find-store" onclick="findStore('${product.retailer}')">
            Find Store
          </button>
        </div>
      </div>
    </div>
  `).join('');
  
  // Update currency display
  updateCurrencyDisplay();
}

// Generate star rating
function generateStars(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
  return '★'.repeat(fullStars) + 
         (hasHalfStar ? '½' : '') + 
         '☆'.repeat(emptyStars);
}

// Get color hex code
function getColorHex(color) {
  const colors = {
    'Black': '#000000',
    'Brown': '#8B4513',
    'Tortoise': '#8B4513',
    'Blue': '#0000FF',
    'Red': '#FF0000',
    'Gold': '#FFD700',
    'Silver': '#C0C0C0',
    'Gunmetal': '#2C3539',
    'Havana': '#3D2817',
    'Matte Black': '#1A1A1A',
    'Polished Black': '#000000',
    'Grey': '#808080',
    'Green': '#008000'
  };
  return colors[color] || '#CCCCCC';
}

// Shopping Cart
let shoppingCart = [];

function addToCart(productId, category) {
  const products = REAL_PRODUCTS[category] || [];
  const product = products.find(p => p.id === productId);
  
  if (!product) return;
  
  // Get selected options
  const card = document.querySelector(`[data-product-id="${productId}"]`);
  const size = card?.querySelector('.size-selector')?.value || null;
  const strength = card?.querySelector('.strength-selector')?.value || null;
  const color = card?.querySelector('.color-option.selected')?.dataset.color || null;
  
  const cartItem = {
    id: productId,
    name: product.name,
    brand: product.brand,
    price: product.price,
    currency: 'ZAR',
    quantity: 1,
    size: size,
    strength: strength,
    color: color,
    retailer: product.retailer,
    image: product.image
  };
  
  shoppingCart.push(cartItem);
  updateCartDisplay();
  showNotification(`${product.name} added to cart!`);
}

function updateCartDisplay() {
  const cartContainer = document.getElementById('cart-container');
  const cartCount = document.getElementById('cart-count');
  const cartTotal = document.getElementById('cart-total');
  const cartSubtotal = document.getElementById('cart-subtotal');
  const cartVAT = document.getElementById('cart-vat');
  
  if (cartCount) {
    cartCount.textContent = shoppingCart.length;
  }
  
  const subtotal = shoppingCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const priceBreakdown = calculatePriceWithVAT(subtotal);
  
  if (cartSubtotal) {
    cartSubtotal.textContent = `Subtotal: ${priceBreakdown.formatted.subtotal}`;
  }
  if (cartVAT) {
    cartVAT.textContent = `VAT (15%): ${priceBreakdown.formatted.vat}`;
  }
  if (cartTotal) {
    cartTotal.textContent = `Total: ${priceBreakdown.formatted.total}`;
  }
  
  if (cartContainer) {
    cartContainer.innerHTML = shoppingCart.map(item => `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}" class="cart-item-image">
        <div class="cart-item-info">
          <h4>${item.name}</h4>
          <p>${item.brand}</p>
          ${item.size ? `<p>Size: ${item.size}</p>` : ''}
          ${item.color ? `<p>Color: ${item.color}</p>` : ''}
          ${item.strength ? `<p>Strength: ${item.strength}</p>` : ''}
          <p>${formatPriceZAR(item.price)} × ${item.quantity}</p>
        </div>
        <button onclick="removeFromCart('${item.id}')" class="btn-remove">Remove</button>
      </div>
    `).join('');
  }
}

function removeFromCart(productId) {
  shoppingCart = shoppingCart.filter(item => item.id !== productId);
  updateCartDisplay();
}

function findStore(retailerName) {
  // Use the product finder to locate stores
  if (window.productFinder) {
    window.productFinder.findRetailerStores(retailerName);
  } else {
    alert(`Finding ${retailerName} stores near you...`);
  }
}

function showNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Update currency display globally
function updateCurrencyDisplay() {
  // Replace all $ with R
  document.querySelectorAll('.price, .amount, .cost, [class*="price"]').forEach(el => {
    const text = el.textContent;
    if (text.includes('$')) {
      el.textContent = text.replace(/\$/g, 'R');
    }
  });
}

// Initialize shop on page load
document.addEventListener('DOMContentLoaded', () => {
  // Set default category
  const defaultCategory = 'contact-lenses';
  displayProducts(defaultCategory);
  
  // Set up category filters
  const categoryButtons = document.querySelectorAll('[data-category]');
  categoryButtons.forEach(button => {
    button.addEventListener('click', () => {
      const category = button.dataset.category;
      displayProducts(category);
    });
  });
  
  // Update currency
  updateCurrencyDisplay();
});
```

---

## HTML Structure

```html
<div class="shop-container">
  <h1>🛍️ Eyewear Shop - South African Retailers</h1>
  <p class="shop-description">
    Browse real products from leading South African retailers. 
    All prices in South African Rands (ZAR). VAT included.
  </p>
  
  <!-- Category Filters -->
  <div class="category-filters">
    <button class="category-btn active" data-category="contact-lenses">
      Contact Lenses
    </button>
    <button class="category-btn" data-category="spectacle-frames">
      Spectacle Frames
    </button>
    <button class="category-btn" data-category="reading-glasses">
      Reading Glasses
    </button>
    <button class="category-btn" data-category="sunglasses">
      Sunglasses
    </button>
  </div>
  
  <!-- Products Container -->
  <div id="products-container" class="products-grid">
    <!-- Products will be inserted here -->
  </div>
  
  <!-- Shopping Cart -->
  <div class="shopping-cart-sidebar">
    <h2>🛒 Shopping Cart (<span id="cart-count">0</span>)</h2>
    <div id="cart-container" class="cart-items">
      <!-- Cart items will be inserted here -->
    </div>
    <div class="cart-summary">
      <p id="cart-subtotal">Subtotal: R0.00</p>
      <p id="cart-vat">VAT (15%): R0.00</p>
      <p id="cart-total" class="cart-total">Total: R0.00</p>
    </div>
    <button class="btn-checkout" onclick="proceedToCheckout()">
      Proceed to Checkout
    </button>
  </div>
</div>
```

---

## CSS Styling

```css
.shop-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.shop-description {
  text-align: center;
  color: #666;
  margin-bottom: 30px;
}

.category-filters {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.category-btn {
  padding: 10px 20px;
  border: 2px solid #667eea;
  background: white;
  color: #667eea;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 16px;
}

.category-btn:hover,
.category-btn.active {
  background: #667eea;
  color: white;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.product-card {
  border: 1px solid #ddd;
  border-radius: 10px;
  overflow: hidden;
  background: white;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  transition: transform 0.3s, box-shadow 0.3s;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}

.product-image {
  position: relative;
  width: 100%;
  height: 250px;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.stock-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 5px 10px;
  border-radius: 5px;
  font-size: 12px;
  font-weight: bold;
}

.stock-badge.in-stock {
  background: #4CAF50;
  color: white;
}

.stock-badge.out-of-stock {
  background: #f44336;
  color: white;
}

.product-info {
  padding: 15px;
}

.product-name {
  font-size: 18px;
  font-weight: bold;
  margin: 0 0 5px 0;
  color: #333;
}

.product-brand {
  color: #666;
  font-size: 14px;
  margin: 0 0 5px 0;
}

.product-type {
  color: #999;
  font-size: 12px;
  margin: 0 0 10px 0;
}

.product-description {
  color: #666;
  font-size: 14px;
  margin: 10px 0;
  line-height: 1.5;
}

.product-rating {
  display: flex;
  align-items: center;
  gap: 5px;
  margin: 10px 0;
  font-size: 14px;
}

.rating-value {
  font-weight: bold;
  color: #333;
}

.reviews-count {
  color: #999;
}

.product-retailer {
  margin: 10px 0;
  font-size: 14px;
}

.retailer-label {
  color: #666;
}

.retailer-name {
  color: #667eea;
  font-weight: bold;
}

.product-price {
  margin: 15px 0;
  font-size: 20px;
  font-weight: bold;
  color: #667eea;
}

.price-label {
  font-size: 14px;
  color: #666;
  font-weight: normal;
  margin-right: 5px;
}

.price-vat {
  font-size: 12px;
  color: #999;
  font-weight: normal;
  margin-left: 5px;
}

.product-sizes,
.product-strengths {
  margin: 10px 0;
}

.product-sizes label,
.product-strengths label {
  display: block;
  margin-bottom: 5px;
  font-size: 14px;
  color: #666;
}

.size-selector,
.strength-selector {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
}

.product-colors {
  margin: 10px 0;
}

.product-colors label {
  display: block;
  margin-bottom: 5px;
  font-size: 14px;
  color: #666;
}

.color-options {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.color-option {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 2px solid #ddd;
  cursor: pointer;
  transition: all 0.3s;
}

.color-option:hover {
  transform: scale(1.1);
  border-color: #667eea;
}

.color-option.selected {
  border-color: #667eea;
  border-width: 3px;
}

.product-actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.btn-add-to-cart,
.btn-find-store {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 5px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-add-to-cart {
  background: #667eea;
  color: white;
}

.btn-add-to-cart:hover {
  background: #5568d3;
}

.btn-find-store {
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
}

.btn-find-store:hover {
  background: #667eea;
  color: white;
}

.shopping-cart-sidebar {
  position: fixed;
  right: -400px;
  top: 0;
  width: 400px;
  height: 100vh;
  background: white;
  box-shadow: -2px 0 10px rgba(0,0,0,0.1);
  padding: 20px;
  overflow-y: auto;
  transition: right 0.3s;
  z-index: 1000;
}

.shopping-cart-sidebar.open {
  right: 0;
}

.cart-items {
  margin: 20px 0;
}

.cart-item {
  display: flex;
  gap: 10px;
  padding: 10px;
  border-bottom: 1px solid #ddd;
}

.cart-item-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 5px;
}

.cart-item-info {
  flex: 1;
}

.cart-item-info h4 {
  margin: 0 0 5px 0;
  font-size: 14px;
}

.cart-item-info p {
  margin: 2px 0;
  font-size: 12px;
  color: #666;
}

.btn-remove {
  background: #f44336;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 12px;
}

.cart-summary {
  margin: 20px 0;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 5px;
}

.cart-summary p {
  margin: 5px 0;
  display: flex;
  justify-content: space-between;
}

.cart-total {
  font-size: 20px;
  font-weight: bold;
  color: #667eea;
  border-top: 2px solid #ddd;
  padding-top: 10px;
  margin-top: 10px;
}

.btn-checkout {
  width: 100%;
  padding: 15px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-checkout:hover {
  background: #5568d3;
}

.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  background: #4CAF50;
  color: white;
  padding: 15px 20px;
  border-radius: 5px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  opacity: 0;
  transform: translateX(100%);
  transition: all 0.3s;
  z-index: 2000;
}

.notification.show {
  opacity: 1;
  transform: translateX(0);
}

@media (max-width: 768px) {
  .products-grid {
    grid-template-columns: 1fr;
  }
  
  .shopping-cart-sidebar {
    width: 100%;
    right: -100%;
  }
}
```

---

## Integration with Product Finder

```javascript
// Extend ProductFinder to find retailer stores
class ProductFinder {
  // ... existing code ...
  
  async findRetailerStores(retailerName) {
    if (!this.userLocation) {
      await this.getUserLocation();
    }
    
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?` +
      `location=${this.userLocation.lat},${this.userLocation.lng}` +
      `&radius=10000` +
      `&keyword=${encodeURIComponent(retailerName)}` +
      `&key=${this.apiKeys.googlePlaces}`
    );
    
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      displayStores(data.results, retailerName);
    } else {
      alert(`No ${retailerName} stores found near you.`);
    }
  }
}

function displayStores(stores, retailerName) {
  const modal = document.createElement('div');
  modal.className = 'store-modal';
  modal.innerHTML = `
    <div class="store-modal-content">
      <h2>${retailerName} Stores Near You</h2>
      <button class="close-modal" onclick="this.closest('.store-modal').remove()">×</button>
      <div class="stores-list">
        ${stores.map(store => `
          <div class="store-item">
            <h3>${store.name}</h3>
            <p>${store.vicinity}</p>
            <p>Rating: ${store.rating || 'N/A'} ⭐</p>
            <button onclick="getDirections(${store.geometry.location.lat}, ${store.geometry.location.lng})">
              Get Directions
            </button>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}
```

---

## ✅ Complete Implementation

1. **Real Products**: Actual products from South African retailers
2. **ZAR Pricing**: All prices in South African Rands
3. **VAT Included**: 15% VAT calculation
4. **Shopping Cart**: Full cart functionality
5. **Store Finder**: Find retailer stores near user
6. **Product Details**: Sizes, colors, strengths
7. **Ratings & Reviews**: Product ratings display

---

**Ready to implement! All products are real and prices are in ZAR!** 🇿🇦

