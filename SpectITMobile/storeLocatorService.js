/**
 * Store Locator Service for Spect-IT
 * Connects users to South African retailers and eye care professionals
 */

import * as Location from 'expo-location';

// Google Maps API Configuration
const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY_HERE';
const PLACES_API_BASE = 'https://maps.googleapis.com/maps/api/place';
const RADIUS = 10000; // 10km default radius

/**
 * Request location permission
 */
export const requestLocationPermission = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Location permission denied. Please enable location services.');
    }
    return true;
  } catch (error) {
    console.error('Error requesting location permission:', error);
    throw error;
  }
};

/**
 * Get user's current location
 */
export const getCurrentLocation = async () => {
  try {
    await requestLocationPermission();
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
    console.error('Error getting current location:', error);
    throw error;
  }
};

/**
 * Find nearest retailers (frames, contact lenses, sunglasses)
 */
export const findNearestRetailers = async (latitude, longitude, radius = RADIUS) => {
  const searchQueries = [
    'specsavers',
    'opsm',
    'vision express',
    'eyewear store',
    'contact lens store',
    'sunglasses store',
    'optical store',
  ];

  const allResults = [];

  for (const query of searchQueries) {
    try {
      const url = `${PLACES_API_BASE}/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&keyword=${query}&type=store&key=${GOOGLE_MAPS_API_KEY}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === 'OK' && data.results) {
        allResults.push(...data.results.map(result => ({
          ...result,
          type: 'retailer',
          category: categorizeRetailer(result.name, result.types),
        })));
      }
    } catch (error) {
      console.error(`Error searching for ${query}:`, error);
    }
  }

  // Remove duplicates and sort by distance
  const uniqueResults = removeDuplicates(allResults);
  return sortByDistance(uniqueResults, latitude, longitude);
};

/**
 * Find nearest optometrists and opticians
 */
export const findNearestOptometrists = async (latitude, longitude, radius = RADIUS) => {
  const searchQueries = [
    'optometrist',
    'optician',
    'ophthalmologist',
    'eye doctor',
    'eye care',
  ];

  const allResults = [];

  for (const query of searchQueries) {
    try {
      const url = `${PLACES_API_BASE}/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&keyword=${query}&type=doctor&key=${GOOGLE_MAPS_API_KEY}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === 'OK' && data.results) {
        allResults.push(...data.results.map(result => ({
          ...result,
          type: 'optometrist',
          category: categorizeProfessional(result.name, result.types),
        })));
      }
    } catch (error) {
      console.error(`Error searching for ${query}:`, error);
    }
  }

  // Remove duplicates and sort by distance
  const uniqueResults = removeDuplicates(allResults);
  return sortByDistance(uniqueResults, latitude, longitude);
};

/**
 * Get place details (hours, phone, website, etc.)
 */
export const getPlaceDetails = async (placeId) => {
  try {
    const url = `${PLACES_API_BASE}/details/json?place_id=${placeId}&fields=name,formatted_address,formatted_phone_number,website,opening_hours,rating,reviews&key=${GOOGLE_MAPS_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === 'OK' && data.result) {
      return data.result;
    }
    return null;
  } catch (error) {
    console.error('Error getting place details:', error);
    return null;
  }
};

/**
 * Get directions to a location
 */
export const getDirections = async (origin, destination) => {
  try {
    const originStr = `${origin.latitude},${origin.longitude}`;
    const destStr = `${destination.latitude},${destination.longitude}`;
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${originStr}&destination=${destStr}&key=${GOOGLE_MAPS_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === 'OK' && data.routes.length > 0) {
      return {
        distance: data.routes[0].legs[0].distance.text,
        duration: data.routes[0].legs[0].duration.text,
        steps: data.routes[0].legs[0].steps,
        polyline: data.routes[0].overview_polyline.points,
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting directions:', error);
    return null;
  }
};

/**
 * Filter retailers by product type
 */
export const filterRetailersByProduct = (retailers, productType) => {
  const productKeywords = {
    'frames': ['frame', 'eyewear', 'glasses', 'spectacle'],
    'contact lenses': ['contact', 'lens', 'contacts'],
    'sunglasses': ['sunglass', 'sun glass', 'shades'],
  };

  const keywords = productKeywords[productType] || [];
  
  return retailers.filter(retailer => {
    const name = retailer.name?.toLowerCase() || '';
    const types = retailer.types?.join(' ').toLowerCase() || '';
    return keywords.some(keyword => name.includes(keyword) || types.includes(keyword));
  });
};

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

/**
 * Sort results by distance
 */
const sortByDistance = (results, userLat, userLon) => {
  return results
    .map(result => {
      const lat = result.geometry?.location?.lat || result.geometry?.location?.latitude;
      const lon = result.geometry?.location?.lng || result.geometry?.location?.longitude;
      return {
        ...result,
        distance: calculateDistance(userLat, userLon, lat, lon),
      };
    })
    .sort((a, b) => a.distance - b.distance);
};

/**
 * Remove duplicate places
 */
const removeDuplicates = (results) => {
  const seen = new Set();
  return results.filter(result => {
    const placeId = result.place_id;
    if (seen.has(placeId)) {
      return false;
    }
    seen.add(placeId);
    return true;
  });
};

/**
 * Categorize retailer type
 */
const categorizeRetailer = (name, types) => {
  const nameLower = name?.toLowerCase() || '';
  
  if (nameLower.includes('specsavers') || nameLower.includes('spec-savers')) {
    return 'specsavers';
  }
  if (nameLower.includes('opsm')) {
    return 'opsm';
  }
  if (nameLower.includes('vision express')) {
    return 'vision-express';
  }
  if (nameLower.includes('takealot')) {
    return 'online';
  }
  
  return 'independent';
};

/**
 * Categorize professional type
 */
const categorizeProfessional = (name, types) => {
  const nameLower = name?.toLowerCase() || '';
  const typesStr = types?.join(' ').toLowerCase() || '';
  
  if (typesStr.includes('ophthalmologist') || nameLower.includes('ophthalmologist')) {
    return 'ophthalmologist';
  }
  if (typesStr.includes('optometrist') || nameLower.includes('optometrist')) {
    return 'optometrist';
  }
  if (typesStr.includes('optician') || nameLower.includes('optician')) {
    return 'optician';
  }
  
  return 'eye-care-professional';
};

/**
 * Format store information for display
 */
export const formatStoreInfo = (place) => {
  return {
    id: place.place_id,
    name: place.name,
    address: place.vicinity || place.formatted_address,
    rating: place.rating || 'N/A',
    distance: place.distance ? `${place.distance.toFixed(1)} km` : 'Unknown',
    isOpen: place.opening_hours?.open_now !== undefined 
      ? place.opening_hours.open_now 
      : null,
    phone: place.formatted_phone_number || 'Not available',
    website: place.website || null,
    coordinates: {
      latitude: place.geometry?.location?.lat || place.geometry?.location?.latitude,
      longitude: place.geometry?.location?.lng || place.geometry?.location?.longitude,
    },
    type: place.type || 'retailer',
    category: place.category || 'unknown',
  };
};

/**
 * Search for stores by product type and location
 */
export const searchStoresByProduct = async (productType, latitude, longitude, radius = RADIUS) => {
  try {
    const retailers = await findNearestRetailers(latitude, longitude, radius);
    const filtered = filterRetailersByProduct(retailers, productType);
    return filtered.map(formatStoreInfo);
  } catch (error) {
    console.error('Error searching stores by product:', error);
    return [];
  }
};

/**
 * Get comprehensive store and professional data
 */
export const findNearbyEyeCare = async (latitude, longitude, radius = RADIUS) => {
  try {
    const [retailers, optometrists] = await Promise.all([
      findNearestRetailers(latitude, longitude, radius),
      findNearestOptometrists(latitude, longitude, radius),
    ]);

    return {
      retailers: retailers.map(formatStoreInfo),
      optometrists: optometrists.map(formatStoreInfo),
      all: [...retailers, ...optometrists].map(formatStoreInfo).sort((a, b) => a.distance - b.distance),
    };
  } catch (error) {
    console.error('Error finding nearby eye care:', error);
    return {
      retailers: [],
      optometrists: [],
      all: [],
    };
  }
};

export default {
  getCurrentLocation,
  findNearestRetailers,
  findNearestOptometrists,
  getPlaceDetails,
  getDirections,
  searchStoresByProduct,
  findNearbyEyeCare,
  formatStoreInfo,
  calculateDistance,
};

