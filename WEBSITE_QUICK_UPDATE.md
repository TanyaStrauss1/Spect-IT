# ⚡ Quick Website Update Guide - ZAR Conversion

## 🔍 Find and Replace

### 1. Currency Symbol
**Find:** `$`
**Replace:** `R`

**Files to update:**
- All HTML files
- All JavaScript files
- All CSS files (if prices are in CSS)

---

### 2. Shopping Cart

**Find:**
```html
Total: $0.00
```

**Replace with:**
```html
Subtotal: R0.00
VAT (15%): R0.00
Total: R0.00
```

---

### 3. Shop Section Header

**Find:**
```html
🛍️ Eyewear Shop
```

**Replace with:**
```html
🛍️ Eyewear Shop - South African Retailers
```

**Add after header:**
```html
<p>Browse eyewear from leading South African retailers. All prices in South African Rands (ZAR).</p>
```

---

### 4. Find Retailers Section

**Find:**
```html
📍 Find Local Retailers
```

**Replace with:**
```html
📍 Find Local Retailers in South Africa
```

---

### 5. Find Professionals Section

**Find:**
```html
👨‍⚕️ Find Local Eye Care Professional
```

**Replace with:**
```html
👨‍⚕️ Find Eye Care Professionals in South Africa
```

---

### 6. Distance Display

**Find:** `miles` or `mi`
**Replace:** `km` or `kilometers`

**Find:** Distance calculations in miles
**Replace:** Convert to kilometers (1 mile = 1.609 km)

---

### 7. Phone Number Format

**Find:** Generic phone formats
**Replace with:** `+27 XX XXX XXXX` format

**Example:**
- Before: `(555) 123-4567`
- After: `+27 11 123 4567`

---

### 8. Timezone References

**Find:** Generic timezone references
**Replace with:** `SAST` (South African Standard Time)

**Example:**
- Before: `9:00 AM - 5:00 PM`
- After: `9:00 - 17:00 SAST`

---

## 💰 Price Conversion Examples

### Quick Reference (USD → ZAR)
- $10 → R180
- $50 → R900
- $100 → R1,800
- $500 → R9,000
- $1,000 → R18,000

**Formula:** USD × 18 = ZAR (approximate)

---

## 📝 Text Updates

### Add to Homepage
```html
<p>🇿🇦 Prices in South African Rands (ZAR). Serving South Africa.</p>
```

### Add to Shop Section
```html
<p>All prices in South African Rands (ZAR). VAT (15%) included where applicable.</p>
```

### Add to Checkout
```html
<p>Accepted payment methods: Visa, Mastercard, EFT, SnapScan, Zapper, PayFast</p>
```

---

## ✅ 5-Minute Update Checklist

1. [ ] Replace all `$` with `R`
2. [ ] Update shopping cart to show VAT
3. [ ] Change "Find Local Retailers" to "Find Local Retailers in South Africa"
4. [ ] Change "Find Local Eye Care Professional" to "Find Eye Care Professionals in South Africa"
5. [ ] Update shop header to "South African Retailers"
6. [ ] Add ZAR currency note
7. [ ] Update distance to kilometers
8. [ ] Update phone format to +27

---

## 🎯 Priority Updates

### High Priority (Do First)
1. Currency symbol ($ → R)
2. Shopping cart display
3. Shop section header
4. Currency notes

### Medium Priority
1. Location finder text
2. Distance format
3. Phone number format
4. Payment methods

### Low Priority (Nice to Have)
1. Province filters
2. City-specific content
3. Retailer database
4. Advanced location features

---

**Quick updates ready! Start with currency symbol replacement.** 🇿🇦

