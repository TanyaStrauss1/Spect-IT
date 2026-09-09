// Find Nearest Eye Care Specialists
// Integrates with Google Places API and location services

let userLocation = null;
let specialistsList = [];
let filteredSpecialists = [];
let maxDistance = 50; // Default max distance in km

// Google Places / Geocoding via Supabase edge function (key stays server-side).
async function spectitPlacesApi(action, params) {
    if (!window.SupabaseStorage || !window.SupabaseStorage.invoke) {
        return { status: 'ERROR', error_message: 'Places proxy unavailable' };
    }
    try {
        const { data, error } = await window.SupabaseStorage.invoke('places-proxy', Object.assign({ action: action }, params || {}));
        if (error) return { status: 'ERROR', error_message: error.message };
        return data || { status: 'ERROR' };
    } catch (e) {
        return { status: 'ERROR', error_message: e.message };
    }
}

// Update distance filter 
function updateDistanceFilter(value) {
    maxDistance = parseInt(value);
    const distanceValueEl = document.getElementById('distance-value');
    if (distanceValueEl) {
        distanceValueEl.textContent = `${maxDistance} km`;
    }
}

function hasUserLocation() {
    return !!(userLocation && typeof userLocation.lat === 'number' && typeof userLocation.lng === 'number');
}

function setLocationStatus(message, color) {
    const locationText = document.getElementById('location-text');
    if (!locationText) return;
    locationText.textContent = message;
    locationText.style.color = color || '';
}

// Curated SA directory — works without GPS or Google Places.
function loadDirectorySpecialists(location, statusMessage) {
    const loc = location && typeof location.lat === 'number' ? location : null;
    const retailers = getKnownSouthAfricanOpticalRetailers(loc);
    specialistsList = retailers;
    filteredSpecialists = retailers;
    displaySpecialists(retailers);
    if (loadingEl) {
        loadingEl.style.display = 'none';
        loadingEl.hidden = true;
        loadingEl.setAttribute('aria-hidden', 'true');
    }
    if (statusMessage) setLocationStatus(statusMessage);
    return retailers;
}

// Apply distance filter
function applyDistanceFilter() {
    if (specialistsList.length > 0) {
        displaySpecialists(specialistsList);
        return;
    }
    loadDirectorySpecialists(userLocation, 'Browse the Spect-IT directory, or pick a city to sort by distance.');
}

// Background sync system for optometrist database
let syncInProgress = false;
let lastSyncTime = null;
const SYNC_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

// Sync optometrist database (can be called manually or automatically)
async function syncOptometristDatabase(location = null) {
    if (syncInProgress) {
        console.log('Sync already in progress, skipping...');
        return;
    }
    
    // Check if sync is needed (not synced in last 24 hours)
    if (lastSyncTime && (Date.now() - lastSyncTime < SYNC_INTERVAL)) {
        console.log('Database recently synced, skipping...');
        return;
    }
    
    syncInProgress = true;
    console.log('🔄 Starting optometrist database sync...');
    
    try {
        // Use user location if available, otherwise use a central South Africa location
        const syncLocation = location || userLocation || { lat: -29.0, lng: 24.0 }; // Central SA
        
        const knownRetailers = getKnownSouthAfricanOpticalRetailers(syncLocation);
        console.log(`✅ Loaded ${knownRetailers.length} known retailers`);
        
        const allOptometrists = knownRetailers;
        
        if (window.saveOptometristsBatchToSupabase && allOptometrists.length > 0) {
            const result = await window.saveOptometristsBatchToSupabase(allOptometrists);
            console.log(`💾 Database sync complete: ${result.saved} saved, ${result.failed} failed`);
        }
        
        lastSyncTime = Date.now();
        
        // Store last sync time in localStorage
        localStorage.setItem('optometrist_db_last_sync', lastSyncTime.toString());
        
    } catch (error) {
        console.error('❌ Database sync failed:', error);
    } finally {
        syncInProgress = false;
    }
}


// Initialize background sync on page load
function initializeOptometristDatabaseSync() {
    loadDirectorySpecialists(null, 'Browse the Spect-IT directory, or pick a city to sort by distance.');
}

// Initialize location services
async function findNearestSpecialists() {
    console.log('findNearestSpecialists called');
    
    const statusEl = document.getElementById('location-status');
    const loadingEl = document.getElementById('specialists-loading');
    const containerEl = document.getElementById('specialists-container');
    const filterControls = document.getElementById('filter-controls');
    
    // Safety checks
    if (!statusEl) {
        console.error('location-status element not found');
        alert('Error: Page elements not loaded. Please refresh the page.');
        return;
    }
    
    if (!loadingEl) {
        console.error('specialists-loading element not found');
    }
    
    if (!containerEl) {
        console.error('specialists-container element not found');
    }
    
    try {
        // Show loading
        if (loadingEl) {
            loadingEl.hidden = false;
            loadingEl.setAttribute('aria-hidden', 'false');
            loadingEl.style.display = 'block';
        }
        if (containerEl) {
            containerEl.innerHTML = '';
        }
        
        const locationText = statusEl.querySelector('#location-text');
        if (locationText) {
            locationText.textContent = 'Getting your location...';
            locationText.style.color = '';
        }
        
        console.log('Requesting user location...');
        
        // Get user location
        if (!userLocation) {
            try {
                userLocation = await getUserLocation();
                console.log('User location obtained:', userLocation);
            } catch (locError) {
                console.error('Location error:', locError);
                showManualLocationInput();
                loadDirectorySpecialists(null, 'Location not shared. Browse the directory or pick a city.');
                if (loadingEl) loadingEl.style.display = 'none';
                return;
            }
        }
        
        if (!userLocation) {
            console.log('No user location, showing directory');
            showManualLocationInput();
            loadDirectorySpecialists(null, 'Location not shared. Browse the directory or pick a city.');
            if (loadingEl) loadingEl.style.display = 'none';
            return;
        }
        
        if (locationText) {
            const distanceKm = maxDistance || parseInt(document.getElementById('distance-slider')?.value || document.getElementById('distance-filter')?.value || 50);
            locationText.textContent = 
                `Location found! Searching within ${distanceKm} km...`;
        }
        
        console.log('Searching for specialists at:', userLocation);
        
        // Search for specialists
        const distance = (maxDistance || parseInt(document.getElementById('distance-slider')?.value || document.getElementById('distance-filter')?.value || 50)) * 1000; // Convert to meters
        console.log('Search radius:', distance, 'meters');
        
        if (locationText) {
            locationText.textContent = `🔍 Searching with AI-powered intelligence...`;
        }
        
        const specialists = await searchEyeSpecialists(userLocation, distance);
        console.log('Specialists found:', specialists.length);
        
        if (!specialists || specialists.length === 0) {
            console.log('No specialists found');
            if (loadingEl) loadingEl.style.display = 'none';
            loadDirectorySpecialists(userLocation, 'No live search results nearby. Showing the Spect-IT directory instead.');
            return;
        }
        
        // AI-Enhanced: Rank results using AI if available
        let rankedSpecialists = specialists;
        if (window.aiVisionEngine && specialists.length > 0) {
            try {
                rankedSpecialists = await rankSpecialistsWithAI(specialists, userLocation);
                console.log('[AI] ✅ Specialists ranked with AI intelligence');
            } catch (aiError) {
                console.warn('[AI] Ranking failed (non-critical):', aiError);
                rankedSpecialists = specialists; // Fallback to original order
            }
        }
        
        specialistsList = rankedSpecialists;
        filteredSpecialists = rankedSpecialists;
        
        // Hide loading
        if (loadingEl) loadingEl.style.display = 'none';
        if (filterControls) filterControls.style.display = 'flex';
        
        // Update status
        if (locationText) {
            const aiBadge = rankedSpecialists !== specialists ? ' 🤖 AI-Ranked' : '';
            const distanceKm = maxDistance || parseInt(document.getElementById('distance-slider')?.value || 50);
            locationText.textContent = `Found ${rankedSpecialists.length} specialist(s) within ${distanceKm} km${aiBadge}`;
            locationText.style.color = '#10b981';
        }
        
        // Display results
        console.log('Displaying specialists');
        displaySpecialists(rankedSpecialists);
        
    } catch (error) {
        console.error('Error finding specialists:', error);
        console.error('Error stack:', error.stack);
        
        if (loadingEl) loadingEl.style.display = 'none';
        
        // Show helpful error message with options
        const errorMsg = error.message || 'An error occurred while searching for specialists.';
        
        const statusText = statusEl.querySelector('#location-text');
        if (statusText) {
            statusText.textContent = `Error: ${errorMsg}`;
            statusText.style.color = '#f44336';
        }
        
        showManualLocationInput();
        loadDirectorySpecialists(userLocation, 'Search hit a problem. Showing the Spect-IT directory instead.');
    }
}

// Get user location
function getUserLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            // Fallback: Try to use IP-based location or show manual input
            console.warn('Geolocation not supported, using fallback');
            getLocationByIP().then(resolve).catch(() => {
                reject(new Error('Geolocation is not supported. Please enter your location manually.'));
            });
            return;
        }
        
        // Request location with better error handling
        navigator.geolocation.getCurrentPosition(
            position => {
                userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy
                };
                console.log('Location obtained:', userLocation);
                resolve(userLocation);
            },
            error => {
                console.error('Geolocation error:', error);
                // Provide more specific error messages
                let errorMessage = 'Location access denied.';
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'Location permission denied. Please enable location services in your browser settings or enter location manually.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Location information unavailable. Please check your device settings or enter location manually.';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'Location request timed out. Please try again or enter location manually.';
                        break;
                    default:
                        errorMessage = 'Unable to get your location. Please enter location manually.';
                        break;
                }
                // Try IP-based location as fallback
                getLocationByIP().then(resolve).catch(() => {
                    reject(new Error(errorMessage));
                });
            },
            {
                enableHighAccuracy: false, // Changed to false for better compatibility
                timeout: 20000, // Increased timeout
                maximumAge: 600000 // 10 minutes - cache location longer
            }
        );
    });
}

// Fallback: Get location by IP address
async function getLocationByIP() {
    try {
        // Use a free IP geolocation service
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        
        if (data.latitude && data.longitude) {
            userLocation = {
                lat: parseFloat(data.latitude),
                lng: parseFloat(data.longitude),
                accuracy: 10000, // IP-based location is less accurate
                source: 'ip'
            };
            console.log('Location obtained via IP:', userLocation);
            return userLocation;
        }
        throw new Error('Could not get location from IP');
    } catch (error) {
        console.error('IP geolocation failed:', error);
        throw error;
    }
}

// Show location error with options
function showLocationError(errorMessage) {
    setLocationStatus(errorMessage || 'Location not available.', '#ef4444');
    showManualLocationInput();
    loadDirectorySpecialists(userLocation, 'Browse the Spect-IT directory, or pick a city.');
}

function showManualLocationInput() {
    const panel = document.getElementById('manual-location-panel');
    if (panel) {
        panel.hidden = false;
        const input = document.getElementById('location-address');
        if (input) {
            try { input.focus(); } catch (e) {}
        }
        return;
    }
    setLocationStatus('Enter a city or address, or use a quick-city button.', '');
}

// AI-Enhanced Search by address with intelligent geocoding
async function searchByAddress() {
    const addressInput = document.getElementById('location-address');
    const address = addressInput ? addressInput.value.trim() : '';
    
    if (!address) {
        alert('Please enter a location');
        return;
    }
    
    const loadingEl = document.getElementById('specialists-loading');
    const containerEl = document.getElementById('specialists-container');
    const filterControls = document.getElementById('filter-controls');
    const statusEl = document.getElementById('location-status');
    
    if (!containerEl || !statusEl) {
        console.error('Required elements not found');
        alert('Error: Page elements not loaded. Please refresh the page.');
        return;
    }
    
    if (loadingEl) loadingEl.style.display = 'block';
    const quickCoords = getCityCoordinates(address);
    if (quickCoords) {
        userLocation = quickCoords;
        loadDirectorySpecialists(quickCoords, 'Showing directory practices near ' + address + '. Searching for more…');
    }
    setLocationStatus('Searching for "' + address + '"…');
    
    try {
        // AI-Enhanced: Use AI for intelligent address parsing and normalization
        let searchAddress = address;
        
        // AI-powered address enhancement
        if (window.aiVisionEngine) {
            try {
                // Normalize address using AI (if available)
                const normalizedAddress = await enhanceAddressWithAI(address);
                if (normalizedAddress) {
                    searchAddress = normalizedAddress;
                    console.log('[AI] Address enhanced:', normalizedAddress);
                }
            } catch (aiError) {
                console.warn('[AI] Address enhancement failed (non-critical):', aiError);
            }
        }
        
        // Add "South Africa" if not present for better results
        if (!searchAddress.toLowerCase().includes('south africa') && !searchAddress.toLowerCase().includes('sa')) {
            searchAddress = searchAddress + ', South Africa';
        }
        
        // Geocode address to get coordinates
        // Try Geocoding API first
        let data = await spectitPlacesApi('geocode', { address: searchAddress, region: 'za' });
        
        // If Geocoding API is denied, try Places API Text Search as fallback
        if (data.status === 'REQUEST_DENIED' || data.status === 'OVER_QUERY_LIMIT') {
            console.warn('Geocoding API denied, trying Places API Text Search fallback');
            
            // Use Places API Text Search as fallback
            data = await spectitPlacesApi('textsearch', { query: searchAddress });
            
            if (data.status === 'OK' && data.results && data.results.length > 0) {
                const place = data.results[0];
                userLocation = {
                    lat: place.geometry.location.lat,
                    lng: place.geometry.location.lng,
                    address: place.formatted_address
                };
            } else {
                // Final fallback: Use known city coordinates
                const cityCoords = getCityCoordinates(searchAddress);
                if (cityCoords) {
                    userLocation = cityCoords;
                } else {
                    throw new Error('Could not find that location. Please try a different address or use the quick city buttons.');
                }
            }
        } else if (data.status === 'OK' && data.results && data.results.length > 0) {
            const location = data.results[0].geometry.location;
            const formattedAddress = data.results[0].formatted_address;
            
            userLocation = {
                lat: location.lat,
                lng: location.lng,
                address: formattedAddress
            };
        } else if (data.status === 'ZERO_RESULTS') {
            // Try city coordinates fallback
            const cityCoords = getCityCoordinates(searchAddress);
            if (cityCoords) {
                userLocation = cityCoords;
            } else {
                throw new Error('Could not find that location. Please try a different address or use the quick city buttons.');
            }
        } else {
            // Try city coordinates fallback
            const cityCoords = getCityCoordinates(searchAddress);
            if (cityCoords) {
                userLocation = cityCoords;
            } else {
                throw new Error(`Location error: ${data.status}. Please try a different address or use the quick city buttons.`);
            }
        }
        
        // AI-Enhanced: Search for specialists with the obtained location
        const distance = (maxDistance || parseInt(document.getElementById('distance-slider')?.value || 50)) * 1000;
        
        setLocationStatus('Location found. Searching specialists…');
        
        const specialists = await searchEyeSpecialists(userLocation, distance);
        
        // AI-Enhanced: Rank results using AI if available
        let rankedSpecialists = specialists;
        if (window.aiVisionEngine && specialists.length > 0) {
            try {
                rankedSpecialists = await rankSpecialistsWithAI(specialists, userLocation);
                console.log('[AI] Specialists ranked with AI');
            } catch (aiError) {
                console.warn('[AI] Ranking failed (non-critical):', aiError);
                rankedSpecialists = specialists; // Fallback to original order
            }
        }
        
        specialistsList = rankedSpecialists;
        filteredSpecialists = rankedSpecialists;
        
        if (loadingEl) loadingEl.style.display = 'none';
        if (filterControls) filterControls.style.display = 'flex';
        
        const shownAddress = userLocation.address || searchAddress;
        const distanceKm = maxDistance || parseInt(document.getElementById('distance-slider')?.value || 50);
        setLocationStatus(`Found ${rankedSpecialists.length} specialist(s) near ${shownAddress} (within ${distanceKm} km). Times you pick are requests until the practice confirms.`, '#10b981');
        
        displaySpecialists(rankedSpecialists);
    } catch (error) {
        console.error('Error searching by address:', error);
        console.error('Error stack:', error.stack);
        
        if (loadingEl) loadingEl.style.display = 'none';
        
        if (specialistsList.length > 0) {
            setLocationStatus('Could not refine that address. Showing the Spect-IT directory. Try a city button if this is not the right area.');
            return;
        }
        const errorMsg = error.message || 'An error occurred while searching. Please try again or use a city button.';
        setLocationStatus(errorMsg, '#f44336');
        loadDirectorySpecialists(userLocation, 'Showing the Spect-IT directory.');
    }
}

// Search by city
function searchByCity(cityName) {
    const coords = getCityCoordinates(cityName + ', South Africa') || getCityCoordinates(cityName);
    const addressInput = document.getElementById('location-address');
    if (addressInput) addressInput.value = cityName + ', South Africa';
    if (!coords) {
        showManualLocationInput();
        searchByAddress();
        return;
    }
    userLocation = Object.assign({}, coords, { source: 'city' });
    loadDirectorySpecialists(userLocation, 'Showing directory practices near ' + cityName + '. Times you pick are requests until the practice confirms.');
}

function resetLocationSearch() {
    userLocation = null;
    const panel = document.getElementById('manual-location-panel');
    if (panel) panel.hidden = true;
    loadDirectorySpecialists(null, 'Browse the Spect-IT directory, or pick a city to sort by distance.');
}

// Enhanced function to extract contact details from text
function extractContactDetails(text) {
    if (!text) return { phone: '', email: '', website: '' };
    
    // Extract phone numbers (South African format: +27, 0, or 27 prefix)
    const phonePatterns = [
        /(\+27\s?[0-9]{2}\s?[0-9]{3}\s?[0-9]{4})/g,  // +27 XX XXX XXXX
        /(0[0-9]{2}\s?[0-9]{3}\s?[0-9]{4})/g,        // 0XX XXX XXXX
        /(27[0-9]{2}\s?[0-9]{3}\s?[0-9]{4})/g,       // 27XX XXX XXXX
        /(\([0-9]{2,4}\)\s?[0-9]{3,4}\s?[0-9]{3,4})/g // (XX) XXX XXXX
    ];
    
    let phone = '';
    for (const pattern of phonePatterns) {
        const match = text.match(pattern);
        if (match && match[0]) {
            phone = match[0].trim();
            break;
        }
    }
    
    // Extract email addresses
    const emailPattern = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
    const emailMatch = text.match(emailPattern);
    const email = emailMatch ? emailMatch[0] : '';
    
    // Extract website URLs
    const websitePattern = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;
    const websiteMatch = text.match(websitePattern);
    let website = websiteMatch ? websiteMatch[0] : '';
    if (website && !website.startsWith('http')) {
        website = 'https://' + website;
    }
    
    return { phone, email, website };
}


// Get known South African optical retailers - Comprehensive database
function getKnownSouthAfricanOpticalRetailers(location) {
    const retailers = [
        { name: 'Spec-Savers Sandton City', address: 'Sandton City, Sandton, Johannesburg', lat: -26.1075, lng: 28.0578, type: 'optician', website: 'https://www.specsavers.co.za' },
        { name: 'Spec-Savers Canal Walk', address: 'Canal Walk, Century City, Cape Town', lat: -33.8920, lng: 18.5040, type: 'optician', website: 'https://www.specsavers.co.za' },
        { name: 'Spec-Savers Gateway', address: 'Gateway Theatre of Shopping, Umhlanga, Durban', lat: -29.7234, lng: 31.0734, type: 'optician', website: 'https://www.specsavers.co.za' },
        { name: 'Spec-Savers Menlyn', address: 'Menlyn Park Shopping Centre, Pretoria', lat: -25.7833, lng: 28.2667, type: 'optician', website: 'https://www.specsavers.co.za' },
        { name: 'Spec-Savers Eastgate', address: 'Eastgate Shopping Centre, Johannesburg', lat: -26.1833, lng: 28.0667, type: 'optician', website: 'https://www.specsavers.co.za' },
        { name: 'Spec-Savers Cresta', address: 'Cresta Shopping Centre, Johannesburg', lat: -26.1333, lng: 28.0167, type: 'optician', website: 'https://www.specsavers.co.za' },
        { name: 'Spec-Savers Hyde Park', address: 'Hyde Park Corner, Johannesburg', lat: -26.1167, lng: 28.0167, type: 'optician', website: 'https://www.specsavers.co.za' },
        { name: 'Spec-Savers Cavendish', address: 'Cavendish Square, Claremont, Cape Town', lat: -33.9800, lng: 18.4700, type: 'optician', website: 'https://www.specsavers.co.za' },
        { name: 'Spec-Savers Pavilion', address: 'The Pavilion, Westville, Durban', lat: -29.8333, lng: 30.9167, type: 'optician', website: 'https://www.specsavers.co.za' },
        { name: 'Spec-Savers Brooklyn', address: 'Brooklyn Mall, Pretoria', lat: -25.7667, lng: 28.2333, type: 'optician', website: 'https://www.specsavers.co.za' },
        { name: 'Spec-Savers V&A Waterfront', address: 'V&A Waterfront, Cape Town', lat: -33.9064, lng: 18.4200, type: 'optician', website: 'https://www.specsavers.co.za' },
        { name: 'Spec-Savers Tyger Valley', address: 'Tyger Valley Shopping Centre, Cape Town', lat: -33.8700, lng: 18.6200, type: 'optician', website: 'https://www.specsavers.co.za' },
        { name: 'Spec-Savers Clearwater', address: 'Clearwater Mall, Roodepoort, Johannesburg', lat: -26.1500, lng: 27.8667, type: 'optician', website: 'https://www.specsavers.co.za' },
        { name: 'Spec-Savers Mall of Africa', address: 'Mall of Africa, Midrand, Johannesburg', lat: -25.9833, lng: 28.1333, type: 'optician', website: 'https://www.specsavers.co.za' },
        { name: 'Spec-Savers Greenacres', address: 'Greenacres Shopping Centre, Gqeberha', lat: -33.9608, lng: 25.6022, type: 'optician', website: 'https://www.specsavers.co.za' },
        { name: 'Spec-Savers Baywest', address: 'Baywest Mall, Gqeberha', lat: -33.9833, lng: 25.6333, type: 'optician', website: 'https://www.specsavers.co.za' },
        { name: 'Spec-Savers Loch Logan', address: 'Loch Logan Waterfront, Bloemfontein', lat: -29.0852, lng: 26.1596, type: 'optician', website: 'https://www.specsavers.co.za' },
        { name: 'Spec-Savers Mall of the North', address: 'Mall of the North, Polokwane', lat: -23.9045, lng: 29.4689, type: 'optician', website: 'https://www.specsavers.co.za' },
        { name: 'Spec-Savers Riverside', address: 'Riverside Mall, Mbombela', lat: -25.4745, lng: 30.9703, type: 'optician', website: 'https://www.specsavers.co.za' },
        { name: 'OPSM V&A Waterfront', address: 'V&A Waterfront, Cape Town', lat: -33.9064, lng: 18.4200, type: 'optician', website: 'https://www.opsm.co.za' },
        { name: 'OPSM Sandton City', address: 'Sandton City, Sandton, Johannesburg', lat: -26.1075, lng: 28.0578, type: 'optician', website: 'https://www.opsm.co.za' },
        { name: 'OPSM Gateway', address: 'Gateway Theatre of Shopping, Umhlanga, Durban', lat: -29.7234, lng: 31.0734, type: 'optician', website: 'https://www.opsm.co.za' },
        { name: 'OPSM Hyde Park', address: 'Hyde Park Corner, Johannesburg', lat: -26.1167, lng: 28.0167, type: 'optician', website: 'https://www.opsm.co.za' },
        { name: 'OPSM Cavendish', address: 'Cavendish Square, Claremont, Cape Town', lat: -33.9800, lng: 18.4700, type: 'optician', website: 'https://www.opsm.co.za' },
        { name: 'Vision Express Gateway', address: 'Gateway Theatre of Shopping, Umhlanga, Durban', lat: -29.7234, lng: 31.0734, type: 'optician', website: 'https://www.visionexpress.co.za' },
        { name: 'Vision Express Sandton', address: 'Sandton City, Sandton, Johannesburg', lat: -26.1075, lng: 28.0578, type: 'optician', website: 'https://www.visionexpress.co.za' },
        { name: 'Vision Express V&A', address: 'V&A Waterfront, Cape Town', lat: -33.9064, lng: 18.4200, type: 'optician', website: 'https://www.visionexpress.co.za' }
    ];
    
    return retailers.map((retailer, index) => {
        const hasLoc = location && typeof location.lat === 'number' && typeof location.lng === 'number';
        const distance = hasLoc ? calculateDistance(location, { lat: retailer.lat, lng: retailer.lng }) : null;
        const province = getProvinceFromLocation({ lat: retailer.lat, lng: retailer.lng }, retailer.address);
        const city = extractCityFromAddress(retailer.address);
        
        return {
            place_id: `known-retailer-${index}`,
            name: retailer.name,
            type: retailer.type,
            address: retailer.address,
            location: { lat: retailer.lat, lng: retailer.lng },
            phone: retailer.phone || '',
            email: retailer.email || '',
            website: retailer.website || '',
            rating: typeof retailer.rating === 'number' ? retailer.rating : 0,
            rating_count: typeof retailer.rating_count === 'number' ? retailer.rating_count : 0,
            distance: distance,
            licensed: '',
            license_info: '',
            license_verify_url: 'https://www.hpcsa.co.za/PublicSearch',
            source: 'Spect-IT directory — confirm the store with the retailer before you visit',
            province: province,
            city: city,
            price_level: retailer.price_level
        };
    });
}

// Extract city name from address
function extractCityFromAddress(address) {
    if (!address) return '';
    
    // Common South African city patterns
    const cities = [
        'Johannesburg', 'Cape Town', 'Durban', 'Pretoria', 'Port Elizabeth',
        'Bloemfontein', 'East London', 'Nelspruit', 'Polokwane', 'Kimberley',
        'Pietermaritzburg', 'Rustenburg', 'Welkom', 'Potchefstroom', 'Klerksdorp',
        'George', 'Stellenbosch', 'Paarl', 'Somerset West', 'Newcastle',
        'Richards Bay', 'Vereeniging', 'Boksburg', 'Benoni', 'Germiston',
        'Krugersdorp', 'Randburg', 'Roodepoort', 'Centurion', 'Midrand',
        'Alberton', 'Uitenhage', 'Queenstown', 'Grahamstown', 'Worcester',
        'Oudtshoorn', 'Mossel Bay', 'Knysna', 'Jeffreys Bay', 'Plettenberg Bay',
        'Gqeberha', 'Mbombela', 'Century City',
        'Sandton', 'Rosebank', 'Claremont', 'Umhlanga', 'Westville', 'Hillcrest',
        'Pinetown', 'Amanzimtoti', 'Ballito', 'Arcadia', 'Brooklyn', 'Menlyn',
        'Irene', 'Silverton', 'Summerstrand', 'Richmond Hill'
    ];
    
    for (const city of cities) {
        if (address.toLowerCase().includes(city.toLowerCase())) {
            return city;
        }
    }
    
    return '';
}

// AI-Enhanced Geocode address to coordinates with validation
async function geocodeAddress(address) {
    try {
        // Add "South Africa" if not present
        let searchAddress = address;
        if (!address.toLowerCase().includes('south africa') && !address.toLowerCase().includes('sa')) {
            searchAddress = address + ', South Africa';
        }
        
        // Try multiple geocoding strategies
        const geocodeStrategies = [
            // Strategy 1: Full address with South Africa
            searchAddress,
            // Strategy 2: Add "Cape Town" if Western Cape address
            address.toLowerCase().includes('cape') || address.toLowerCase().includes('western') 
                ? address + ', Cape Town, South Africa' 
                : null,
            // Strategy 3: Just the address as-is
            address
        ].filter(Boolean);
        
        for (const strategy of geocodeStrategies) {
            try {
                const data = await spectitPlacesApi('geocode', { address: strategy, region: 'za' });
                
                if (data.status === 'OK' && data.results && data.results.length > 0) {
                    const result = data.results[0];
                    const location = result.geometry.location;
                    
                    // AI-Enhanced: Validate location using AI Vision Engine if available
                    let validatedLocation = { lat: location.lat, lng: location.lng };
                    
                    if (window.aiVisionEngine && window.aiVisionEngine.estimateDistanceAI) {
                        try {
                            const aiValidation = await window.aiVisionEngine.estimateDistanceAI(validatedLocation);
                            if (aiValidation && aiValidation.confidence > 0.7) {
                                console.log('[AI] Location validated:', aiValidation);
                                // Use AI-validated location if confidence is high
                                if (aiValidation.location) {
                                    validatedLocation = aiValidation.location;
                                }
                            }
                        } catch (aiError) {
                            console.warn('[AI] Location validation failed (non-critical):', aiError);
                        }
                    }
                    
                    // Check if result is in South Africa (basic validation)
                    const isInSA = result.address_components.some(component => 
                        component.types.includes('country') && component.short_name === 'ZA'
                    );
                    
                    if (isInSA) {
                        return validatedLocation;
                    }
                }
            } catch (strategyError) {
                console.warn(`Geocoding strategy failed for "${strategy}":`, strategyError);
                continue;
            }
        }
        
        // Fallback: Try with city-specific coordinates for Cape Town
        if (address.toLowerCase().includes('cape town') || address.toLowerCase().includes('cape')) {
            // Return approximate Cape Town center if geocoding fails
            return { lat: -33.9249, lng: 18.4241 };
        }
        
    } catch (error) {
        console.error('Geocoding error:', error);
    }
    return null;
}

// Cache for search results (to avoid re-searching same location)
const searchCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// AI-Enhanced Search for Eye Specialists using Google Places API
async function searchEyeSpecialists(location, radius = 500000) { // 500km to cover all of South Africa
    // AI-Enhanced: Use AI Vision Engine for location validation if available
    if (window.aiVisionEngine && window.aiVisionEngine.estimateDistanceAI) {
        try {
            const aiDistance = await window.aiVisionEngine.estimateDistanceAI(location);
            if (aiDistance && aiDistance.confidence > 0.7) {
                console.log('[AI] Location validated with AI:', aiDistance);
            }
        } catch (error) {
            console.warn('[AI] Location validation failed (non-critical):', error);
        }
    }
    
    // Check cache first
    const cacheKey = `${location.lat.toFixed(2)}_${location.lng.toFixed(2)}_${radius}`;
    const cached = searchCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
        console.log('Using cached results');
        return cached.results;
    }
    
    const specialists = [];
    const seenPlaceIds = new Set(); // For duplicate detection
    
    // STEP 1: Get optometrists from Supabase database FIRST (fastest, most comprehensive)
    console.log('Step 1: Loading optometrists from database...');
    if (window.getOptometristsFromSupabase) {
        try {
            const dbOptometrists = await window.getOptometristsFromSupabase(location, radius / 1000); // Convert to km
            dbOptometrists.forEach(opt => {
                if (!seenPlaceIds.has(opt.place_id)) {
                    specialists.push(opt);
                    seenPlaceIds.add(opt.place_id);
                }
            });
            console.log(`✅ Found ${dbOptometrists.length} optometrists from database`);
        } catch (error) {
            console.warn('Database query failed (non-critical):', error);
        }
    }
    
    // STEP 2: Get known retailers (instant, no API calls)
    console.log('Step 2: Loading known retailers...');
    const knownRetailers = getKnownSouthAfricanOpticalRetailers(location);
    knownRetailers.forEach(retailer => {
        if (!seenPlaceIds.has(retailer.place_id)) {
            specialists.push(retailer);
            seenPlaceIds.add(retailer.place_id);
        }
    });
    console.log(`Found ${knownRetailers.length} known retailers`);
    
    // STEP 3: Nearby search for user's location (FASTEST API method)
    console.log('Step 3: Searching nearby user location...');
    const nearbySearchPromise = (async () => {
        try {
            // Determine if user is in Western Cape/Cape Town area
            const isCapeTown = location && (
                (location.lat >= -34.5 && location.lat <= -33.5 && location.lng >= 18.0 && location.lng <= 19.0) ||
                (location.city && location.city.toLowerCase().includes('cape town'))
            );
            
            // Use nearby search with multiple keywords in parallel
            // Add Cape Town-specific queries if in the area
            const nearbyQueries = isCapeTown 
                ? ['optometrist', 'optician', 'eye doctor', 'eye care', 'optometrist cape town', 'optician cape town', 'eye care cape town']
                : ['optometrist', 'optician', 'eye doctor', 'eye care'];
            const nearbyPromises = nearbyQueries.map(keyword => {
                return spectitPlacesApi('nearbysearch', { lat: location.lat, lng: location.lng, radius: Math.min(radius, 50000), keyword: keyword }).catch(error => { console.error(`Error fetching nearby search for "${keyword}":`, error); return { status: 'ERROR', results: [] }; });
            });
            
            const nearbyResults = await Promise.all(nearbyPromises);
            const nearbySpecialists = [];
            
            nearbyResults.forEach(data => {
                if (data.status === 'OK' && data.results) {
                    data.results.slice(0, 10).forEach(place => {
                        if (!seenPlaceIds.has(place.place_id)) {
                            const distance = calculateDistance(location, {
                                lat: place.geometry.location.lat,
                                lng: place.geometry.location.lng
                            });
                            
                            const specialistType = determineSpecialistType(place, '');
                            const isLicensed = checkIfLicensed(place, specialistType);
                            
                            nearbySpecialists.push({
                                place_id: place.place_id,
                                name: place.name,
                                type: specialistType,
                                address: place.vicinity || place.formatted_address || 'Address not available',
                                location: {
                                    lat: place.geometry.location.lat,
                                    lng: place.geometry.location.lng
                                },
                                rating: place.rating || 0,
                                rating_count: place.user_ratings_total || 0,
                                distance: distance,
                                open_now: place.opening_hours?.open_now,
                                price_level: place.price_level,
                                phone: place.formatted_phone_number || place.international_phone_number || '',
                                website: place.website || '',
                                licensed: isLicensed.licensed,
                                license_info: isLicensed.info,
                                license_verify_url: isLicensed.verifyUrl,
                                source: 'Google Places API (Nearby)'
                            });
                            seenPlaceIds.add(place.place_id);
                        }
                    });
                }
            });
            
            return nearbySpecialists;
        } catch (error) {
            console.error('Error in nearby search:', error);
            return [];
        }
    })();
    
    // Curated directory + Places only. Do not scrape retailer websites.
    
    // Major South African cities and regions for comprehensive search
    const majorCities = [
        // Major Cities
        { name: 'Johannesburg', lat: -26.2041, lng: 28.0473 },
        { name: 'Cape Town', lat: -33.9249, lng: 18.4241 },
        { name: 'Durban', lat: -29.8587, lng: 31.0218 },
        { name: 'Pretoria', lat: -25.7479, lng: 28.2293 },
        { name: 'Port Elizabeth', lat: -33.9608, lng: 25.6022 },
        { name: 'Bloemfontein', lat: -29.0852, lng: 26.1596 },
        { name: 'East London', lat: -33.0292, lng: 27.8546 },
        { name: 'Nelspruit', lat: -25.4745, lng: 30.9703 },
        { name: 'Polokwane', lat: -23.9045, lng: 29.4689 },
        { name: 'Kimberley', lat: -28.7282, lng: 24.7499 },
        // Additional cities and regions
        { name: 'Pietermaritzburg', lat: -29.6006, lng: 30.3794 },
        { name: 'Rustenburg', lat: -25.6544, lng: 27.2422 },
        { name: 'Welkom', lat: -27.9833, lng: 26.7333 },
        { name: 'Potchefstroom', lat: -26.7167, lng: 27.1000 },
        { name: 'Klerksdorp', lat: -26.8667, lng: 26.6667 },
        { name: 'George', lat: -33.9583, lng: 22.4614 },
        { name: 'Stellenbosch', lat: -33.9347, lng: 18.8667 },
        { name: 'Paarl', lat: -33.7333, lng: 18.9667 },
        { name: 'Somerset West', lat: -34.0833, lng: 18.8500 },
        { name: 'Newcastle', lat: -27.7500, lng: 29.9333 },
        { name: 'Pietermaritzburg', lat: -29.6006, lng: 30.3794 },
        { name: 'Richards Bay', lat: -28.7833, lng: 32.0500 },
        { name: 'Vereeniging', lat: -26.6731, lng: 27.9261 },
        { name: 'Boksburg', lat: -26.2111, lng: 28.2592 },
        { name: 'Benoni', lat: -26.1881, lng: 28.3206 },
        { name: 'Germiston', lat: -26.2167, lng: 28.1667 },
        { name: 'Krugersdorp', lat: -26.1000, lng: 27.7667 },
        { name: 'Randburg', lat: -26.1000, lng: 28.0167 },
        { name: 'Roodepoort', lat: -26.1500, lng: 27.8667 },
        { name: 'Centurion', lat: -25.8606, lng: 28.1897 },
        { name: 'Midrand', lat: -25.9833, lng: 28.1333 },
        { name: 'Alberton', lat: -26.2667, lng: 28.1167 },
        { name: 'Uitenhage', lat: -33.7667, lng: 25.4000 },
        { name: 'Queenstown', lat: -31.9000, lng: 26.8833 },
        { name: 'Grahamstown', lat: -33.3000, lng: 26.5333 },
        { name: 'King Williams Town', lat: -32.8833, lng: 27.4000 },
        { name: 'Worcester', lat: -33.6500, lng: 19.4333 },
        { name: 'Oudtshoorn', lat: -33.5833, lng: 22.2000 },
        { name: 'Mossel Bay', lat: -34.1833, lng: 22.1333 },
        { name: 'Knysna', lat: -34.0333, lng: 23.0500 },
        { name: 'Jeffreys Bay', lat: -34.0500, lng: 24.9167 },
        { name: 'Plettenberg Bay', lat: -34.0500, lng: 23.3667 }
    ];
    
    // Try multiple search strategies for better results - ALL eye specialists
    const searchQueries = [
        // Strategy 1: Text search (most reliable) - Comprehensive eye specialist search
        { method: 'text', query: 'optometrist' },
        { method: 'text', query: 'optometrists' },
        { method: 'text', query: 'optometry' },
        { method: 'text', query: 'ophthalmologist' },
        { method: 'text', query: 'ophthalmologists' },
        { method: 'text', query: 'ophthalmology' },
        { method: 'text', query: 'optician' },
        { method: 'text', query: 'opticians' },
        { method: 'text', query: 'eye doctor' },
        { method: 'text', query: 'eye doctors' },
        { method: 'text', query: 'eye specialist' },
        { method: 'text', query: 'eye specialists' },
        { method: 'text', query: 'eye care' },
        { method: 'text', query: 'eye care center' },
        { method: 'text', query: 'eye care centre' },
        { method: 'text', query: 'vision center' },
        { method: 'text', query: 'vision centre' },
        { method: 'text', query: 'eye clinic' },
        { method: 'text', query: 'eye clinics' },
        { method: 'text', query: 'optical store' },
        { method: 'text', query: 'optical shop' },
        { method: 'text', query: 'eyewear' },
        { method: 'text', query: 'contact lens fitting' },
        { method: 'text', query: 'glasses prescription' }
    ];
    
    // Optimized search: Focus on top 4 cities and 2 most effective queries for speed
    // Reduced from 8 cities x 4 queries = 32 calls to 4 cities x 2 queries = 8 calls
    const topCities = majorCities.slice(0, 4); // Top 4 cities only for speed
    const priorityQueries = [
        { method: 'text', query: 'optometrist' },
        { method: 'text', query: 'optician' }
    ]; // Top 2 most effective queries only
    
    // Use Promise.all for parallel searches (much faster)
    const searchPromises = [];
    
    for (const city of topCities) {
        for (const query of priorityQueries) {
            const searchPromise = (async () => {
                try {
                    // Text search with city name for better results
                    const data = await spectitPlacesApi('textsearch', { query: query.query + ' in ' + city.name + ', South Africa' });
                    
                    // Handle API errors
                    if (data.status === 'REQUEST_DENIED') {
                        console.error('Google Places API key denied or invalid');
                        return [];
                    }
                    if (data.status === 'OVER_QUERY_LIMIT') {
                        console.warn('Google Places API quota exceeded');
                        return [];
                    }
                    
                    // Handle API errors quickly
                    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
                        return [];
                    }
                    
                    // Limit results per query for speed (reduced from 15 to 10)
                    const maxResultsPerQuery = 10;
                    const resultsToProcess = data.results.slice(0, maxResultsPerQuery);
                    
                    return resultsToProcess.map(place => {
                        // Skip if already seen
                        if (seenPlaceIds.has(place.place_id)) {
                            return null;
                        }
                        seenPlaceIds.add(place.place_id);
                        
                        const distance = calculateDistance(location, {
                            lat: place.geometry.location.lat,
                            lng: place.geometry.location.lng
                        });
                        
                        const specialistType = determineSpecialistType(place, query.query);
                        const isLicensed = checkIfLicensed(place, specialistType);
                        
                        return {
                            place_id: place.place_id,
                            name: place.name,
                            type: specialistType,
                            address: place.vicinity || place.formatted_address || 'Address not available',
                            location: {
                                lat: place.geometry.location.lat,
                                lng: place.geometry.location.lng
                            },
                            rating: place.rating || 0,
                            rating_count: place.user_ratings_total || 0,
                            distance: distance,
                            open_now: place.opening_hours?.open_now,
                            price_level: place.price_level,
                            licensed: isLicensed.licensed,
                            license_info: isLicensed.info,
                            license_verify_url: isLicensed.verifyUrl,
                            source: 'Google Places API'
                        };
                    }).filter(r => r !== null); // Remove nulls
                } catch (error) {
                    console.error(`Error searching for ${query.query} in ${city.name}:`, error);
                    return [];
                }
            })();
            
            searchPromises.push(searchPromise);
        }
    }
    
    // Execute nearby search and city searches in parallel
    console.log(`Executing ${searchPromises.length} city searches + 1 nearby search in parallel...`);
    let nearbyResults = [];
    let cityResults = [];
    
    try {
        const allResults = await Promise.all([nearbySearchPromise, ...searchPromises]);
        nearbyResults = allResults[0] || [];
        cityResults = allResults.slice(1) || [];
    } catch (error) {
        console.error('Error in parallel search:', error);
        nearbyResults = [];
        cityResults = [];
    }
    
    // Add nearby results first (closest to user)
    if (nearbyResults && Array.isArray(nearbyResults)) {
        nearbyResults.forEach(specialist => {
            if (!seenPlaceIds.has(specialist.place_id)) {
                specialists.push(specialist);
                seenPlaceIds.add(specialist.place_id);
            }
        });
    }
    
    // Add city search results
    if (cityResults && Array.isArray(cityResults)) {
        cityResults.forEach(result => {
            if (Array.isArray(result)) {
                result.forEach(specialist => {
                    if (!seenPlaceIds.has(specialist.place_id)) {
                        specialists.push(specialist);
                        seenPlaceIds.add(specialist.place_id);
                    }
                });
            }
        });
    }
    
    // Fetch phone numbers for specialists that don't have them (batch fetch for speed)
    console.log('Fetching contact details for specialists without phone numbers...');
    const specialistsWithoutPhone = specialists.filter(s => !s.phone && s.place_id && !s.place_id.startsWith('known-retailer-') && !s.place_id.startsWith('scraped-'));
    
    if (specialistsWithoutPhone.length > 0) {
        console.log(`Found ${specialistsWithoutPhone.length} specialists without phone numbers, fetching details...`);
        // Fetch phone numbers in parallel (limit to 20 to avoid rate limits)
        const phoneFetchPromises = specialistsWithoutPhone.slice(0, 20).map(async (specialist) => {
            try {
                const data = await spectitPlacesApi('details', { placeId: specialist.place_id, fields: 'formatted_phone_number,international_phone_number,website' });
                
                if (data.status === 'OK' && data.result) {
                    specialist.phone = data.result.formatted_phone_number || data.result.international_phone_number || '';
                    specialist.website = data.result.website || '';
                    if (specialist.phone) {
                        console.log(`✅ Fetched phone for ${specialist.name}: ${specialist.phone}`);
                    }
                } else {
                    console.warn(`⚠️ No phone found for ${specialist.name} (status: ${data.status})`);
                }
            } catch (error) {
                console.warn(`❌ Failed to fetch details for ${specialist.name}:`, error);
            }
        });
        
        await Promise.all(phoneFetchPromises);
        const fetchedCount = specialistsWithoutPhone.filter(s => s.phone).length;
        console.log(`✅ Fetched contact details: ${fetchedCount}/${specialistsWithoutPhone.length} specialists now have phone numbers`);
    } else {
        console.log('✅ All specialists already have phone numbers');
    }
    
    // If no results from API or scraping, use fallback data
    if (specialists.length === 0) {
        console.log('No results from API or scraping, using fallback data');
        const fallback = getFallbackSpecialists(location);
        specialists.push(...fallback);
    }
    
    // Add province information to each specialist
    specialists.forEach(specialist => {
        specialist.province = getProvinceFromLocation(specialist.location, specialist.address);
    });
    
    // AI-Enhanced: Sort and rank specialists using AI intelligence
    let limitedSpecialists = specialists;
    if (window.aiVisionEngine && specialists.length > 0) {
        try {
            // Use AI ranking for better results (considers distance, rating, license, etc.)
            limitedSpecialists = await rankSpecialistsWithAI(specialists, location);
            console.log('[AI] ✅ Specialists ranked with AI intelligence');
        } catch (aiError) {
            console.warn('[AI] Ranking failed, using distance sort:', aiError);
            // Fallback to distance-based sorting
            limitedSpecialists = [...specialists].sort((a, b) => a.distance - b.distance);
        }
    } else {
        // Sort by distance from user location (proximity) if AI not available
        limitedSpecialists = [...specialists].sort((a, b) => a.distance - b.distance);
    }
    
    // Limit to top results for performance
    const maxResults = 300;
    limitedSpecialists = limitedSpecialists.slice(0, maxResults);
    
    console.log(`Total specialists found: ${limitedSpecialists.length} (${knownRetailers.length} known + ${nearbyResults?.length || 0} nearby + ${cityResults.flat().length} from cities)`);
    
    // Cache results
    searchCache.set(cacheKey, {
        results: limitedSpecialists,
        timestamp: Date.now()
    });
    
    // Clean old cache entries (keep only last 10)
    if (searchCache.size > 10) {
        const oldestKey = Array.from(searchCache.keys())[0];
        searchCache.delete(oldestKey);
    }
    
    return limitedSpecialists;
}

// Determine South African province from location or address
function getProvinceFromLocation(location, address) {
    const lat = location && location.lat;
    const lng = location && location.lng;
    const addressLower = (address || '').toLowerCase();

    if (addressLower.includes('gauteng') || addressLower.includes('johannesburg') || addressLower.includes('pretoria') ||
        addressLower.includes('sandton') || addressLower.includes('soweto') || addressLower.includes('centurion') ||
        addressLower.includes('randburg') || addressLower.includes('roodepoort') || addressLower.includes('midrand') ||
        addressLower.includes('benoni') || addressLower.includes('boksburg') || addressLower.includes('germiston') ||
        addressLower.includes('krugersdorp') || addressLower.includes('alberton') || addressLower.includes('vereeniging')) {
        return 'Gauteng';
    }
    if (addressLower.includes('western cape') || addressLower.includes('cape town') || addressLower.includes('stellenbosch') ||
        addressLower.includes('paarl') || addressLower.includes('george') || addressLower.includes('knysna') ||
        addressLower.includes('worcester') || addressLower.includes('somerset west') || addressLower.includes('hermanus') ||
        addressLower.includes('mossel bay') || addressLower.includes('oudtshoorn') || addressLower.includes('plettenberg') ||
        addressLower.includes('claremont') || addressLower.includes('sea point') || addressLower.includes('green point') ||
        addressLower.includes('durbanville') || addressLower.includes('fish hoek') || addressLower.includes('muizenberg')) {
        return 'Western Cape';
    }
    if (addressLower.includes('kwazulu') || addressLower.includes('durban') || addressLower.includes('umhlanga') ||
        addressLower.includes('pietermaritzburg') || addressLower.includes('ballito') || addressLower.includes('pinetown') ||
        addressLower.includes('westville') || addressLower.includes('richards bay') || addressLower.includes('newcastle')) {
        return 'KwaZulu-Natal';
    }
    if (addressLower.includes('eastern cape') || addressLower.includes('port elizabeth') || addressLower.includes('gqeberha') ||
        addressLower.includes('east london') || addressLower.includes('jeffreys bay') || addressLower.includes('grahamstown') ||
        addressLower.includes('makhanda') || addressLower.includes('uitenhage') || addressLower.includes('kariega')) {
        return 'Eastern Cape';
    }
    if (addressLower.includes('free state') || addressLower.includes('bloemfontein') || addressLower.includes('welkom')) {
        return 'Free State';
    }
    if (addressLower.includes('mpumalanga') || addressLower.includes('nelspruit') || addressLower.includes('mbombela')) {
        return 'Mpumalanga';
    }
    if (addressLower.includes('limpopo') || addressLower.includes('polokwane')) {
        return 'Limpopo';
    }
    if (addressLower.includes('northern cape') || addressLower.includes('kimberley') || addressLower.includes('upington') ||
        addressLower.includes('springbok')) {
        return 'Northern Cape';
    }
    if (addressLower.includes('north west') || addressLower.includes('northwest') || addressLower.includes('rustenburg') ||
        addressLower.includes('potchefstroom') || addressLower.includes('klerksdorp') || addressLower.includes('mafikeng') ||
        addressLower.includes('mahikeng')) {
        return 'North West';
    }

    if (typeof lat !== 'number' || typeof lng !== 'number') return 'Unknown';

    // Approximate boxes; Garden Route sits east of Cape Town.
    if (lat >= -35.0 && lat <= -31.2 && lng >= 17.0 && lng <= 24.2) return 'Western Cape';
    if (lat >= -26.7 && lat <= -25.0 && lng >= 27.0 && lng <= 29.3) return 'Gauteng';
    if (lat >= -31.2 && lat <= -26.8 && lng >= 28.7 && lng <= 32.9) return 'KwaZulu-Natal';
    if (lat >= -34.5 && lat <= -30.5 && lng >= 23.5 && lng <= 30.0) return 'Eastern Cape';
    if (lat >= -30.5 && lat <= -26.5 && lng >= 24.2 && lng <= 29.3) return 'Free State';
    if (lat >= -27.2 && lat <= -24.0 && lng >= 29.2 && lng <= 32.2) return 'Mpumalanga';
    if (lat >= -25.2 && lat <= -22.0 && lng >= 26.5 && lng <= 31.8) return 'Limpopo';
    if (lat >= -32.8 && lat <= -26.0 && lng >= 16.4 && lng <= 25.5) return 'Northern Cape';
    if (lat >= -28.2 && lat <= -24.8 && lng >= 22.5 && lng <= 28.2) return 'North West';

    return 'Unknown';
}

function getFallbackSpecialists(location) {
    return getKnownSouthAfricanOpticalRetailers(location);
}

// Determine specialist type
function determineSpecialistType(place, searchType) {
    const name = place.name.toLowerCase();
    const types = place.types || [];
    
    if (name.includes('ophthalmologist') || name.includes('ophthalmology') || types.includes('ophthalmologist')) {
        return 'ophthalmologist';
    }
    if (name.includes('optometrist') || name.includes('optometry') || types.includes('optometrist')) {
        return 'optometrist';
    }
    if (name.includes('optician') || name.includes('optical') || types.includes('optician')) {
        return 'optician';
    }
    if (name.includes('retina') || name.includes('retinal')) {
        return 'retina_specialist';
    }
    if (name.includes('cornea')) {
        return 'cornea_specialist';
    }
    if (name.includes('glaucoma')) {
        return 'glaucoma_specialist';
    }
    if (name.includes('pediatric') || name.includes('paediatric')) {
        return 'pediatric_ophthalmologist';
    }
    if (name.includes('contact lens')) {
        return 'contact_lens_specialist';
    }
    if (name.includes('eye doctor') || name.includes('eye specialist') || name.includes('eye care')) {
        return 'eye_specialist';
    }
    
    return searchType || 'eye_care';
}

// HPCSA registration cannot be verified from a name or Google listing.
function checkIfLicensed(place, specialistType) {
    let licenseInfo = 'Verify registration on the HPCSA public register.';
    if (specialistType === 'ophthalmologist' || specialistType === 'optometrist') {
        licenseInfo = 'Optometrists and ophthalmologists should be on the HPCSA public register.';
    } else if (specialistType === 'optician') {
        licenseInfo = 'Confirm the store and practitioner with the retailer. HPCSA registration is not shown here.';
    }
    return {
        licensed: '',
        info: licenseInfo,
        verifyUrl: 'https://www.hpcsa.co.za/PublicSearch'
    };
}

// Calculate distance between two points (Haversine formula)
function calculateDistance(point1, point2) {
    const R = 6371; // Earth's radius in km
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLng = (point2.lng - point1.lng) * Math.PI / 180;
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}

// Display specialists organized by province
function displaySpecialists(specialists) {
    const container = document.getElementById('specialists-container');
    
    if (!container) {
        console.error('specialists-container element not found');
        return;
    }
    
    if (!specialists || specialists.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <p>No specialists in the directory yet. Pick a city above or try Find Nearest Specialists.</p>
            </div>
        `;
        return;
    }

    const located = hasUserLocation();

    if (!located) {
        const byProvince = {};
        specialists.forEach(specialist => {
            const province = specialist.province || 'South Africa';
            byProvince[province] = (byProvince[province] || 0) + 1;
        });
        const rows = Object.keys(byProvince).sort().map(function (province) {
            const n = byProvince[province];
            return '<li><strong>' + province + '</strong> — ' + n + ' practice' + (n === 1 ? '' : 's') + '</li>';
        }).join('');
        const summary = document.getElementById('specialists-summary');
        if (summary) summary.innerHTML = '';
        container.innerHTML =
            '<div class="directory-overview">' +
                '<p>The Spect-IT directory lists <strong>' + specialists.length + '</strong> named optical stores at major malls. Pick a city to sort by distance. Confirm the store with the retailer before you visit. Times you pick are requests until the practice confirms.</p>' +
                '<ul class="directory-provinces">' + rows + '</ul>' +
            '</div>';
        return;
    }
    
    specialists.forEach(specialist => {
        if ((specialist.distance == null || !isFinite(specialist.distance)) && specialist.location && userLocation) {
            specialist.distance = calculateDistance(userLocation, specialist.location);
        }
    });
    
    const sorted = [...specialists].sort((a, b) => {
        const distA = (a.distance != null && isFinite(a.distance)) ? a.distance : Infinity;
        const distB = (b.distance != null && isFinite(b.distance)) ? b.distance : Infinity;
        if (Math.abs(distA - distB) > 0.1) {
            return distA - distB;
        }
        return (a.name || '').localeCompare(b.name || '');
    });
    
    const filtered = sorted.filter(s => {
        const dist = (s.distance != null && isFinite(s.distance)) ? s.distance : Infinity;
        return dist <= maxDistance;
    });
    
    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <p>No specialists found within ${maxDistance} km. Try increasing the distance filter.</p>
            </div>
        `;
        return;
    }
    
    // Group by province, but keep nearest first within each province
    const byProvince = {};
    filtered.forEach(specialist => {
        const province = specialist.province || 'Unknown';
        if (!byProvince[province]) {
            byProvince[province] = [];
        }
        byProvince[province].push(specialist);
    });
    
    // Sort specialists within each province by distance
    Object.keys(byProvince).forEach(province => {
        byProvince[province].sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
    });
    
    // Sort provinces by closest distance
    const provinces = Object.keys(byProvince).sort((a, b) => {
        const minA = Math.min(...byProvince[a].map(s => s.distance || Infinity));
        const minB = Math.min(...byProvince[b].map(s => s.distance || Infinity));
        return minA - minB;
    });
    
    // Show summary of results with nearest location
    const summary = document.getElementById('specialists-summary');
    if (summary) {
        const nearest = filtered[0];
        const nearestHasDist = nearest && nearest.distance != null && isFinite(nearest.distance);
        const nearestDistance = nearestHasDist ? nearest.distance.toFixed(1) : null;
        const nearestName = nearest ? nearest.name : 'N/A';
        
        summary.innerHTML = `
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 1.5rem; border-radius: 12px; margin-bottom: 1.5rem; color: white; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
                    <div>
                        <h3 style="margin: 0 0 0.5rem 0; font-size: 1.3rem; color: white;">Search results</h3>
                        <p style="margin: 0; font-size: 1rem; opacity: 0.95;">
                            <strong>${filtered.length}</strong> specialist(s) found in <strong>${provinces.length}</strong> province(s)
                        </p>
                    </div>
                    ${nearest ? `
                    <div style="text-align: right; background: rgba(255, 255, 255, 0.2); padding: 1rem; border-radius: 8px; backdrop-filter: blur(10px);">
                        <div style="font-size: 0.9rem; opacity: 0.9; margin-bottom: 0.5rem; font-weight: 600;">📍 Nearest Location</div>
                        <div style="font-weight: 700; font-size: 1.1rem; margin-bottom: 0.25rem;">${nearestName}</div>
                        <div style="font-size: 0.95rem; opacity: 0.9; display: flex; align-items: center; gap: 0.5rem; justify-content: flex-end;">
                            <span>${nearestDistance ? nearestDistance + ' km away' : 'Pick a city to see distance'}</span>
                        </div>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
    }
    
    // Build HTML organized by province
    let html = '';
    
    provinces.forEach(province => {
        const provinceSpecialists = byProvince[province].sort((a, b) => {
            const da = (a.distance != null && isFinite(a.distance)) ? a.distance : Infinity;
            const db = (b.distance != null && isFinite(b.distance)) ? b.distance : Infinity;
            return da - db;
        });
        const provinceCount = provinceSpecialists.length;
        const closestRaw = provinceSpecialists[0] && provinceSpecialists[0].distance;
        const closestDistance = (closestRaw != null && isFinite(closestRaw)) ? closestRaw.toFixed(1) : null;
        
        html += `
            <div class="province-section" style="margin-bottom: 2.5rem;">
                <div class="province-header" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <h3 style="margin: 0; font-size: 1.3rem; display: flex; align-items: center; gap: 0.5rem;">
                        🗺️ ${province}
                        <span style="font-size: 0.9rem; font-weight: normal; opacity: 0.9;">
                            (${provinceCount} ${provinceCount === 1 ? 'specialist' : 'specialists'})
                        </span>
                    </h3>
                    <p style="margin: 0.5rem 0 0 0; font-size: 0.9rem; opacity: 0.9;">
                        Closest: ${closestDistance ? closestDistance + ' km away' : 'distance unavailable'}
                    </p>
                </div>
                <div class="specialists-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem;">
        `;
        
        provinceSpecialists.forEach(specialist => {
            // License status badge
            let licenseBadge = '';
            if (specialist.licensed === 'verified') {
                licenseBadge = '<span class="license-badge verified" title="License verified">Verified licence</span>';
            } else if (specialist.licensed === 'likely') {
                licenseBadge = '<span class="license-badge unknown" title="Confirm registration with HPCSA">Confirm HPCSA registration</span>';
            }
            
            html += `
        <div class="specialist-card">
            <div class="specialist-header">
                <h3>${specialist.name}</h3>
                <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
                    <span class="specialist-type ${specialist.type}">${formatSpecialistType(specialist.type)}</span>
                    ${licenseBadge}
                </div>
            </div>
            <div class="specialist-info">
                <p class="specialist-address">📍 ${specialist.address}</p>
                ${specialist.distance != null && isFinite(specialist.distance) ? `<p class="specialist-distance">${specialist.distance.toFixed(1)} km away</p>` : ''}
                ${(() => {
                    // Extract phone number - check ALL possible sources
                    let phone = specialist.phone || specialist.formatted_phone_number || specialist.international_phone_number || '';
                    
                    // If no phone in specialist object, try to extract from address
                    if (!phone) {
                        const address = specialist.address || '';
                        const phoneMatch = address.match(/(\+?\d{1,3}[\s-]?)?\(?\d{2,4}\)?[\s-]?\d{3,4}[\s-]?\d{3,4}/);
                        if (phoneMatch) phone = phoneMatch[0];
                    }
                    
                    // Clean phone for tel: link
                    let phoneClean = phone ? phone.replace(/\s+/g, '').replace(/[^\d+]/g, '') : '';
                    
                    // Ensure proper format for tel: links
                    if (phoneClean && !phoneClean.startsWith('+')) {
                        if (phoneClean.startsWith('0')) {
                            phoneClean = '+27' + phoneClean.substring(1);
                        } else if (phoneClean.startsWith('27')) {
                            phoneClean = '+' + phoneClean;
                        } else if (phoneClean.length >= 9) {
                            phoneClean = '+27' + phoneClean;
                        }
                    }
                    
                    // Always show contact section - phone, website, or message
                    const phoneEscaped = phoneClean ? phoneClean.replace(/'/g, "\\'") : '';
                    const website = specialist.website || '';
                    
                    if (phone && phoneClean) {
                        return `
                        <div class="specialist-contact" style="margin: 0.75rem 0; padding: 0.75rem; background: #f0f9ff; border-radius: 6px; border-left: 3px solid #667eea;">
                            <p style="margin: 0; font-weight: 600; color: #667eea; display: flex; align-items: center; gap: 0.5rem;">
                                📞 <a href="tel:${phoneClean}" onclick="event.preventDefault(); event.stopPropagation(); callPhoneNumber('${phoneEscaped}'); return false;" style="color: #667eea; text-decoration: none; font-weight: 600; cursor: pointer;">${phone}</a>
                            </p>
                            ${website ? `
                                <p style="margin: 0.5rem 0 0 0; font-size: 0.9rem;">
                                    🌐 <a href="${website}" target="_blank" style="color: #667eea; text-decoration: none;">Visit Website</a>
                                </p>
                            ` : ''}
                            <button onclick="event.preventDefault(); event.stopPropagation(); callPhoneNumber('${phoneEscaped}'); return false;" style="margin-top: 0.5rem; padding: 0.5rem 1rem; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 0.9rem; width: 100%;">
                                📞 Call Now
                            </button>
                        </div>
                    `;
                    } else if (website) {
                        return `
                        <div class="specialist-contact" style="margin: 0.75rem 0; padding: 0.75rem; background: #f0f9ff; border-radius: 6px; border-left: 3px solid #667eea;">
                            <p style="margin: 0; font-size: 0.9rem; color: #666;">
                                📞 Phone: Not available
                            </p>
                            <p style="margin: 0.5rem 0 0 0; font-size: 0.9rem;">
                                🌐 <a href="${website}" target="_blank" style="color: #667eea; text-decoration: none; font-weight: 600;">Visit Website</a>
                            </p>
                        </div>
                    `;
                    } else {
                        return `
                        <div class="specialist-contact" style="margin: 0.75rem 0; padding: 0.75rem; background: #fff3cd; border-radius: 6px; border-left: 3px solid #ffc107;">
                            <p style="margin: 0; font-size: 0.9rem; color: #856404;">
                                ⚠️ Contact details not available. Click "Details" button to view more information or call.
                            </p>
                        </div>
                    `;
                    }
                })()}
                ${specialist.rating > 0 ? `
                    <div class="specialist-rating">
                        <span class="stars">${generateStars(specialist.rating)}</span>
                        <span>${specialist.rating.toFixed(1)}</span>
                        ${specialist.rating_count > 0 ? `<span class="rating-count">(${specialist.rating_count} reviews)</span>` : ''}
                    </div>
                ` : ''}
                ${specialist.source ? `
                    <p style="font-size: 0.75rem; color: #888; margin-top: 0.5rem; font-style: italic;">
                        📍 Source: ${specialist.source}
                    </p>
                ` : ''}
                ${specialist.licensed ? `
                    <div class="license-info" style="margin-top: 0.75rem; padding: 0.75rem; background: #f0f9ff; border-radius: 6px; border-left: 3px solid #667eea;">
                        <p style="font-size: 0.85rem; color: #666; margin-bottom: 0.25rem;">
                            <strong>License Status:</strong> 
                            <span style="color: ${specialist.licensed === 'likely' || specialist.licensed === 'verified' ? '#10b981' : '#f59e0b'};">
                                ${specialist.licensed === 'likely' ? 'Likely Licensed' : specialist.licensed === 'verified' ? 'Verified' : 'Unknown - Verify Required'}
                            </span>
                        </p>
                        ${specialist.license_info ? `<p style="font-size: 0.8rem; color: #666; margin-bottom: 0.5rem;">${specialist.license_info}</p>` : ''}
                        ${specialist.license_verify_url ? `
                            <a href="${specialist.license_verify_url}" target="_blank" 
                               style="font-size: 0.8rem; color: #667eea; text-decoration: none; font-weight: 600;">
                                🔍 Verify License on HPCSA →
                            </a>
                        ` : ''}
                    </div>
                ` : ''}
                ${specialist.open_now !== undefined ? `
                    <p class="specialist-hours ${specialist.open_now ? 'open' : 'closed'}">
                        ${specialist.open_now ? '🟢 Open now' : '🔴 Closed'}
                    </p>
                ` : ''}
            </div>
            <div class="specialist-actions" style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 1rem;">
                ${(() => {
                    // Extract phone for call button
                    let phone = specialist.phone || '';
                    if (!phone) {
                        const address = specialist.address || '';
                        const phoneMatch = address.match(/(\+?\d{1,3}[\s-]?)?\(?\d{2,4}\)?[\s-]?\d{3,4}[\s-]?\d{3,4}/);
                        if (phoneMatch) phone = phoneMatch[0];
                    }
                    // Clean phone for tel: link
                    let phoneClean = phone ? phone.replace(/\s+/g, '').replace(/[^\d+]/g, '') : '';
                    
                    // Ensure proper format for tel: links
                    if (phoneClean && !phoneClean.startsWith('+')) {
                        if (phoneClean.startsWith('0')) {
                            phoneClean = '+27' + phoneClean.substring(1);
                        } else if (phoneClean.startsWith('27')) {
                            phoneClean = '+' + phoneClean;
                        } else {
                            phoneClean = '+27' + phoneClean;
                        }
                    }
                    
                    const phoneEscaped = phoneClean ? phoneClean.replace(/'/g, "\\'") : '';
                    
                    return `
                        <button class="btn" onclick="event.preventDefault(); event.stopPropagation(); bookAppointment('${specialist.place_id}'); return false;" style="flex: 1 1 100%; min-width: 100%; padding: 0.85rem; background: linear-gradient(135deg,#6366f1,#8b5cf6); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 700; box-shadow: 0 6px 16px -6px rgba(99,102,241,.6);">
                            Request a time
                        </button>
                        <button class="btn btn-primary" onclick="event.preventDefault(); event.stopPropagation(); getDirections(${specialist.location.lat}, ${specialist.location.lng}); return false;" style="flex: 1; min-width: 120px; padding: 0.75rem; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                            🗺️ Directions
                        </button>
                        <button class="btn btn-secondary" onclick="event.preventDefault(); event.stopPropagation(); viewSpecialistDetails('${specialist.place_id}'); return false;" style="flex: 1; min-width: 120px; padding: 0.75rem; background: #f0f9ff; color: #667eea; border: 2px solid #667eea; border-radius: 6px; cursor: pointer; font-weight: 600;">
                            📋 Details
                        </button>
                        ${phone && phoneClean ? `
                            <button class="btn btn-primary" onclick="event.preventDefault(); event.stopPropagation(); callPhoneNumber('${phoneEscaped}'); return false;" style="flex: 1; min-width: 120px; padding: 0.75rem; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                                📞 Call
                            </button>
                        ` : `
                            <button class="btn btn-secondary" onclick="event.preventDefault(); event.stopPropagation(); callSpecialist('${specialist.place_id}'); return false;" style="flex: 1; min-width: 120px; padding: 0.75rem; background: #f0f9ff; color: #667eea; border: 2px solid #667eea; border-radius: 6px; cursor: pointer; font-weight: 600;">
                                📞 Call
                            </button>
                        `}
                    `;
                })()}
            </div>
        </div>
    `;
        });
        
        html += `
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Format specialist type
function formatSpecialistType(type) {
    const types = {
        'optometrist': 'Optometrist',
        'ophthalmologist': 'Ophthalmologist',
        'optician': 'Optician',
        'eye_care': 'Eye Care',
        'eye_specialist': 'Eye Specialist',
        'retina_specialist': 'Retina Specialist',
        'cornea_specialist': 'Cornea Specialist',
        'glaucoma_specialist': 'Glaucoma Specialist',
        'pediatric_ophthalmologist': 'Pediatric Ophthalmologist',
        'contact_lens_specialist': 'Contact Lens Specialist'
    };
    return types[type] || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

// Generate star rating
function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    return '★'.repeat(fullStars) + (hasHalfStar ? '½' : '') + '☆'.repeat(emptyStars);
}

// Filter specialists
function filterSpecialists() {
    const typeFilter = document.getElementById('specialist-type-filter').value;
    const distanceFilter = parseInt(document.getElementById('distance-slider')?.value || document.getElementById('distance-filter')?.value || maxDistance || 50);
    
    filteredSpecialists = specialistsList.filter(specialist => {
        const typeMatch = typeFilter === 'all' || specialist.type === typeFilter;
        const distanceMatch = specialist.distance <= distanceFilter;
        return typeMatch && distanceMatch;
    });
    
    displaySpecialists(filteredSpecialists);
}

// Get directions
function getDirections(lat, lng) {
    if (!userLocation) {
        alert('Please find specialists first to get your location.');
        return;
    }
    
    const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${lat},${lng}`;
    window.open(url, '_blank');
}

// View specialist details
async function viewSpecialistDetails(placeId) {
    // First, try to find specialist in our existing list (faster, works for known retailers)
    const specialist = specialistsList.find(s => s.place_id === placeId);
    
    if (specialist) {
        // Use existing data - show immediately
        showSpecialistModalFromData(specialist);
        return;
    }
    
    // If not found, try Google Places API for additional details
    try {
        const data = await spectitPlacesApi('details', { placeId: placeId, fields: 'name,formatted_address,formatted_phone_number,international_phone_number,website,opening_hours,rating,user_ratings_total,reviews,photos' });
        
        if (data.status === 'OK' && data.result) {
            const place = data.result;
            showSpecialistModal(place);
        } else {
            // If API fails, try to find by name or show error
            alert('Could not load additional details. Basic information is shown below.');
            // Try to find by searching our list
            const found = specialistsList.find(s => s.place_id === placeId);
            if (found) {
                showSpecialistModalFromData(found);
            }
        }
    } catch (error) {
        console.error('Error fetching details:', error);
        // Fallback to existing data
        const found = specialistsList.find(s => s.place_id === placeId);
        if (found) {
            showSpecialistModalFromData(found);
        } else {
            alert('Could not load specialist details. Please try again.');
        }
    }
}

// Show specialist modal
function showSpecialistModal(place) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
            <h2>${place.name}</h2>
            <div class="specialist-details">
                <p><strong>Address:</strong> ${place.formatted_address}</p>
                ${place.formatted_phone_number ? `<p><strong>Phone:</strong> <a href="tel:${place.formatted_phone_number}">${place.formatted_phone_number}</a></p>` : ''}
                ${place.website ? `<p><strong>Website:</strong> <a href="${place.website}" target="_blank">${place.website}</a></p>` : ''}
                ${place.rating ? `<p><strong>Rating:</strong> ${place.rating.toFixed(1)} ${generateStars(place.rating)}</p>` : ''}
                ${place.opening_hours ? `
                    <div>
                        <strong>Hours:</strong>
                        <ul style="margin-top: 0.5rem; padding-left: 1.5rem;">
                            ${place.opening_hours.weekday_text.map(day => `<li>${day}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
                ${place.reviews && place.reviews.length > 0 ? `
                    <div style="margin-top: 1rem;">
                        <strong>Recent Reviews:</strong>
                        <div style="margin-top: 0.5rem;">
                            ${place.reviews.slice(0, 3).map(review => `
                                <div style="padding: 0.5rem; background: #f5f5f5; border-radius: 5px; margin-bottom: 0.5rem;">
                                    <div>${generateStars(review.rating)} <strong>${review.author_name}</strong></div>
                                    <p style="margin-top: 0.25rem; font-size: 0.9rem;">${review.text}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
            <div class="test-controls" style="margin-top: 1.5rem;">
                ${place.formatted_phone_number ? `<button class="btn btn-primary" onclick="window.location.href='tel:${place.formatted_phone_number}'">Call Now</button>` : ''}
                ${place.website ? `<button class="btn btn-secondary" onclick="window.open('${place.website}', '_blank')">Visit Website</button>` : ''}
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// Show specialist modal from our existing data (faster, works for all specialists)
function showSpecialistModalFromData(specialist) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 10000; display: flex; align-items: center; justify-content: center;';
    
    // Extract phone number if available
    let phone = specialist.phone || '';
    let phoneClean = '';
    
    if (!phone) {
        // Try to find phone in address
        const address = specialist.address || '';
        const phoneMatch = address.match(/(\+?\d{1,3}[\s-]?)?\(?\d{2,4}\)?[\s-]?\d{3,4}[\s-]?\d{3,4}/);
        if (phoneMatch) {
            phone = phoneMatch[0];
        }
    }
    
    if (phone) {
        phoneClean = phone.replace(/\s+/g, '').replace(/[^\d+]/g, '');
    }
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px; background: white; padding: 2rem; border-radius: 12px; position: relative; max-height: 90vh; overflow-y: auto;">
            <button class="modal-close" onclick="this.closest('.modal').remove()" style="position: absolute; top: 1rem; right: 1rem; background: none; border: none; font-size: 2rem; cursor: pointer; color: #666;">&times;</button>
            <h2 style="margin-top: 0; color: #667eea;">${specialist.name || 'Specialist Details'}</h2>
            <div class="specialist-details" style="margin-top: 1.5rem;">
                <p style="margin: 0.75rem 0;">
                    <strong>👤 Type:</strong> 
                    <span style="padding: 0.25rem 0.75rem; background: #f0f9ff; border-radius: 4px; color: #667eea; font-weight: 600;">
                        ${formatSpecialistType(specialist.type)}
                    </span>
                </p>
                ${specialist.address ? `
                    <p style="margin: 0.75rem 0;">
                        <strong>📍 Address:</strong> ${specialist.address}
                    </p>
                ` : ''}
                ${specialist.distance !== undefined ? `
                    <p style="margin: 0.75rem 0;">
                        ${specialist.distance != null && isFinite(specialist.distance) ? `<strong>Distance:</strong> ${specialist.distance.toFixed(1)} km away` : ''}
                    </p>
                ` : ''}
                ${phone ? `
                    <p style="margin: 0.75rem 0;">
                        <strong>📞 Phone:</strong> 
                        <a href="tel:${phoneClean}" style="color: #667eea; text-decoration: none; font-weight: 600;">${phone}</a>
                    </p>
                ` : ''}
                ${specialist.rating > 0 ? `
                    <div style="margin: 0.75rem 0; padding: 1rem; background: #f0f9ff; border-radius: 8px;">
                        <p style="margin: 0.5rem 0;">
                            <strong>⭐ Rating:</strong> ${specialist.rating.toFixed(1)} / 5.0
                            ${specialist.rating_count > 0 ? `(${specialist.rating_count} reviews)` : ''}
                        </p>
                        <div style="margin-top: 0.5rem;">${generateStars(specialist.rating)}</div>
                    </div>
                ` : ''}
                ${specialist.licensed ? `
                    <div style="margin: 0.75rem 0; padding: 1rem; background: #f0f9ff; border-radius: 8px; border-left: 3px solid #667eea;">
                        <p style="margin: 0.5rem 0; font-weight: 600;">
                            <strong>License Status:</strong> 
                            <span style="color: ${specialist.licensed === 'likely' || specialist.licensed === 'verified' ? '#10b981' : '#f59e0b'};">
                                ${specialist.licensed === 'likely' ? '✅ Likely Licensed' : specialist.licensed === 'verified' ? '✅ Verified' : '⚠️ Unknown - Verify Required'}
                            </span>
                        </p>
                        ${specialist.license_info ? `<p style="margin: 0.5rem 0; font-size: 0.9rem; color: #666;">${specialist.license_info}</p>` : ''}
                        ${specialist.license_verify_url ? `
                            <a href="${specialist.license_verify_url}" target="_blank" 
                               style="font-size: 0.9rem; color: #667eea; text-decoration: none; font-weight: 600; display: inline-block; margin-top: 0.5rem;">
                                🔍 Verify License on HPCSA →
                            </a>
                        ` : ''}
                    </div>
                ` : ''}
                ${specialist.open_now !== undefined ? `
                    <p style="margin: 0.75rem 0;">
                        <strong>Status:</strong> 
                        <span style="color: ${specialist.open_now ? '#10b981' : '#f44336'}; font-weight: 600;">
                            ${specialist.open_now ? '🟢 Open now' : '🔴 Closed'}
                        </span>
                    </p>
                ` : ''}
            </div>
            <div class="test-controls" style="margin-top: 1.5rem; display: flex; gap: 1rem; flex-wrap: wrap;">
                <button class="btn btn-primary" onclick="event.stopPropagation(); getDirections(${specialist.location.lat}, ${specialist.location.lng}); return false;" style="flex: 1; min-width: 150px; padding: 0.75rem 1.5rem; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                    🗺️ Get Directions
                </button>
                ${phone && phoneClean ? `
                    <button class="btn btn-primary" onclick="event.stopPropagation(); callPhoneNumber('${phoneClean.replace(/'/g, "\\'")}'); return false;" style="flex: 1; min-width: 150px; padding: 0.75rem 1.5rem; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                        📞 Call Now
                    </button>
                ` : ''}
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// Call phone number - formats and initiates call
function callPhoneNumber(phoneNumber) {
    if (!phoneNumber) {
        console.error('No phone number provided');
        alert('Phone number not available');
        return;
    }
    
    // Clean and format phone number
    let phoneClean = String(phoneNumber).trim();
    
    // Remove all spaces and non-digit characters except +
    phoneClean = phoneClean.replace(/\s+/g, '').replace(/[^\d+]/g, '');
    
    // Ensure proper format for South African numbers
    if (phoneClean && !phoneClean.startsWith('+')) {
        if (phoneClean.startsWith('0')) {
            // Convert 0XX to +27XX
            phoneClean = '+27' + phoneClean.substring(1);
        } else if (phoneClean.startsWith('27')) {
            // Add + prefix if missing
            phoneClean = '+' + phoneClean;
        } else if (phoneClean.length >= 9) {
            // Assume it's a South African number without prefix
            phoneClean = '+27' + phoneClean;
        }
    }
    
    // Validate phone number
    if (!phoneClean || phoneClean.length < 10) {
        console.error('Invalid phone number:', phoneNumber);
        alert('Invalid phone number format');
        return;
    }
    
    console.log('Calling:', phoneClean);
    
    // Initiate call using tel: protocol
    try {
        window.location.href = `tel:${phoneClean}`;
    } catch (error) {
        console.error('Error initiating call:', error);
        // Fallback: try without window.location
        const link = document.createElement('a');
        link.href = `tel:${phoneClean}`;
        link.click();
    }
}

// Call specialist
async function callSpecialist(placeId) {
    // Find specialist in our list first
    const specialist = specialistsList.find(s => s.place_id === placeId);
    
    if (specialist) {
        // Check if phone is directly available
        let phone = specialist.phone || specialist.formatted_phone_number || specialist.international_phone_number || '';
        
        if (!phone) {
            // Try to extract phone from address
            const address = specialist.address || '';
            const phoneMatch = address.match(/(\+?\d{1,3}[\s-]?)?\(?\d{2,4}\)?[\s-]?\d{3,4}[\s-]?\d{3,4}/);
            if (phoneMatch) {
                phone = phoneMatch[0];
            }
        }
        
        if (phone) {
            callPhoneNumber(phone);
            return;
        }
    }
    
    // If no phone found, show details modal which may have phone from API
    await viewSpecialistDetails(placeId);
}

// Get city coordinates (fallback for known cities)
// AI-Enhanced helper functions for specialists finder
async function enhanceAddressWithAI(address) {
    // AI-powered address normalization and enhancement
    if (!window.aiVisionEngine) return null;
    
    try {
        // Use AI to parse and normalize address
        // This could use NLP models to extract city, province, etc.
        const normalized = address
            .trim()
            .replace(/\s+/g, ' ')
            .replace(/,+/g, ',');
        
        // AI could enhance this further with location intelligence
        return normalized;
    } catch (error) {
        console.warn('[AI] Address enhancement error:', error);
        return null;
    }
}

// AI-powered ranking of specialists based on multiple factors
async function rankSpecialistsWithAI(specialists, userLocation) {
    if (!window.aiVisionEngine || !specialists || specialists.length === 0) {
        return specialists;
    }
    
    try {
        // AI-enhanced ranking considers:
        // 1. Distance (weighted)
        // 2. Rating and review count
        // 3. License status
        // 4. Opening hours
        // 5. Price level
        // 6. User preferences (if available)
        
        const ranked = specialists.map(specialist => {
            let score = 0;
            
            // Distance score (closer = better, max 50 points)
            const maxDistance = 50; // km
            const distanceScore = Math.max(0, 50 * (1 - (specialist.distance / maxDistance)));
            score += distanceScore;
            
            // Rating score (max 30 points)
            const ratingScore = (specialist.rating || 0) * 6; // 5 stars * 6 = 30 points
            score += ratingScore;
            
            // Review count score (max 10 points)
            const reviewScore = Math.min(10, Math.log10((specialist.rating_count || 0) + 1) * 2);
            score += reviewScore;
            
            // License bonus (max 5 points)
            if (specialist.licensed) {
                score += 5;
            }
            
            // Open now bonus (max 3 points)
            if (specialist.open_now) {
                score += 3;
            }
            
            // Price level bonus (lower price = better, max 2 points)
            if (specialist.price_level !== undefined) {
                score += Math.max(0, 2 - specialist.price_level);
            }
            
            return {
                ...specialist,
                aiScore: score,
                aiRanked: true
            };
        });
        
        // Sort by AI score (highest first)
        ranked.sort((a, b) => (b.aiScore || 0) - (a.aiScore || 0));
        
        console.log('[AI] Ranked specialists:', ranked.length, 'results');
        return ranked;
    } catch (error) {
        console.warn('[AI] Ranking error:', error);
        return specialists; // Fallback to original order
    }
}

function getCityCoordinates(address) {
    const cities = {
        'johannesburg': { lat: -26.2041, lng: 28.0473, address: 'Johannesburg, South Africa' },
        'cape town': { lat: -33.9249, lng: 18.4241, address: 'Cape Town, South Africa' },
        'durban': { lat: -29.8587, lng: 31.0218, address: 'Durban, South Africa' },
        'pretoria': { lat: -25.7479, lng: 28.2293, address: 'Pretoria, South Africa' },
        'port elizabeth': { lat: -33.9608, lng: 25.6022, address: 'Port Elizabeth, South Africa' },
        'bloemfontein': { lat: -29.0852, lng: 26.1596, address: 'Bloemfontein, South Africa' },
        'east london': { lat: -33.0292, lng: 27.8546, address: 'East London, South Africa' },
        'nelspruit': { lat: -25.4745, lng: 30.9703, address: 'Nelspruit, South Africa' },
        'polokwane': { lat: -23.9045, lng: 29.4689, address: 'Polokwane, South Africa' },
        'kimberley': { lat: -28.7282, lng: 24.7499, address: 'Kimberley, South Africa' }
    };
    
    const lowerAddress = address.toLowerCase();
    for (const [city, coords] of Object.entries(cities)) {
        if (lowerAddress.includes(city)) {
            return coords;
        }
    }
    
    return null;
}

// Test function to verify setup
window.testSpecialistFinder = function() {
    console.log('=== TESTING SPECIALIST FINDER ===');
    console.log('1. Checking DOM elements...');
    const statusEl = document.getElementById('location-status');
    const loadingEl = document.getElementById('specialists-loading');
    const containerEl = document.getElementById('specialists-container');
    
    console.log('location-status:', statusEl ? '✓ Found' : '✗ Missing');
    console.log('specialists-loading:', loadingEl ? '✓ Found' : '✗ Missing');
    console.log('specialists-container:', containerEl ? '✓ Found' : '✗ Missing');
    
    console.log('2. Checking Places proxy...');
    console.log('Places proxy:', (window.SupabaseStorage && window.SupabaseStorage.invoke) ? '✓ Supabase connected' : '✗ Supabase unavailable');
    
    console.log('3. Testing location services...');
    if (navigator.geolocation) {
        console.log('✓ Geolocation API available');
    } else {
        console.log('✗ Geolocation API not available');
    }
    
    console.log('4. Testing fetch API...');
    fetch('https://ipapi.co/json/')
        .then(r => r.json())
        .then(data => {
            console.log('✓ IP location service working:', data);
        })
        .catch(err => {
            console.log('✗ IP location service failed:', err);
        });
    
    console.log('=== TEST COMPLETE ===');
    console.log('If all checks pass, try clicking "Find Nearest Specialists" again');
};

// Make functions globally available
window.findNearestSpecialists = findNearestSpecialists;
window.filterSpecialists = filterSpecialists;
window.getDirections = getDirections;
window.viewSpecialistDetails = viewSpecialistDetails;
window.callSpecialist = callSpecialist;
window.callPhoneNumber = callPhoneNumber;
window.showManualLocationInput = showManualLocationInput;
window.searchByAddress = searchByAddress;
window.searchByCity = searchByCity;
window.resetLocationSearch = resetLocationSearch;
window.loadDirectorySpecialists = loadDirectorySpecialists;
window.testSpecialistFinder = window.testSpecialistFinder;
window.syncOptometristDatabase = syncOptometristDatabase;

// Initialize database sync on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeOptometristDatabaseSync);
} else {
    initializeOptometristDatabaseSync();
}

