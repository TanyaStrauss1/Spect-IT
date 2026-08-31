// Spect-IT Real Products with ZAR Pricing
// Add this script to your website

(function() {
  'use strict';
  
  // Real Products Database
  const REAL_PRODUCTS = {
    'contact-lenses': [
      {
        id: 'cl-1',
        name: 'Acuvue Oasys 1-Day (30 pack)',
        brand: 'Johnson & Johnson',
        type: 'Daily Disposable',
        price: 450.00,
        currency: 'ZAR',
        retailer: 'Spec-Savers',
        image: (window.SpectitProductImages && window.SpectitProductImages.product('Contact Lenses', 'contact-lenses')) || '',
        description: 'Premium daily disposable contact lenses with UV protection',
        available: true,
        rating: 4.5,
        reviews: 234
      },
      {
        id: 'cl-2',
        name: 'Air Optix Aqua Monthly (6 pack)',
        brand: 'Alcon',
        type: 'Monthly',
        price: 380.00,
        currency: 'ZAR',
        retailer: 'OPSM',
        image: (window.SpectitProductImages && window.SpectitProductImages.product('Contact Lenses', 'contact-lenses')) || '',
        description: 'Comfortable monthly lenses with high oxygen permeability',
        available: true,
        rating: 4.3,
        reviews: 189
      },
      {
        id: 'cl-3',
        name: 'Biofinity Toric (6 pack)',
        brand: 'CooperVision',
        type: 'Toric (Astigmatism)',
        price: 520.00,
        currency: 'ZAR',
        retailer: 'Vision Express',
        image: (window.SpectitProductImages && window.SpectitProductImages.product('Contact Lenses', 'contact-lenses')) || '',
        description: 'Monthly toric lenses for astigmatism correction',
        available: true,
        rating: 4.6,
        reviews: 156
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
        image: (window.SpectitProductImages && window.SpectitProductImages.product('Ray-Ban Wayfarer', 'frames')) || '',
        description: 'Classic wayfarer frame in black',
        available: true,
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
        image: (window.SpectitProductImages && window.SpectitProductImages.product('Oakley Holbrook', 'frames')) || '',
        description: 'Modern rectangular frame with metal accents',
        available: true,
        sizes: ['Medium', 'Large'],
        colors: ['Matte Black', 'Polished Black', 'Gunmetal'],
        rating: 4.5,
        reviews: 312
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
        image: (window.SpectitProductImages && window.SpectitProductImages.product('Reading Glasses', 'reading-glasses')) || '',
        description: 'Basic reading glasses, strength +1.00',
        available: true,
        strengths: ['+1.00', '+1.50', '+2.00', '+2.50', '+3.00'],
        rating: 4.1,
        reviews: 123
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
        image: (window.SpectitProductImages && window.SpectitProductImages.product('Ray-Ban Aviator', 'sunglasses')) || '',
        description: 'Classic aviator sunglasses with green lenses',
        available: true,
        rating: 4.8,
        reviews: 789
      }
    ]
  };
  
  // Shopping Cart
  let shoppingCart = [];
  
  // Display products
  function displayProducts(category) {
    const products = REAL_PRODUCTS[category] || [];
    const container = document.getElementById('products-container');
    
    if (!container) return;
    
    container.innerHTML = products.map(product => {
      const priceFormatted = window.SpectITCurrency 
        ? window.SpectITCurrency.formatPriceZAR(product.price)
        : `R${product.price.toFixed(2)}`;
      
      return `
        <div class="product-card" data-product-id="${product.id}">
          <div class="product-image">
            <img src="${product.image}" alt="${product.name}" 
                 onerror="this.src=(window.SpectitProductImages && window.SpectitProductImages.product('${product.name.replace(/'/g, "\\'")}')) || this.src">
            <span class="stock-badge in-stock">In Stock</span>
          </div>
          <div class="product-info">
            <h3>${product.name}</h3>
            <p class="product-brand">${product.brand}</p>
            <p class="product-type">${product.type}</p>
            <p class="product-description">${product.description}</p>
            <div class="product-rating">
              ${generateStars(product.rating)} 
              <span>${product.rating}</span>
              <span class="reviews-count">(${product.reviews} reviews)</span>
            </div>
            <div class="product-retailer">
              <span>Available at: </span>
              <strong>${product.retailer}</strong>
            </div>
            <div class="product-price">
              <span class="price-amount">${priceFormatted}</span>
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
                  ${product.colors.map(color => `<span class="color-option" data-color="${color}"></span>`).join('')}
                </div>
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
      `;
    }).join('');
  }
  
  // Generate star rating
  function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    return '★'.repeat(fullStars) + (hasHalfStar ? '½' : '') + '☆'.repeat(emptyStars);
  }
  
  // Add to cart
  window.addToCart = function(productId, category) {
    const products = REAL_PRODUCTS[category] || [];
    const product = products.find(p => p.id === productId);
    
    if (!product) return;
    
    const card = document.querySelector(`[data-product-id="${productId}"]`);
    const size = card?.querySelector('.size-selector')?.value || null;
    const color = card?.querySelector('.color-option.selected')?.dataset.color || null;
    
    const cartItem = {
      id: productId,
      name: product.name,
      brand: product.brand,
      price: product.price,
      currency: 'ZAR',
      quantity: 1,
      size: size,
      color: color,
      retailer: product.retailer,
      image: product.image
    };
    
    shoppingCart.push(cartItem);
    updateCartDisplay();
    showNotification(`${product.name} added to cart!`);
  };
  
  // Update cart display
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
    const priceBreakdown = window.SpectITCurrency 
      ? window.SpectITCurrency.calculatePriceWithVAT(subtotal)
      : { formatted: { subtotal: `R${subtotal.toFixed(2)}`, vat: `R${(subtotal * 0.15).toFixed(2)}`, total: `R${(subtotal * 1.15).toFixed(2)}` } };
    
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
            <p>R${item.price.toFixed(2)} × ${item.quantity}</p>
          </div>
          <button onclick="removeFromCart('${item.id}')" class="btn-remove">Remove</button>
        </div>
      `).join('');
    }
  }
  
  // Remove from cart
  window.removeFromCart = function(productId) {
    shoppingCart = shoppingCart.filter(item => item.id !== productId);
    updateCartDisplay();
  };
  
  // Find store
  window.findStore = function(retailerName) {
    if (window.SpectITLocation) {
      window.SpectITLocation.findRetailerStores(retailerName);
    } else {
      alert(`Finding ${retailerName} stores near you...`);
    }
  };
  
  // Show notification
  function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 10);
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
  
  // Initialize on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      displayProducts('contact-lenses');
      
      // Category buttons
      document.querySelectorAll('[data-category]').forEach(button => {
        button.addEventListener('click', function() {
          const category = this.dataset.category;
          displayProducts(category);
        });
      });
    });
  } else {
    displayProducts('contact-lenses');
  }
  
  // Export
  window.SpectITProducts = {
    displayProducts,
    getCart: () => shoppingCart,
    updateCartDisplay
  };
})();

