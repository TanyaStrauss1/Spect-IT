# 🇿🇦 South African Retailer & Optometrist Integration Guide

## 🎯 Overview

Connect Spect-IT users to South African retailers and eye care professionals through location-based services.

---

## 🛍️ Shop Integration - South African Retailers

### Major Retailers to Integrate

#### 1. **Spec-Savers**
- **Website**: https://www.specsavers.co.za
- **Products**: Frames, contact lenses, sunglasses
- **Locations**: Nationwide (200+ stores)
- **API**: May need to scrape or contact for partnership

#### 2. **OPSM (Luxottica)**
- **Website**: https://www.opsm.co.za
- **Products**: Premium frames, sunglasses, contact lenses
- **Locations**: Major cities
- **API**: Contact for partnership opportunities

#### 3. **Vision Express**
- **Website**: https://www.visionexpress.co.za
- **Products**: Frames, contact lenses, sunglasses
- **Locations**: Nationwide
- **API**: May need partnership agreement

#### 4. **Independent Optometrists**
- **Database**: Build database of independent practices
- **Products**: Varies by location
- **Locations**: Throughout South Africa

#### 5. **Online Retailers**
- **Takealot**: https://www.takealot.com (eyewear section)
- **Zando**: https://www.zando.co.za (sunglasses)
- **Other online retailers**

---

## 📍 Location-Based Services

### Implementation Options

#### Option 1: Google Maps API (Recommended)
**Best for**: Accurate location, store finder, directions

**Features:**
- ✅ Places API for finding optometrists/opticians
- ✅ Geocoding for address conversion
- ✅ Directions API for navigation
- ✅ Distance calculation
- ✅ Store hours and details

**Cost**: 
- Free tier: $200/month credit
- Places API: ~$17 per 1000 requests
- Directions API: ~$5 per 1000 requests

#### Option 2: Mapbox
**Best for**: Custom maps, good pricing

**Features:**
- ✅ Geocoding API
- ✅ Directions API
- ✅ Custom styling
- ✅ Good South African coverage

**Cost**: 
- Free tier: 50,000 requests/month
- Then $0.50 per 1000 requests

#### Option 3: Here Maps
**Best for**: Enterprise solutions

**Features:**
- ✅ Comprehensive location services
- ✅ Good South African coverage
- ✅ Enterprise features

---

## 🏥 Optometrist & Optician Database

### Data Sources

#### 1. **HPCSA (Health Professions Council of South Africa)**
- **Website**: https://www.hpcsa.co.za
- **Data**: Registered optometrists database
- **Access**: May require API or data partnership

#### 2. **SASO (South African Optometric Association)**
- **Website**: https://www.saoa.co.za
- **Data**: Member optometrists directory
- **Access**: Contact for partnership

#### 3. **Google Places API**
- **Search**: "optometrist near me"
- **Search**: "optician near me"
- **Filter**: By location, rating, hours
- **Data**: Name, address, phone, hours, rating, website

#### 4. **Manual Database Building**
- Create database of major chains
- Add independent practices
- User submissions
- Regular updates

---

## 💻 Implementation Plan

### Phase 1: Location Services Setup

#### 1.1 Google Maps API Setup

```javascript
// Install required packages
npm install @react-native-community/geolocation
npm install react-native-maps
npm install @react-native-community/google-places

// For Expo
expo install expo-location
expo install react-native-maps
```

#### 1.2 API Configuration

```javascript
// config/maps.js
export const GOOGLE_MAPS_API_KEY = 'YOUR_API_KEY';
export const MAPBOX_ACCESS_TOKEN = 'YOUR_MAPBOX_TOKEN';

// API endpoints
export const PLACES_API_BASE = 'https://maps.googleapis.com/maps/api/place';
export const GEOCODING_API = 'https://maps.googleapis.com/maps/api/geocode';
```

---

### Phase 2: Store Locator Component

#### 2.1 Find Nearest Retailers

```javascript
// services/storeLocator.js
import { GOOGLE_MAPS_API_KEY, PLACES_API_BASE } from '../config/maps';

export const findNearestRetailers = async (latitude, longitude, radius = 10000) => {
  const searchQueries = [
    'specsavers',
    'opsm',
    'vision express',
    'optometrist',
    'optician',
    'eyewear store',
    'contact lens store'
  ];

  const results = [];

  for (const query of searchQueries) {
    const url = `${PLACES_API_BASE}/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&keyword=${query}&type=store&key=${GOOGLE_MAPS_API_KEY}`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.results) {
        results.push(...data.results);
      }
    } catch (error) {
      console.error(`Error searching for ${query}:`, error);
    }
  }

  // Remove duplicates and sort by distance
  const uniqueResults = removeDuplicates(results);
  return sortByDistance(uniqueResults, latitude, longitude);
};
```

#### 2.2 Find Optometrists/Opticians

```javascript
// services/optometristFinder.js
export const findNearestOptometrists = async (latitude, longitude, radius = 10000) => {
  const types = ['optometrist', 'ophthalmologist', 'optician'];
  const results = [];

  for (const type of types) {
    const url = `${PLACES_API_BASE}/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=doctor&keyword=${type}&key=${GOOGLE_MAPS_API_KEY}`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.results) {
        results.push(...data.results);
      }
    } catch (error) {
      console.error(`Error searching for ${type}:`, error);
    }
  }

  return sortByDistance(results, latitude, longitude);
};
```

---

### Phase 3: Retailer Database

#### 3.1 South African Retailer Database

```javascript
// data/southAfricanRetailers.js
export const SOUTH_AFRICAN_RETAILERS = [
  {
    id: 'specsavers',
    name: 'Spec-Savers',
    website: 'https://www.specsavers.co.za',
    products: ['frames', 'contact lenses', 'sunglasses'],
    storeLocatorUrl: 'https://www.specsavers.co.za/stores',
    apiAvailable: false,
    contact: 'info@specsavers.co.za'
  },
  {
    id: 'opsm',
    name: 'OPSM',
    website: 'https://www.opsm.co.za',
    products: ['frames', 'contact lenses', 'sunglasses'],
    storeLocatorUrl: 'https://www.opsm.co.za/store-locator',
    apiAvailable: false,
    contact: 'info@opsm.co.za'
  },
  {
    id: 'vision-express',
    name: 'Vision Express',
    website: 'https://www.visionexpress.co.za',
    products: ['frames', 'contact lenses', 'sunglasses'],
    storeLocatorUrl: 'https://www.visionexpress.co.za/store-locator',
    apiAvailable: false,
    contact: 'info@visionexpress.co.za'
  },
  {
    id: 'takealot',
    name: 'Takealot',
    website: 'https://www.takealot.com',
    products: ['frames', 'sunglasses'],
    onlineOnly: true,
    apiAvailable: true,
    apiEndpoint: 'https://api.takealot.com'
  }
];
```

---

### Phase 4: UI Components

#### 4.1 Store Locator Screen

```javascript
// screens/StoreLocatorScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { findNearestRetailers, findNearestOptometrists } from '../services/storeLocator';

export default function StoreLocatorScreen() {
  const [userLocation, setUserLocation] = useState(null);
  const [retailers, setRetailers] = useState([]);
  const [optometrists, setOptometrists] = useState([]);
  const [selectedType, setSelectedType] = useState('retailers'); // 'retailers' or 'optometrists'

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    // Get user's current location
    // Then find nearest retailers/optometrists
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: userLocation?.latitude || -25.7479,
          longitude: userLocation?.longitude || 28.2293,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
      >
        {/* Render markers for retailers/optometrists */}
      </MapView>
    </View>
  );
}
```

---

## 🔌 API Integration Options

### Option 1: Direct Google Places API

**Pros:**
- ✅ Real-time data
- ✅ Accurate locations
- ✅ Store hours, ratings, reviews
- ✅ No database maintenance

**Cons:**
- ❌ API costs
- ❌ Rate limits
- ❌ Requires internet

### Option 2: Hybrid Approach (Recommended)

**Pros:**
- ✅ Cached major retailers
- ✅ Google API for independent practices
- ✅ Faster for known retailers
- ✅ Lower API costs

**Cons:**
- ❌ Requires database maintenance
- ❌ More complex implementation

---

## 📊 Database Schema

### Retailers Table

```sql
CREATE TABLE retailers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  chain_id VARCHAR(100), -- 'specsavers', 'opsm', etc.
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  phone VARCHAR(20),
  email VARCHAR(255),
  website VARCHAR(255),
  products TEXT[], -- ['frames', 'contact lenses', 'sunglasses']
  store_hours JSONB,
  rating DECIMAL(3, 2),
  google_place_id VARCHAR(255),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE INDEX idx_retailers_location ON retailers USING GIST (
  ll_to_earth(latitude, longitude)
);
```

### Optometrists Table

```sql
CREATE TABLE optometrists (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  practice_name VARCHAR(255),
  hpcsa_number VARCHAR(50), -- HPCSA registration number
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  phone VARCHAR(20),
  email VARCHAR(255),
  website VARCHAR(255),
  specialties TEXT[], -- ['general', 'pediatric', 'low vision', etc.]
  languages TEXT[], -- ['English', 'Afrikaans', 'Zulu', etc.]
  accepts_medical_aid BOOLEAN,
  google_place_id VARCHAR(255),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

---

## 🗺️ Implementation Steps

### Step 1: Get Google Maps API Key

1. Go to: https://console.cloud.google.com
2. Create new project or select existing
3. Enable APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
   - Directions API
4. Create API key
5. Restrict key to your app domains

### Step 2: Set Up Location Services

```javascript
// services/locationService.js
import * as Location from 'expo-location';

export const requestLocationPermission = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Location permission denied');
  }
  return true;
};

export const getCurrentLocation = async () => {
  await requestLocationPermission();
  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });
  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  };
};
```

### Step 3: Create Store Finder Component

```javascript
// components/StoreFinder.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { findNearestRetailers } from '../services/storeLocator';

export default function StoreFinder({ productType, userLocation }) {
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);

  useEffect(() => {
    loadStores();
  }, [userLocation, productType]);

  const loadStores = async () => {
    if (userLocation) {
      const results = await findNearestRetailers(
        userLocation.latitude,
        userLocation.longitude
      );
      // Filter by product type if needed
      const filtered = results.filter(store => 
        store.products?.includes(productType)
      );
      setStores(filtered);
    }
  };

  return (
    <View style={styles.container}>
      <MapView style={styles.map}>
        {stores.map(store => (
          <Marker
            key={store.place_id}
            coordinate={{
              latitude: store.geometry.location.lat,
              longitude: store.geometry.location.lng,
            }}
            title={store.name}
            onPress={() => setSelectedStore(store)}
          />
        ))}
      </MapView>
      <FlatList
        data={stores}
        renderItem={({ item }) => (
          <StoreCard store={item} onPress={() => setSelectedStore(item)} />
        )}
      />
    </View>
  );
}
```

---

## 🔗 Integration with Shop Section

### Enhanced Shop Screen

```javascript
// screens/ShopScreen.js
export default function ShopScreen() {
  const [selectedCategory, setSelectedCategory] = useState('frames');
  const [showStoreLocator, setShowStoreLocator] = useState(false);

  return (
    <View>
      {/* Category Selection */}
      <CategoryTabs
        categories={['frames', 'contact lenses', 'sunglasses']}
        selected={selectedCategory}
        onSelect={setSelectedCategory}
      />

      {/* Store Locator Button */}
      <TouchableOpacity onPress={() => setShowStoreLocator(true)}>
        <Text>📍 Find Stores Near Me</Text>
      </TouchableOpacity>

      {/* Product List or Store Locator */}
      {showStoreLocator ? (
        <StoreFinder
          productType={selectedCategory}
          userLocation={userLocation}
        />
      ) : (
        <ProductList category={selectedCategory} />
      )}
    </View>
  );
}
```

---

## 📍 Optometrist Finder Integration

### Add to Results Screen

```javascript
// screens/ResultsScreen.js
export default function ResultsScreen({ testResults }) {
  return (
    <View>
      {/* Test Results */}
      <TestResultsDisplay results={testResults} />

      {/* Find Eye Care Professional */}
      <Section title="Find Eye Care Professional">
        <TouchableOpacity onPress={() => navigate('OptometristFinder')}>
          <Text>📍 Find Nearest Optometrist</Text>
        </TouchableOpacity>
      </Section>
    </View>
  );
}
```

---

## 🗄️ Database Population Strategy

### Initial Data Collection

1. **Major Chains**: Manual entry of known locations
2. **Google Places API**: Bulk search for optometrists/opticians
3. **HPCSA Database**: If accessible, import registered optometrists
4. **User Submissions**: Allow users to add missing locations

### Data Update Strategy

1. **Weekly**: Update major chain locations
2. **Monthly**: Refresh Google Places data
3. **Quarterly**: Verify HPCSA registrations
4. **Real-time**: User-reported changes

---

## 💰 Cost Estimation

### Google Maps API Costs (Monthly)

**For 1,000 users/month:**
- Places API searches: ~5,000 requests = $85
- Geocoding: ~2,000 requests = $10
- Directions: ~1,000 requests = $5
- **Total: ~$100/month**

**With caching:**
- Reduce API calls by 70%
- **Total: ~$30/month**

---

## 🚀 Quick Start Implementation

### 1. Install Dependencies

```bash
cd /Users/tanyastrauss/Spect-IT/SpectITMobile
npm install react-native-maps
npm install @react-native-community/google-places
expo install expo-location
```

### 2. Add Google Maps API Key

```javascript
// app.json
{
  "expo": {
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "YOUR_GOOGLE_MAPS_API_KEY"
        }
      }
    },
    "ios": {
      "config": {
        "googleMapsApiKey": "YOUR_GOOGLE_MAPS_API_KEY"
      }
    }
  }
}
```

### 3. Create Store Locator Service

See code examples above.

---

## ✅ Implementation Checklist

- [ ] Get Google Maps API key
- [ ] Set up location permissions
- [ ] Create store locator service
- [ ] Build retailer database
- [ ] Create optometrist finder
- [ ] Integrate with shop section
- [ ] Add to results screen
- [ ] Test location services
- [ ] Add directions/navigation
- [ ] Implement caching
- [ ] Add filters (distance, rating, hours)
- [ ] Create admin panel for database updates

---

## 🎯 Summary

**Yes, it's absolutely possible!** You can:

1. ✅ Connect shop to South African retailers
2. ✅ Find nearest optometrists/opticians by location
3. ✅ Use Google Maps API for accurate locations
4. ✅ Build database of major retailers
5. ✅ Integrate with existing shop section

**Next Steps:**
1. Get Google Maps API key
2. Implement location services
3. Build store locator component
4. Populate retailer database
5. Integrate with shop section

All code examples and implementation guides are ready above! 🚀

