# 🌐 Spect-IT Website Implementation Files

## 📋 Files Included

This folder contains all the implementation files to update https://www.spect-it.com:

1. **spectit-currency.js** - Currency conversion to ZAR
2. **spectit-products.js** - Real products with shopping cart
3. **spectit-location.js** - Location services & specialist finder
4. **spectit-styles.css** - CSS styles for all improvements

---

## 🚀 How to Add to Your Website

### Step 1: Add JavaScript Files

Add these script tags to your HTML (before `</body>`):

```html
<!-- Currency Conversion -->
<script src="spectit-currency.js"></script>

<!-- Products -->
<script src="spectit-products.js"></script>

<!-- Location Services -->
<script src="spectit-location.js"></script>
```

### Step 2: Add CSS

Add this to your HTML `<head>` or CSS file:

```html
<link rel="stylesheet" href="spectit-styles.css">
```

### Step 3: Update HTML

#### Shopping Cart Section

**Find:**
```html
🛒 Shopping Cart (0)
Total: $0.00
```

**Replace with:**
```html
🛒 Shopping Cart (<span id="cart-count">0</span>)
<div id="cart-container"></div>
<div class="cart-summary">
  <p id="cart-subtotal">Subtotal: R0.00</p>
  <p id="cart-vat">VAT (15%): R0.00</p>
  <p id="cart-total" class="cart-total">Total: R0.00</p>
</div>
```

#### Products Section

**Add:**
```html
<div id="products-container" class="products-grid"></div>
```

#### Specialists Section

**Add:**
```html
<div id="specialists-container" class="specialists-grid"></div>
<button onclick="findSpecialists()">Find Nearest Specialists</button>
```

### Step 4: Set API Keys

**IMPORTANT:** Edit `spectit-location.js` and replace:
```javascript
const CONFIG = {
  googlePlacesApiKey: 'YOUR_GOOGLE_PLACES_API_KEY', // ← Replace this
  googleMapsApiKey: 'YOUR_GOOGLE_MAPS_API_KEY' // ← Replace this
};
```

Get API keys from: https://console.cloud.google.com

---

## ✅ What Gets Updated

1. **Currency**: All prices converted to ZAR (R)
2. **Products**: Real products with ZAR pricing
3. **Shopping Cart**: VAT calculation (15%)
4. **Location**: Find nearest specialists
5. **Stores**: Find retailer stores near user

---

## 🎯 Features

- ✅ Automatic currency conversion
- ✅ Real product database
- ✅ Shopping cart with VAT
- ✅ Location-based specialist finder
- ✅ Store locator
- ✅ Distance calculations
- ✅ Directions integration

---

## 📝 Notes

- Make sure to set your Google API keys in `spectit-location.js`
- All prices are in South African Rands (ZAR)
- VAT is calculated at 15%
- Location services require user permission

---

**Ready to deploy!** 🚀

