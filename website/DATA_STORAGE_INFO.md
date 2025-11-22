# 📦 Data Storage Information

## Current Storage Location

**All data is stored in the browser's `localStorage`** - this is client-side storage that persists in the user's browser.

---

## What Data is Stored

### 1. **User Email** 
- **Key:** `spectit_user_email`
- **Type:** String
- **Location:** `localStorage.getItem('spectit_user_email')`
- **Purpose:** User authentication/sign-in
- **Persistence:** Survives browser close, tab close, page refresh
- **Example:** `"user@example.com"`

### 2. **Test History**
- **Key:** `testHistory`
- **Type:** JSON Array
- **Location:** `localStorage.getItem('testHistory')`
- **Purpose:** Stores all completed eye test results
- **Persistence:** Survives browser close, tab close, page refresh
- **Structure:**
  ```json
  [
    {
      "type": "visual-acuity",
      "name": "Visual Acuity Test (LiDAR-Calibrated)",
      "score": 0.95,
      "level": "6/6",
      "date": "2025-01-20T18:30:00.000Z",
      "eye": "both",
      "testDistance": 3.0,
      "lidarCalibrated": true,
      ...
    }
  ]
  ```

### 3. **Shopping Cart**
- **Key:** `shoppingCart`
- **Type:** JSON Array
- **Location:** `localStorage.getItem('shoppingCart')`
- **Purpose:** Stores items added to shopping cart
- **Persistence:** Survives browser close, tab close, page refresh
- **Structure:**
  ```json
  [
    {
      "id": "product-123-1234567890",
      "productId": "product-123",
      "name": "Ray-Ban RB2140",
      "retailer": "OPSM",
      "price": 1890.00,
      "quantity": 1,
      "size": "Medium",
      "color": "Black"
    }
  ]
  ```

### 4. **Orders** (if checkout completed)
- **Key:** `spectit_orders`
- **Type:** JSON Array
- **Location:** `localStorage.getItem('spectit_orders')`
- **Purpose:** Stores completed orders
- **Persistence:** Survives browser close, tab close, page refresh

---

## Storage Details

### Browser localStorage
- **Location:** User's browser (client-side only)
- **Capacity:** ~5-10MB per domain (varies by browser)
- **Scope:** Per domain (spect-it.com)
- **Privacy:** Data stays on user's device
- **Access:** Only accessible by JavaScript on same domain
- **Persistence:** Until user clears browser data

### How to Access (Developer Console)

```javascript
// View all stored data
console.log('Email:', localStorage.getItem('spectit_user_email'));
console.log('Test History:', JSON.parse(localStorage.getItem('testHistory') || '[]'));
console.log('Shopping Cart:', JSON.parse(localStorage.getItem('shoppingCart') || '[]'));
console.log('Orders:', JSON.parse(localStorage.getItem('spectit_orders') || '[]'));

// View all localStorage keys for this domain
console.log('All keys:', Object.keys(localStorage));
```

### How to Clear Data

```javascript
// Clear specific data
localStorage.removeItem('spectit_user_email');
localStorage.removeItem('testHistory');
localStorage.removeItem('shoppingCart');
localStorage.removeItem('spectit_orders');

// Clear ALL data for this domain
localStorage.clear();
```

---

## Current Limitations

### ⚠️ Client-Side Only
- Data is stored **only in the user's browser**
- **Not synced to a server/database**
- **Lost if user clears browser data**
- **Not accessible from other devices**
- **No backup or recovery**

### ⚠️ Privacy Browser Mode
- Data may be cleared when user closes private/incognito window
- Some browsers clear localStorage in private mode

### ⚠️ Storage Limits
- ~5-10MB limit per domain
- May vary by browser
- Could fill up with many test results

---

## Future Considerations

### Recommended: Server-Side Storage

For production, consider moving to:

1. **Backend Database** (PostgreSQL, MongoDB, etc.)
   - Store test results server-side
   - Link to user email
   - Accessible from any device
   - Backup and recovery

2. **Cloud Storage** (Firebase, Supabase, AWS)
   - Real-time sync
   - Cross-device access
   - Automatic backups
   - User authentication

3. **API Integration**
   - Send test results to backend API
   - Store in database
   - Email results to users
   - Generate PDF reports

### Example: Backend Integration

```javascript
// Future implementation
async function saveResultToServer(result) {
    const response = await fetch('/api/test-results', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: userEmail,
            result: result,
            timestamp: new Date().toISOString()
        })
    });
    
    if (response.ok) {
        // Also save locally as backup
        saveResult(result);
    }
}
```

---

## Summary

| Data Type | Storage Key | Location | Persists? |
|-----------|-------------|----------|-----------|
| User Email | `spectit_user_email` | localStorage | ✅ Yes |
| Test History | `testHistory` | localStorage | ✅ Yes |
| Shopping Cart | `shoppingCart` | localStorage | ✅ Yes |
| Orders | `spectit_orders` | localStorage | ✅ Yes |

**Current Status:** All data stored client-side in browser localStorage  
**Recommendation:** Move to server-side database for production use

