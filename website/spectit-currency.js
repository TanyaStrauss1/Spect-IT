// Spect-IT Currency Conversion to ZAR
// Add this script to your website

(function() {
  'use strict';
  
  // Currency Configuration
  const CURRENCY_CONFIG = {
    symbol: 'R',
    code: 'ZAR',
    vatRate: 0.15,
    locale: 'en-ZA',
    exchangeRate: 18.5 // USD to ZAR
  };
  
  // Format price in ZAR
  function formatPriceZAR(amount) {
    return new Intl.NumberFormat(CURRENCY_CONFIG.locale, {
      style: 'currency',
      currency: CURRENCY_CONFIG.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }
  
  // Calculate price with VAT
  function calculatePriceWithVAT(amount) {
    const vat = amount * CURRENCY_CONFIG.vatRate;
    return {
      subtotal: amount,
      vat: vat,
      total: amount + vat,
      formatted: {
        subtotal: formatPriceZAR(amount),
        vat: formatPriceZAR(vat),
        total: formatPriceZAR(amount + vat)
      }
    };
  }
  
  // Convert USD to ZAR
  function convertToZAR(usdAmount) {
    return usdAmount * CURRENCY_CONFIG.exchangeRate;
  }
  
  // Update all prices on page
  function updateAllPricesToZAR() {
    // Replace $ with R
    document.body.innerHTML = document.body.innerHTML.replace(/\$/g, 'R');
    
    // Update shopping cart
    updateShoppingCart();
    
    // Update all price elements
    const priceElements = document.querySelectorAll('[class*="price"], [id*="price"], [class*="cost"], .amount, .total');
    priceElements.forEach(element => {
      const text = element.textContent || element.innerText;
      const usdMatch = text.match(/R?(\d+\.?\d*)/);
      if (usdMatch) {
        const amount = parseFloat(usdMatch[1]);
        // If it looks like USD (small numbers), convert
        if (amount < 1000) {
          const zarAmount = convertToZAR(amount);
          element.textContent = formatPriceZAR(zarAmount);
        }
      }
    });
  }
  
  // Update shopping cart
  function updateShoppingCart() {
    const cartTotal = document.querySelector('[id*="cart-total"], .cart-total, .total');
    const cartSubtotal = document.querySelector('[id*="cart-subtotal"], .cart-subtotal');
    const cartVAT = document.querySelector('[id*="cart-vat"], .cart-vat, .vat');
    
    // Get cart items (you'll need to implement this based on your cart system)
    const cart = getCartItems();
    const subtotal = calculateCartSubtotal(cart);
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
  }
  
  // Helper functions (implement based on your cart system)
  function getCartItems() {
    // Return cart items from your cart system
    return [];
  }
  
  function calculateCartSubtotal(cart) {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }
  
  // Initialize on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateAllPricesToZAR);
  } else {
    updateAllPricesToZAR();
  }
  
  // Also update when cart changes
  const observer = new MutationObserver(() => {
    updateAllPricesToZAR();
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // Export for use in other scripts
  window.SpectITCurrency = {
    formatPriceZAR,
    calculatePriceWithVAT,
    convertToZAR,
    updateAllPricesToZAR
  };
})();

