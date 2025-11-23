// Spect-IT Location Services & Eye Specialist Finder
// Add this script to your website
// Requires: Google Places API key

(function() {
  'use strict';
  
  // Configuration - SET YOUR API KEY HERE
  const CONFIG = {
    googlePlacesApiKey: 'AIzaSyCCEQr9H_OwLccYjDNoTTH_u9cFymPXa08', // Google Maps API Key
    googleMapsApiKey: 'AIzaSyCCEQr9H_OwLccYjDNoTTH_u9cFymPXa08' // Google Maps API Key
  };
  
  let userLocation = null;
  let specialists = [];
  
  // Initialize location services
  async function initializeLocationServices() {
    if (navigator.geolocation) {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          position => {
            userLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              accuracy: position.coords.accuracy
            };
            resolve(userLocation);
          },
          error => {
            console.error('Geolocation error:', error);
            reject(error);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        );
      });
    } else {
      throw new Error('Geolocation is not supported by this browser.');
    }
  }
  
  // Find nearest eye specialists
  window.findSpecialists = async function() {
    try {
      if (!userLocation) {
        await initializeLocationServices();
      }
      
      const statusText = document.getElementById('location-text');
      if (statusText) {
        statusText.textContent = 'Finding specialists near you...';
      }
      
      const foundSpecialists = await searchSpecialists(userLocation);
      specialists = foundSpecialists;
      displaySpecialists(foundSpecialists);
      
      if (statusText) {
        statusText.textContent = `Found ${foundSpecialists.length} specialists near you`;
      }
    } catch (error) {
      console.error('Error finding specialists:', error);
      alert('Please enable location services to find specialists near you.');
    }
  };
  
  // Search for specialists
  async function searchSpecialists(location) {
    const types = ['optometrist', 'ophthalmologist', 'optician', 'eye doctor'];
    const allSpecialists = [];
    
    for (const type of types) {
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/place/nearbysearch/json?` +
          `location=${location.lat},${location.lng}` +
          `&radius=10000` +
          `&type=doctor` +
          `&keyword=${encodeURIComponent(type)}` +
          `&key=${CONFIG.googlePlacesApiKey}`
        );
        
        const data = await response.json();
        
        if (data.results) {
          for (const place of data.results) {
            const distance = calculateDistance(location, {
              lat: place.geometry.location.lat,
              lng: place.geometry.location.lng
            });
            
            allSpecialists.push({
              id: place.place_id,
              name: place.name,
              type: determineSpecialistType(place.name, type),
              location: {
                lat: place.geometry.location.lat,
                lng: place.geometry.location.lng
              },
              address: place.vicinity,
              rating: place.rating || 0,
              totalRatings: place.user_ratings_total || 0,
              distance: distance
            });
          }
        }
      } catch (error) {
        console.error(`Error searching for ${type}:`, error);
      }
    }
    
    // Remove duplicates and sort by distance
    return deduplicateAndSort(allSpecialists);
  }
  
  // Display specialists
  function displaySpecialists(specialistsList) {
    const container = document.getElementById('specialists-container');
    
    if (!container) return;
    
    if (specialistsList.length === 0) {
      container.innerHTML = '<p>No eye specialists found near you. Please try expanding your search radius.</p>';
      return;
    }
    
    container.innerHTML = specialistsList.map(specialist => `
      <div class="specialist-card" data-specialist-id="${specialist.id}">
        <div class="specialist-info">
          <h3>${specialist.name}</h3>
          <p class="specialist-type">${specialist.type.charAt(0).toUpperCase() + specialist.type.slice(1)}</p>
          <div class="specialist-rating">
            ${generateStars(specialist.rating)} 
            <span>${specialist.rating}</span>
            <span class="rating-count">(${specialist.totalRatings} reviews)</span>
          </div>
          <p class="specialist-address">📍 ${specialist.address}</p>
          ${specialist.distance ? `<p class="specialist-distance">${specialist.distance.toFixed(1)} km away</p>` : ''}
          <div class="specialist-actions">
            <button class="btn-get-directions" onclick="getDirections(${specialist.location.lat}, ${specialist.location.lng})">
              Get Directions
            </button>
            <button class="btn-book-appointment" onclick="bookAppointment('${specialist.id}')">
              Book Appointment
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }
  
  // Calculate distance
  function calculateDistance(loc1, loc2) {
    const R = 6371; // Earth's radius in km
    const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
    const dLng = (loc2.lng - loc1.lng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
  
  // Determine specialist type
  function determineSpecialistType(name, searchType) {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('ophthalmologist') || nameLower.includes('eye surgeon')) {
      return 'ophthalmologist';
    } else if (nameLower.includes('optometrist')) {
      return 'optometrist';
    } else if (nameLower.includes('optician')) {
      return 'optician';
    }
    return searchType;
  }
  
  // Generate stars
  function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    return '★'.repeat(fullStars) + (hasHalfStar ? '½' : '') + '☆'.repeat(emptyStars);
  }
  
  // Deduplicate and sort
  function deduplicateAndSort(specialistsList) {
    const seen = new Set();
    const unique = [];
    
    specialistsList.forEach(specialist => {
      if (!seen.has(specialist.id)) {
        seen.add(specialist.id);
        unique.push(specialist);
      }
    });
    
    return unique.sort((a, b) => (a.distance || 0) - (b.distance || 0));
  }
  
  // Get directions
  window.getDirections = function(lat, lng) {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
  };
  
  // Book appointment
  window.bookAppointment = function(specialistId) {
    const specialist = specialists.find(s => s.id === specialistId);
    if (specialist) {
      alert(`Booking appointment with ${specialist.name}\n\nThis will open the booking system.`);
      // Implement booking logic here
    }
  };
  
  // Find retailer stores
  window.findRetailerStores = async function(retailerName) {
    try {
      if (!userLocation) {
        await initializeLocationServices();
      }
      
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?` +
        `location=${userLocation.lat},${userLocation.lng}` +
        `&radius=10000` +
        `&keyword=${encodeURIComponent(retailerName)}` +
        `&key=${CONFIG.googlePlacesApiKey}`
      );
      
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        displayStores(data.results, retailerName);
      } else {
        alert(`No ${retailerName} stores found near you.`);
      }
    } catch (error) {
      console.error('Error finding stores:', error);
      alert('Error finding stores. Please check your location settings.');
    }
  };
  
  // Display stores
  function displayStores(stores, retailerName) {
    const modal = document.createElement('div');
    modal.className = 'store-modal';
    modal.innerHTML = `
      <div class="store-modal-content">
        <h2>${retailerName} Stores Near You</h2>
        <button class="close-modal" onclick="this.closest('.store-modal').remove()">×</button>
        <div class="stores-list">
          ${stores.map(store => {
            const distance = calculateDistance(userLocation, {
              lat: store.geometry.location.lat,
              lng: store.geometry.location.lng
            });
            return `
              <div class="store-item">
                <h3>${store.name}</h3>
                <p>${store.vicinity}</p>
                <p>Rating: ${store.rating || 'N/A'} ⭐</p>
                <p>Distance: ${distance.toFixed(1)} km</p>
                <button onclick="getDirections(${store.geometry.location.lat}, ${store.geometry.location.lng})">
                  Get Directions
                </button>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }
  
  // Auto-initialize location on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      // Auto-find specialists if button exists
      const findButton = document.querySelector('[onclick*="findSpecialists"], button:contains("Find")');
      if (findButton) {
        // Don't auto-find, wait for user click
      }
    });
  }
  
  // Export
  window.SpectITLocation = {
    initializeLocationServices,
    findSpecialists: window.findSpecialists,
    findRetailerStores: window.findRetailerStores,
    getUserLocation: () => userLocation
  };
})();

