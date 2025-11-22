# 🚀 Implementation Guide: South African Retailer & Optometrist Integration

## ✅ Yes, It's Absolutely Possible!

You can connect Spect-IT to:
- ✅ South African retailers (Spec-Savers, OPSM, Vision Express, etc.)
- ✅ Find nearest optometrists/opticians by location
- ✅ Filter by product type (frames, contact lenses, sunglasses)
- ✅ Get directions and store details
- ✅ Integrate with existing shop section

---

## 📋 Quick Start

### Step 1: Get Google Maps API Key

1. Go to: https://console.cloud.google.com
2. Create project: "Spect-IT"
3. Enable APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
   - Directions API
4. Create API key
5. Restrict to your app domains

### Step 2: Install Dependencies

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
npm install react-native-maps
expo install expo-location
```

### Step 3: Add API Key to Environment

Create `.env` file:
```
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
```

### Step 4: Use the Services

The following files are ready:
- ✅ `storeLocatorService.js` - Complete location service
- ✅ `southAfricanRetailers.js` - Retailer database

---

## 🔧 Integration Steps

### 1. Add to Shop Screen

```javascript
// screens/ShopScreen.js
import { findNearbyEyeCare, searchStoresByProduct } from '../services/storeLocatorService';
import { getRetailersByProduct } from '../data/southAfricanRetailers';

export default function ShopScreen() {
  const [selectedCategory, setSelectedCategory] = useState('frames');
  const [nearbyStores, setNearbyStores] = useState([]);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    loadUserLocation();
  }, []);

  const loadUserLocation = async () => {
    try {
      const location = await getCurrentLocation();
      setUserLocation(location);
      
      // Find stores for selected category
      const stores = await searchStoresByProduct(
        selectedCategory,
        location.latitude,
        location.longitude
      );
      setNearbyStores(stores);
    } catch (error) {
      console.error('Error loading location:', error);
    }
  };

  return (
    <View>
      {/* Category Selection */}
      <CategoryTabs
        categories={['frames', 'contact lenses', 'sunglasses']}
        selected={selectedCategory}
        onSelect={setSelectedCategory}
      />

      {/* Find Stores Button */}
      <TouchableOpacity onPress={loadUserLocation}>
        <Text>📍 Find Stores Near Me</Text>
      </TouchableOpacity>

      {/* Store List */}
      <FlatList
        data={nearbyStores}
        renderItem={({ item }) => (
          <StoreCard
            store={item}
            onPress={() => openStoreDetails(item)}
          />
        )}
      />
    </View>
  );
}
```

### 2. Add Optometrist Finder to Results

```javascript
// screens/ResultsScreen.js
import { findNearestOptometrists } from '../services/storeLocatorService';

export default function ResultsScreen({ testResults }) {
  const [optometrists, setOptometrists] = useState([]);

  const findOptometrists = async () => {
    try {
      const location = await getCurrentLocation();
      const results = await findNearestOptometrists(
        location.latitude,
        location.longitude
      );
      setOptometrists(results);
    } catch (error) {
      console.error('Error finding optometrists:', error);
    }
  };

  return (
    <View>
      {/* Test Results */}
      <TestResultsDisplay results={testResults} />

      {/* Find Optometrist Section */}
      <Section title="Find Eye Care Professional">
        <TouchableOpacity onPress={findOptometrists}>
          <Text>📍 Find Nearest Optometrist</Text>
        </TouchableOpacity>

        <FlatList
          data={optometrists}
          renderItem={({ item }) => (
            <OptometristCard
              optometrist={item}
              onPress={() => openDetails(item)}
            />
          )}
        />
      </Section>
    </View>
  );
}
```

---

## 🗺️ Map Integration

### Store Locator Map Component

```javascript
// components/StoreLocatorMap.js
import React from 'react';
import MapView, { Marker } from 'react-native-maps';

export default function StoreLocatorMap({ stores, userLocation }) {
  return (
    <MapView
      style={{ flex: 1 }}
      initialRegion={{
        latitude: userLocation?.latitude || -25.7479, // Johannesburg
        longitude: userLocation?.longitude || 28.2293,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      }}
    >
      {/* User Location Marker */}
      {userLocation && (
        <Marker
          coordinate={userLocation}
          title="Your Location"
          pinColor="blue"
        />
      )}

      {/* Store Markers */}
      {stores.map(store => (
        <Marker
          key={store.id}
          coordinate={store.coordinates}
          title={store.name}
          description={store.address}
        />
      ))}
    </MapView>
  );
}
```

---

## 📊 Features to Implement

### Phase 1: Basic Integration
- [x] Location services
- [x] Store finder service
- [x] Retailer database
- [ ] Map component
- [ ] Store list component
- [ ] Integration with shop screen

### Phase 2: Enhanced Features
- [ ] Store details page
- [ ] Directions/navigation
- [ ] Filter by distance
- [ ] Filter by rating
- [ ] Filter by store hours
- [ ] Call store directly
- [ ] Open in maps app

### Phase 3: Advanced Features
- [ ] Store hours display
- [ ] Book appointment (if API available)
- [ ] Product availability check
- [ ] Price comparison
- [ ] User reviews integration
- [ ] Save favorite stores

---

## 💰 Cost Considerations

### Google Maps API Costs

**Free Tier**: $200/month credit

**Typical Usage (1,000 users/month):**
- Places API: ~5,000 requests = $85
- Geocoding: ~2,000 requests = $10
- Directions: ~1,000 requests = $5
- **Total: ~$100/month**

**With Caching (Recommended):**
- Cache major retailers
- Reduce API calls by 70%
- **Total: ~$30/month**

---

## 🔒 Privacy & Permissions

### Required Permissions

**iOS (app.json):**
```json
{
  "ios": {
    "infoPlist": {
      "NSLocationWhenInUseUsageDescription": "Spect-IT uses your location to find nearby eye care professionals and retailers. Your location is only used when you actively search for stores and is never shared with third parties."
    }
  }
}
```

**Android (app.json):**
```json
{
  "android": {
    "permissions": [
      "ACCESS_FINE_LOCATION",
      "ACCESS_COARSE_LOCATION"
    ]
  }
}
```

---

## 📱 User Experience Flow

### Shop Flow
1. User selects product category (frames, contact lenses, sunglasses)
2. Clicks "Find Stores Near Me"
3. App requests location permission
4. Shows map with nearby stores
5. User can:
   - View store details
   - Get directions
   - Call store
   - Visit website

### Results Flow
1. User completes vision test
2. Sees test results
3. Clicks "Find Eye Care Professional"
4. App shows nearest optometrists/opticians
5. User can:
   - View professional details
   - Get directions
   - Call to book appointment
   - Share test results

---

## 🎯 Next Steps

1. **Get Google Maps API Key** (Required)
2. **Install dependencies** (react-native-maps, expo-location)
3. **Add API key to environment** (.env file)
4. **Integrate store locator** into shop screen
5. **Add optometrist finder** to results screen
6. **Test location services**
7. **Add map component**
8. **Implement caching** to reduce API costs

---

## ✅ Summary

**Everything is ready:**
- ✅ Complete location service code
- ✅ South African retailer database
- ✅ Integration examples
- ✅ Implementation guide

**Just need to:**
1. Get Google Maps API key
2. Install dependencies
3. Integrate into your app

**All code is in:**
- `storeLocatorService.js` - Complete service
- `southAfricanRetailers.js` - Retailer data
- `IMPLEMENTATION_GUIDE.md` - This guide

Ready to implement! 🚀

