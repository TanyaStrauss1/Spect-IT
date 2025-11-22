// Retailer Finder - Location-Based Real Retailer Scraping
// Finds nearby eyewear retailers and scrapes real product information

let userLocation = null;
let nearbyRetailers = [];
let retailerProducts = new Map(); // Store products by retailer

// Initialize retailer finder
document.addEventListener('DOMContentLoaded', function() {
    initializeRetailerFinder();
});

function initializeRetailerFinder() {
    // Add retailer finder button to shop section if it exists
    const shopSection = document.getElementById('shop');
    if (shopSection) {
        const container = shopSection.querySelector('.container');
        if (container) {
            const finderButton = document.createElement('button');
            finderButton.className = 'btn btn-primary';
            finderButton.style.marginBottom = '2rem';
            finderButton.innerHTML = '📍 Find Nearby Retailers with Real Products';
            finderButton.onclick = findNearbyRetailers;
            container.insertBefore(finderButton, container.firstChild);
        }
    }
}

// Get user location
async function getUserLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            position => {
                resolve({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
            },
            error => {
                reject(error);
            },
            { timeout: 10000, enableHighAccuracy: true }
        );
    });
}

// Find nearby retailers using location
async function findNearbyRetailers() {
    const statusEl = document.getElementById('retailer-status') || createStatusElement();
    
    try {
        statusEl.innerHTML = '📍 Getting your location...';
        
        // Get user location
        if (!userLocation) {
            userLocation = await getUserLocation();
        }
        
        statusEl.innerHTML = `🔍 Finding retailers near you (${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)})...`;
        
        // Search for retailers
        const retailers = await searchNearbyRetailers(userLocation);
        
        // Scrape product information from each retailer using enhanced scraper
        statusEl.innerHTML = '🛍️ Scraping real-time product information from web...';
        
        // Use enhanced scraper to get products from all retailers at once
        if (window.enhancedWebScraper) {
            try {
                const allProducts = await window.enhancedWebScraper.scrapeAllRetailers('glasses', userLocation);
                
                // Group products by retailer
                const productsByRetailer = new Map();
                allProducts.forEach(product => {
                    const retailerId = retailers.find(r => 
                        r.name.toLowerCase().includes(product.retailer.toLowerCase()) ||
                        product.retailer.toLowerCase().includes(r.name.toLowerCase())
                    )?.id || 'unknown';
                    
                    if (!productsByRetailer.has(retailerId)) {
                        productsByRetailer.set(retailerId, []);
                    }
                    productsByRetailer.get(retailerId).push(product);
                });
                
                // Update retailer products map
                productsByRetailer.forEach((products, retailerId) => {
                    retailerProducts.set(retailerId, products);
                });
                
                // Also scrape individual retailers for any missing ones
                for (const retailer of retailers) {
                    if (!retailerProducts.has(retailer.id) || retailerProducts.get(retailer.id).length === 0) {
                        const products = await scrapeRetailerProducts(retailer);
                        retailerProducts.set(retailer.id, products);
                    }
                }
            } catch (error) {
                console.warn('Enhanced scraper failed, using individual retailer scraping:', error);
                // Fallback to individual scraping
                for (const retailer of retailers) {
                    const products = await scrapeRetailerProducts(retailer);
                    retailerProducts.set(retailer.id, products);
                }
            }
        } else {
            // Fallback if enhanced scraper not loaded
            for (const retailer of retailers) {
                const products = await scrapeRetailerProducts(retailer);
                retailerProducts.set(retailer.id, products);
            }
        }
        
        // Display results
        displayRetailersWithProducts(retailers);
        
        statusEl.innerHTML = `✅ Found ${retailers.length} retailers with products near you!`;
        
    } catch (error) {
        console.error('Error finding retailers:', error);
        statusEl.innerHTML = `
            <div style="padding: 1rem;">
                <p style="color: #ef4444; margin-bottom: 1rem;">❌ ${error.message}</p>
                <p style="margin-bottom: 1rem; font-weight: 500;">Enter your location manually:</p>
                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center; margin-bottom: 1rem;">
                    <input type="text" id="retailer-location-input" placeholder="Enter city or address (e.g., Johannesburg)" 
                           style="flex: 1; min-width: 250px; padding: 0.75rem; border: 2px solid #667eea; border-radius: 8px; font-size: 1rem;"
                           onkeypress="if(event.key === 'Enter') searchRetailersByLocation()">
                    <button class="btn btn-primary" onclick="searchRetailersByLocation()">Search</button>
                </div>
                <p style="font-size: 0.9rem; color: #666; margin-bottom: 0.5rem; font-weight: 500;">Quick select:</p>
                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                    <button class="btn btn-secondary" onclick="searchRetailersByCity('Johannesburg')" style="font-size: 0.9rem; padding: 0.5rem 1rem;">Johannesburg</button>
                    <button class="btn btn-secondary" onclick="searchRetailersByCity('Cape Town')" style="font-size: 0.9rem; padding: 0.5rem 1rem;">Cape Town</button>
                    <button class="btn btn-secondary" onclick="searchRetailersByCity('Durban')" style="font-size: 0.9rem; padding: 0.5rem 1rem;">Durban</button>
                    <button class="btn btn-secondary" onclick="searchRetailersByCity('Pretoria')" style="font-size: 0.9rem; padding: 0.5rem 1rem;">Pretoria</button>
                </div>
            </div>
        `;
    }
}

// Create status element if it doesn't exist
function createStatusElement() {
    const shopSection = document.getElementById('shop');
    if (!shopSection) return null;
    
    const statusEl = document.createElement('div');
    statusEl.id = 'retailer-status';
    statusEl.style.cssText = 'padding: 1rem; margin: 1rem 0; background: #f0f0f0; border-radius: 8px; text-align: center;';
    
    const container = shopSection.querySelector('.container');
    if (container) {
        container.insertBefore(statusEl, container.firstChild);
    }
    
    return statusEl;
}

// Search for nearby retailers using Google Places API
async function searchNearbyRetailers(location) {
    const CONFIG = {
        googlePlacesApiKey: 'AIzaSyCCEQr9H_OwLccYjDNoTTH_u9cFymPXa08'
    };
    
    const retailers = [];
    const searchQueries = [
        'Spec-Savers',
        'OPSM',
        'Vision Express',
        'optician',
        'eyewear store',
        'glasses store',
        'contact lens store'
    ];
    
    const seenPlaceIds = new Set();
    
    for (const query of searchQueries) {
        try {
            const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?` +
                `location=${location.lat},${location.lng}` +
                `&radius=10000` +
                `&keyword=${encodeURIComponent(query)}` +
                `&key=${CONFIG.googlePlacesApiKey}`;
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.status === 'OK' && data.results) {
                data.results.forEach(place => {
                    if (!seenPlaceIds.has(place.place_id)) {
                        retailers.push({
                            id: place.place_id,
                            name: place.name,
                            address: place.vicinity || (place.formatted_address || ''),
                            location: {
                                lat: place.geometry.location.lat,
                                lng: place.geometry.location.lng
                            },
                            rating: place.rating || 0,
                            totalRatings: place.user_ratings_total || 0,
                            distance: calculateDistance(location, {
                                lat: place.geometry.location.lat,
                                lng: place.geometry.location.lng
                            }),
                            website: place.website || '',
                            phone: place.formatted_phone_number || '',
                            types: place.types || []
                        });
                        seenPlaceIds.add(place.place_id);
                    }
                });
            }
        } catch (error) {
            console.error(`Error searching for ${query}:`, error);
        }
    }
    
    // Also scrape from known retailer websites
    const scrapedRetailers = await scrapeRetailerWebsites(location);
    scrapedRetailers.forEach(retailer => {
        if (!seenPlaceIds.has(retailer.id)) {
            retailers.push(retailer);
            seenPlaceIds.add(retailer.id);
        }
    });
    
    // Sort by distance
    return retailers.sort((a, b) => a.distance - b.distance).slice(0, 20);
}

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(loc1, loc2) {
    const R = 6371; // Earth's radius in km
    const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
    const dLon = (loc2.lng - loc1.lng) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// Scrape retailer websites for real product information
async function scrapeRetailerWebsites(location) {
    const retailers = [];
    const corsProxies = [
        'https://api.allorigins.win/get?url=',
        'https://corsproxy.io/?',
        'https://api.codetabs.com/v1/proxy?quest='
    ];
    
    const retailerSources = [
        {
            name: 'Spec-Savers',
            url: 'https://www.specsavers.co.za',
            storeUrl: 'https://www.specsavers.co.za/stores',
            productUrl: 'https://www.specsavers.co.za/glasses',
            type: 'optician'
        },
        {
            name: 'OPSM',
            url: 'https://www.opsm.co.za',
            storeUrl: 'https://www.opsm.co.za/stores',
            productUrl: 'https://www.opsm.co.za/glasses',
            type: 'optician'
        },
        {
            name: 'Vision Express',
            url: 'https://www.visionexpress.co.za',
            storeUrl: 'https://www.visionexpress.co.za/stores',
            productUrl: 'https://www.visionexpress.co.za/glasses',
            type: 'optician'
        }
    ];
    
    for (const source of retailerSources) {
        try {
            // Try to get store locations
            let html = null;
            for (const proxy of corsProxies) {
                try {
                    const proxyUrl = proxy + encodeURIComponent(source.storeUrl);
                    const response = await fetch(proxyUrl);
                    if (response.ok) {
                        const data = await response.json();
                        html = data.contents || data.content || (typeof data === 'string' ? data : null);
                        if (html) break;
                    }
                } catch (e) {
                    continue;
                }
            }
            
            if (html) {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                
                // Extract store information
                const storeElements = doc.querySelectorAll('[class*="store"], [class*="location"], [data-store]');
                storeElements.forEach((store, index) => {
                    if (index >= 5) return; // Limit to 5 stores per retailer
                    
                    const nameEl = store.querySelector('h1, h2, h3, [class*="name"]');
                    const addressEl = store.querySelector('[class*="address"], address');
                    const phoneEl = store.querySelector('[class*="phone"], a[href^="tel:"]');
                    
                    if (nameEl) {
                        const name = nameEl.textContent.trim();
                        const address = addressEl ? addressEl.textContent.trim() : '';
                        const phone = phoneEl ? phoneEl.textContent.trim() : '';
                        
                        retailers.push({
                            id: `${source.name.toLowerCase()}-${index}`,
                            name: `${source.name} - ${name}`,
                            address: address,
                            phone: phone,
                            website: source.url,
                            location: location, // Will be geocoded if needed
                            distance: 0, // Will be calculated
                            type: source.type,
                            retailerName: source.name
                        });
                    }
                });
            }
        } catch (error) {
            console.error(`Error scraping ${source.name}:`, error);
        }
    }
    
    return retailers;
}

// Scrape products from a specific retailer using enhanced scraper
async function scrapeRetailerProducts(retailer) {
    const products = [];
    
    // Use enhanced scraper if available
    if (window.enhancedWebScraper) {
        try {
            // Determine retailer key
            const retailerName = retailer.name.toLowerCase();
            let retailerKey = null;
            
            if (retailerName.includes('spec-savers') || retailerName.includes('specsavers')) {
                retailerKey = 'specsavers';
            } else if (retailerName.includes('opsm')) {
                retailerKey = 'opsm';
            } else if (retailerName.includes('vision express')) {
                retailerKey = 'visionexpress';
            } else if (retailerName.includes('takealot')) {
                retailerKey = 'takealot';
            }
            
            if (retailerKey) {
                // Use enhanced scraper
                const scrapedProducts = await window.enhancedWebScraper.scrapeRetailer(
                    retailerKey, 
                    'glasses', 
                    retailer.location || userLocation
                );
                
                // Map enhanced scraper results to retailer format
                scrapedProducts.forEach((product, index) => {
                    products.push({
                        id: product.id || `${retailer.id}-product-${index}`,
                        name: product.name,
                        price: product.price,
                        originalPrice: product.originalPrice,
                        onSale: product.onSale,
                        discount: product.discount,
                        image: product.image,
                        description: product.description,
                        brand: product.brand,
                        rating: product.rating,
                        reviewsCount: product.reviewsCount,
                        retailer: retailer.name,
                        retailerAddress: retailer.address,
                        retailerPhone: retailer.phone,
                        retailerWebsite: product.url || retailer.website,
                        distance: retailer.distance,
                        inStock: product.inStock !== false
                    });
                });
                
                return products;
            }
        } catch (error) {
            console.warn('Enhanced scraper failed, falling back to basic scraping:', error);
        }
    }
    
    // Fallback to basic scraping if enhanced scraper not available
    const corsProxies = [
        'https://api.allorigins.win/get?url=',
        'https://corsproxy.io/?',
        'https://api.codetabs.com/v1/proxy?quest='
    ];
    
    // Determine retailer website
    let productUrl = retailer.website || '';
    if (!productUrl) {
        const retailerName = retailer.name.toLowerCase();
        if (retailerName.includes('spec-savers') || retailerName.includes('specsavers')) {
            productUrl = 'https://www.specsavers.co.za/glasses';
        } else if (retailerName.includes('opsm')) {
            productUrl = 'https://www.opsm.co.za/glasses';
        } else if (retailerName.includes('vision express')) {
            productUrl = 'https://www.visionexpress.co.za/glasses';
        }
    }
    
    if (!productUrl) return products;
    
    try {
        let html = null;
        for (const proxy of corsProxies) {
            try {
                const proxyUrl = proxy + encodeURIComponent(productUrl);
                const response = await fetch(proxyUrl);
                if (response.ok) {
                    const data = await response.json();
                    html = data.contents || data.content || (typeof data === 'string' ? data : null);
                    if (html) break;
                }
            } catch (e) {
                continue;
            }
        }
        
        if (html) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Common product selectors
            const productSelectors = [
                '.product',
                '.product-item',
                '[class*="product"]',
                '[data-product]',
                '.glasses-item',
                '.frame-item'
            ];
            
            let productElements = [];
            for (const selector of productSelectors) {
                productElements = doc.querySelectorAll(selector);
                if (productElements.length > 0) break;
            }
            
            productElements.forEach((element, index) => {
                if (index >= 20) return; // Limit to 20 products per retailer
                
                const nameEl = element.querySelector('h2, h3, h4, [class*="name"], [class*="title"]');
                const priceEl = element.querySelector('[class*="price"], [data-price]');
                const imageEl = element.querySelector('img');
                
                if (nameEl && priceEl) {
                    const name = nameEl.textContent.trim();
                    const priceText = priceEl.textContent.trim();
                    const price = parsePrice(priceText);
                    
                    if (name && price > 0) {
                        products.push({
                            id: `${retailer.id}-product-${index}`,
                            name: name,
                            price: price,
                            image: imageEl ? (imageEl.src || imageEl.getAttribute('data-src')) : '',
                            retailer: retailer.name,
                            retailerAddress: retailer.address,
                            retailerPhone: retailer.phone,
                            retailerWebsite: retailer.website,
                            distance: retailer.distance,
                            inStock: true
                        });
                    }
                }
            });
        }
    } catch (error) {
        console.error(`Error scraping products from ${retailer.name}:`, error);
    }
    
    return products;
}

// Parse price from text
function parsePrice(priceText) {
    const match = priceText.match(/[\d,]+\.?\d*/);
    if (match) {
        return parseFloat(match[0].replace(/,/g, ''));
    }
    return 0;
}

// Display retailers with their products
function displayRetailersWithProducts(retailers) {
    const container = document.getElementById('products-container');
    if (!container) return;
    
    container.innerHTML = '<h3 style="margin-bottom: 2rem;">📍 Nearby Retailers with Real Products</h3>';
    
    retailers.forEach(retailer => {
        const products = retailerProducts.get(retailer.id) || [];
        
        const retailerCard = document.createElement('div');
        retailerCard.className = 'retailer-card';
        retailerCard.style.cssText = `
            border: 2px solid #667eea;
            border-radius: 12px;
            padding: 1.5rem;
            margin-bottom: 2rem;
            background: #fff;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        `;
        
        retailerCard.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                <div>
                    <h3 style="margin: 0 0 0.5rem 0; color: #667eea;">${retailer.name}</h3>
                    <p style="margin: 0.25rem 0; color: #666;">
                        📍 ${retailer.address || 'Address not available'}<br>
                        ${retailer.phone ? `📞 ${retailer.phone}<br>` : ''}
                        ${retailer.distance ? `📏 ${retailer.distance.toFixed(1)} km away` : ''}
                        ${retailer.rating ? `⭐ ${retailer.rating.toFixed(1)} (${retailer.totalRatings} reviews)` : ''}
                    </p>
                </div>
                ${retailer.website ? `<a href="${retailer.website}" target="_blank" class="btn btn-secondary" style="margin-left: 1rem;">Visit Website</a>` : ''}
            </div>
            ${products.length > 0 ? `
                <div style="margin-top: 1rem;">
                    <h4 style="margin-bottom: 1rem;">🛍️ Available Products (${products.length})</h4>
                    <div class="retailer-products-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem;">
                        ${products.map(product => `
                            <div class="product-card" style="border: 1px solid #ddd; border-radius: 8px; padding: 1rem; text-align: center; position: relative;">
                                ${product.onSale ? `<span style="position: absolute; top: 0.5rem; right: 0.5rem; background: #ef4444; color: white; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: bold;">-${product.discount || 0}%</span>` : ''}
                                ${product.image ? `<img src="${product.image}" alt="${product.name}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 4px; margin-bottom: 0.5rem;" onerror="this.style.display='none';">` : ''}
                                ${product.brand ? `<p style="font-size: 0.75rem; color: #666; margin: 0.25rem 0;">${product.brand}</p>` : ''}
                                <h5 style="margin: 0.5rem 0; font-size: 0.9rem;">${product.name}</h5>
                                ${product.description ? `<p style="font-size: 0.8rem; color: #666; margin: 0.5rem 0; height: 40px; overflow: hidden;">${product.description.substring(0, 60)}...</p>` : ''}
                                <div style="margin: 0.5rem 0;">
                                    ${product.originalPrice ? `<p style="text-decoration: line-through; color: #999; font-size: 0.85rem; margin: 0;">R${product.originalPrice.toFixed(2)}</p>` : ''}
                                    <p style="margin: 0.25rem 0; font-weight: bold; color: #667eea; font-size: 1.1rem;">R${product.price.toFixed(2)}</p>
                                </div>
                                ${product.rating ? `<p style="font-size: 0.75rem; color: #666; margin: 0.25rem 0;">⭐ ${product.rating.toFixed(1)}${product.reviewsCount ? ` (${product.reviewsCount})` : ''}</p>` : ''}
                                ${product.url ? `<a href="${product.url}" target="_blank" style="font-size: 0.75rem; color: #667eea; text-decoration: none; display: block; margin-bottom: 0.5rem;">View on ${retailer.name}</a>` : ''}
                                <button class="btn btn-primary" onclick="addProductToCart('${product.id}', '${product.name.replace(/'/g, "\\'")}', ${product.price}, '${retailer.name.replace(/'/g, "\\'")}')" style="width: 100%; font-size: 0.85rem;">
                                    Add to Cart
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : `
                <p style="color: #999; font-style: italic; margin-top: 1rem;">
                    Products loading... (scraping from ${retailer.website || 'retailer website'})
                </p>
            `}
        `;
        
        container.appendChild(retailerCard);
    });
}

// Add product to cart
window.addProductToCart = function(productId, productName, price, retailerName) {
    if (window.addToCart) {
        window.addToCart({
            id: productId,
            name: productName,
            price: price,
            retailer: retailerName,
            image: ''
        });
    } else {
        alert(`Added ${productName} (R${price.toFixed(2)}) from ${retailerName} to cart!`);
    }
};

// Show manual location input
function showManualLocationInput() {
    const location = prompt('Enter your location (city, address, or coordinates):');
    if (location) {
        // Try to geocode the location
        geocodeLocation(location).then(loc => {
            if (loc) {
                userLocation = loc;
                findNearbyRetailers();
            } else {
                alert('Could not find that location. Please try again.');
            }
        });
    }
}

// Geocode location string to coordinates
async function geocodeLocation(address) {
    const CONFIG = {
        googlePlacesApiKey: 'AIzaSyCCEQr9H_OwLccYjDNoTTH_u9cFymPXa08'
    };
    
    try {
        const url = `https://maps.googleapis.com/maps/api/geocode/json?` +
            `address=${encodeURIComponent(address)}` +
            `&key=${CONFIG.googlePlacesApiKey}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.status === 'OK' && data.results.length > 0) {
            const location = data.results[0].geometry.location;
            return {
                lat: location.lat,
                lng: location.lng
            };
        }
    } catch (error) {
        console.error('Geocoding error:', error);
    }
    
    return null;
}

// Search retailers by manual location input
async function searchRetailersByLocation() {
    const input = document.getElementById('retailer-location-input');
    if (!input || !input.value.trim()) {
        alert('Please enter a location');
        return;
    }
    
    const address = input.value.trim() + (input.value.toLowerCase().includes('south africa') ? '' : ', South Africa');
    const location = await geocodeLocation(address);
    
    if (location) {
        userLocation = location;
        findNearbyRetailers();
    } else {
        alert('Could not find that location. Please try a different address.');
    }
}

// Search retailers by city
function searchRetailersByCity(cityName) {
    const input = document.getElementById('retailer-location-input');
    if (input) {
        input.value = cityName;
        searchRetailersByLocation();
    } else {
        // If input doesn't exist, trigger error to show manual input
        findNearbyRetailers().catch(() => {
            setTimeout(() => {
                const input2 = document.getElementById('retailer-location-input');
                if (input2) {
                    input2.value = cityName;
                    searchRetailersByLocation();
                }
            }, 100);
        });
    }
}

// Export functions
window.findNearbyRetailers = findNearbyRetailers;
window.getUserLocation = getUserLocation;
window.searchRetailersByLocation = searchRetailersByLocation;
window.searchRetailersByCity = searchRetailersByCity;

