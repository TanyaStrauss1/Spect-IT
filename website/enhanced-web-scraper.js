// Enhanced Web Scraper - Real-time product and retailer information
// Scrapes real data from multiple sources with advanced parsing

class EnhancedWebScraper {
    constructor() {
        this.corsProxies = [
            'https://api.allorigins.win/get?url=',
            'https://corsproxy.io/?',
            'https://api.codetabs.com/v1/proxy?quest=',
            'https://cors-anywhere.herokuapp.com/',
            'https://thingproxy.freeboard.io/fetch/'
        ];
        
        this.retailerConfigs = {
            'specsavers': {
                name: 'Spec-Savers',
                baseUrl: 'https://www.specsavers.co.za',
                productUrls: {
                    glasses: 'https://www.specsavers.co.za/glasses',
                    frames: 'https://www.specsavers.co.za/glasses/frames',
                    sunglasses: 'https://www.specsavers.co.za/glasses/sunglasses',
                    contactLenses: 'https://www.specsavers.co.za/contact-lenses'
                },
                selectors: {
                    productContainer: '.product-tile, .product-item, [data-product-id], .product-card',
                    name: '.product-name, .product-title, h2.product-title, [data-product-name]',
                    price: '.product-price, .price, [data-price], .product-price-value',
                    originalPrice: '.product-price-original, .was-price, .old-price',
                    image: '.product-image img, img.product-image, [data-product-image]',
                    description: '.product-description, .product-details, [data-product-description]',
                    brand: '.product-brand, [data-brand]',
                    inStock: '.in-stock, [data-stock-status]',
                    rating: '.product-rating, [data-rating]',
                    reviews: '.product-reviews-count, [data-reviews]',
                    link: 'a.product-link, a[href*="/glasses/"], a[href*="/product/"]'
                },
                pricePattern: /R?\s*([\d,]+\.?\d*)/,
                storeLocator: 'https://www.specsavers.co.za/stores'
            },
            'opsm': {
                name: 'OPSM',
                baseUrl: 'https://www.opsm.co.za',
                productUrls: {
                    glasses: 'https://www.opsm.co.za/glasses',
                    frames: 'https://www.opsm.co.za/glasses/frames',
                    sunglasses: 'https://www.opsm.co.za/sunglasses',
                    contactLenses: 'https://www.opsm.co.za/contact-lenses'
                },
                selectors: {
                    productContainer: '.product, .product-item, .product-card, [class*="product"]',
                    name: '.product-name, h3, h4, [data-name]',
                    price: '.price, .product-price, [data-price]',
                    originalPrice: '.original-price, .was-price',
                    image: 'img.product-image, img[src*="product"], .product-image img',
                    description: '.product-description, p.product-desc',
                    brand: '.brand, .product-brand',
                    inStock: '.available, .in-stock',
                    rating: '.rating, .stars',
                    reviews: '.reviews-count',
                    link: 'a[href*="/product/"], a[href*="/glasses/"]'
                },
                pricePattern: /R?\s*([\d,]+\.?\d*)/,
                storeLocator: 'https://www.opsm.co.za/stores'
            },
            'visionexpress': {
                name: 'Vision Express',
                baseUrl: 'https://www.visionexpress.co.za',
                productUrls: {
                    glasses: 'https://www.visionexpress.co.za/glasses',
                    frames: 'https://www.visionexpress.co.za/frames',
                    sunglasses: 'https://www.visionexpress.co.za/sunglasses',
                    contactLenses: 'https://www.visionexpress.co.za/contact-lenses'
                },
                selectors: {
                    productContainer: '.product-tile, .product, [data-product]',
                    name: '.product-title, h2, h3',
                    price: '.price, .product-price',
                    originalPrice: '.was-price, .original-price',
                    image: 'img[src*="product"], .product-image img',
                    description: '.product-info, .description',
                    brand: '.brand-name',
                    inStock: '.stock-status',
                    rating: '.rating-value',
                    reviews: '.review-count',
                    link: 'a.product-link'
                },
                pricePattern: /R?\s*([\d,]+\.?\d*)/,
                storeLocator: 'https://www.visionexpress.co.za/stores'
            },
            'takealot': {
                name: 'Takealot',
                baseUrl: 'https://www.takealot.com',
                productUrls: {
                    glasses: 'https://www.takealot.com/glasses',
                    frames: 'https://www.takealot.com/eyewear-frames',
                    sunglasses: 'https://www.takealot.com/sunglasses',
                    contactLenses: 'https://www.takealot.com/contact-lenses'
                },
                selectors: {
                    productContainer: '.product, [data-product], .product-item',
                    name: '.product-title, h3, [data-name]',
                    price: '.price, .product-price, [data-price]',
                    originalPrice: '.was-price, .list-price',
                    image: 'img.product-image, img[data-src]',
                    description: '.product-description',
                    brand: '.brand',
                    inStock: '.stock-status, [data-stock]',
                    rating: '.rating, [data-rating]',
                    reviews: '.reviews, [data-reviews]',
                    link: 'a.product-link, a[href*="/product/"]'
                },
                pricePattern: /R?\s*([\d,]+\.?\d*)/,
                storeLocator: null
            }
        };
    }

    // Main method to scrape products from all retailers
    async scrapeAllRetailers(category = 'glasses', location = null) {
        const allProducts = [];
        const retailerPromises = [];

        for (const [retailerKey, config] of Object.entries(this.retailerConfigs)) {
            retailerPromises.push(
                this.scrapeRetailer(retailerKey, category, location)
                    .then(products => {
                        console.log(`✅ Scraped ${products.length} products from ${config.name}`);
                        return products;
                    })
                    .catch(error => {
                        console.error(`❌ Error scraping ${config.name}:`, error);
                        return [];
                    })
            );
        }

        const results = await Promise.all(retailerPromises);
        results.forEach(products => allProducts.push(...products));

        // Sort by price and distance if location provided
        return this.sortProducts(allProducts, location);
    }

    // Scrape products from a specific retailer
    async scrapeRetailer(retailerKey, category = 'glasses', location = null) {
        const config = this.retailerConfigs[retailerKey];
        if (!config) return [];

        const productUrl = config.productUrls[category] || config.productUrls.glasses;
        const products = [];

        try {
            // Try multiple CORS proxies
            let html = null;
            for (const proxy of this.corsProxies) {
                try {
                    const proxyUrl = proxy + encodeURIComponent(productUrl);
                    const response = await fetch(proxyUrl, {
                        method: 'GET',
                        headers: {
                            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                        }
                    });

                    if (response.ok) {
                        const data = await response.json();
                        html = data.contents || data.content || (typeof data === 'string' ? data : null);
                        if (html && html.length > 1000) break; // Valid HTML
                    }
                } catch (e) {
                    continue;
                }
            }

            if (!html) {
                console.warn(`Could not fetch HTML from ${config.name}`);
                return products;
            }

            // Parse HTML
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            // Find product containers
            const productElements = this.findProductElements(doc, config.selectors);

            // Extract product information
            productElements.forEach((element, index) => {
                if (index >= 30) return; // Limit to 30 products per retailer

                const product = this.extractProductInfo(element, config, retailerKey, location);
                if (product && product.name && product.price > 0) {
                    products.push(product);
                }
            });

            // If no products found with primary selectors, try alternative methods
            if (products.length === 0) {
                products.push(...await this.scrapeWithAlternativeMethod(productUrl, config, retailerKey, location));
            }

        } catch (error) {
            console.error(`Error scraping ${config.name}:`, error);
        }

        return products;
    }

    // Find product elements using multiple selector strategies
    findProductElements(doc, selectors) {
        let elements = [];

        // Try primary selector
        if (selectors.productContainer) {
            elements = Array.from(doc.querySelectorAll(selectors.productContainer));
        }

        // If no results, try alternative selectors
        if (elements.length === 0) {
            const alternatives = [
                '[class*="product"]',
                '[data-product]',
                '[id*="product"]',
                '.item',
                '[class*="item"]'
            ];

            for (const alt of alternatives) {
                elements = Array.from(doc.querySelectorAll(alt));
                if (elements.length > 0) break;
            }
        }

        return elements;
    }

    // Extract detailed product information
    extractProductInfo(element, config, retailerKey, location) {
        const product = {
            id: `${retailerKey}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            retailer: config.name,
            retailerKey: retailerKey,
            retailerUrl: config.baseUrl,
            location: location,
            distance: location ? this.calculateDistance(location, { lat: 0, lng: 0 }) : null
        };

        // Extract name
        if (config.selectors.name) {
            const nameEl = element.querySelector(config.selectors.name);
            product.name = nameEl ? nameEl.textContent.trim() : '';
        }
        if (!product.name) {
            const altName = element.querySelector('h2, h3, h4, [title]');
            product.name = altName ? (altName.textContent || altName.getAttribute('title') || '').trim() : '';
        }

        // Extract price
        if (config.selectors.price) {
            const priceEl = element.querySelector(config.selectors.price);
            if (priceEl) {
                const priceText = priceEl.textContent.trim();
                product.price = this.parsePrice(priceText, config.pricePattern);
                
                // Extract original price if on sale
                if (config.selectors.originalPrice) {
                    const originalPriceEl = element.querySelector(config.selectors.originalPrice);
                    if (originalPriceEl) {
                        product.originalPrice = this.parsePrice(originalPriceEl.textContent.trim(), config.pricePattern);
                        product.onSale = true;
                        product.discount = product.originalPrice > 0 
                            ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                            : 0;
                    }
                }
            }
        }

        // Extract image
        if (config.selectors.image) {
            const imageEl = element.querySelector(config.selectors.image);
            if (imageEl) {
                product.image = imageEl.src || imageEl.getAttribute('data-src') || imageEl.getAttribute('data-lazy-src') || '';
                if (product.image && !product.image.startsWith('http')) {
                    product.image = config.baseUrl + product.image;
                }
            }
        }
        if (!product.image) {
            const altImage = element.querySelector('img');
            if (altImage) {
                product.image = altImage.src || altImage.getAttribute('data-src') || '';
            }
        }

        // Extract description
        if (config.selectors.description) {
            const descEl = element.querySelector(config.selectors.description);
            product.description = descEl ? descEl.textContent.trim().substring(0, 200) : '';
        }

        // Extract brand
        if (config.selectors.brand) {
            const brandEl = element.querySelector(config.selectors.brand);
            product.brand = brandEl ? brandEl.textContent.trim() : '';
        }

        // Extract stock status
        if (config.selectors.inStock) {
            const stockEl = element.querySelector(config.selectors.inStock);
            product.inStock = stockEl ? !stockEl.textContent.toLowerCase().includes('out of stock') : true;
        } else {
            product.inStock = true; // Assume in stock if not specified
        }

        // Extract rating
        if (config.selectors.rating) {
            const ratingEl = element.querySelector(config.selectors.rating);
            if (ratingEl) {
                const ratingText = ratingEl.textContent.trim();
                const ratingMatch = ratingText.match(/([\d.]+)/);
                product.rating = ratingMatch ? parseFloat(ratingMatch[1]) : null;
            }
        }

        // Extract reviews count
        if (config.selectors.reviews) {
            const reviewsEl = element.querySelector(config.selectors.reviews);
            if (reviewsEl) {
                const reviewsText = reviewsEl.textContent.trim();
                const reviewsMatch = reviewsText.match(/([\d,]+)/);
                product.reviewsCount = reviewsMatch ? parseInt(reviewsMatch[1].replace(/,/g, '')) : 0;
            }
        }

        // Extract product link
        if (config.selectors.link) {
            const linkEl = element.querySelector(config.selectors.link);
            if (linkEl) {
                product.url = linkEl.href || linkEl.getAttribute('href') || '';
                if (product.url && !product.url.startsWith('http')) {
                    product.url = config.baseUrl + product.url;
                }
            }
        }

        return product;
    }

    // Alternative scraping method using JSON-LD or data attributes
    async scrapeWithAlternativeMethod(url, config, retailerKey, location) {
        const products = [];
        // This can be extended to parse JSON-LD structured data
        // or use API endpoints if available
        return products;
    }

    // Parse price from text
    parsePrice(priceText, pattern = null) {
        if (!priceText) return 0;

        const defaultPattern = /R?\s*([\d,]+\.?\d*)/;
        const regex = pattern || defaultPattern;
        const match = priceText.match(regex);

        if (match) {
            return parseFloat(match[1].replace(/,/g, ''));
        }

        // Try to find any number
        const numberMatch = priceText.match(/([\d,]+\.?\d*)/);
        return numberMatch ? parseFloat(numberMatch[1].replace(/,/g, '')) : 0;
    }

    // Calculate distance between two coordinates
    calculateDistance(loc1, loc2) {
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

    // Sort products by price and distance
    sortProducts(products, location) {
        return products.sort((a, b) => {
            // First by distance if location provided
            if (location && a.distance && b.distance) {
                if (Math.abs(a.distance - b.distance) > 1) {
                    return a.distance - b.distance;
                }
            }
            // Then by price
            return a.price - b.price;
        });
    }

    // Scrape store locations from retailer websites
    async scrapeStoreLocations(retailerKey, location) {
        const config = this.retailerConfigs[retailerKey];
        if (!config || !config.storeLocator) return [];

        const stores = [];

        try {
            let html = null;
            for (const proxy of this.corsProxies) {
                try {
                    const proxyUrl = proxy + encodeURIComponent(config.storeLocator);
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

                // Find store elements
                const storeElements = doc.querySelectorAll('[class*="store"], [class*="location"], [data-store]');
                
                storeElements.forEach((storeEl, index) => {
                    if (index >= 10) return; // Limit to 10 stores

                    const nameEl = storeEl.querySelector('h2, h3, [class*="name"]');
                    const addressEl = storeEl.querySelector('[class*="address"], address, p');
                    const phoneEl = storeEl.querySelector('[class*="phone"], a[href^="tel:"]');
                    const hoursEl = storeEl.querySelector('[class*="hours"], [class*="time"]');

                    if (nameEl) {
                        stores.push({
                            id: `${retailerKey}-store-${index}`,
                            retailer: config.name,
                            name: nameEl.textContent.trim(),
                            address: addressEl ? addressEl.textContent.trim() : '',
                            phone: phoneEl ? phoneEl.textContent.trim().replace(/[^\d+\s()-]/g, '') : '',
                            hours: hoursEl ? hoursEl.textContent.trim() : '',
                            distance: location ? this.calculateDistance(location, { lat: 0, lng: 0 }) : null
                        });
                    }
                });
            }
        } catch (error) {
            console.error(`Error scraping store locations from ${config.name}:`, error);
        }

        return stores;
    }
}

// Initialize global scraper instance
window.enhancedWebScraper = new EnhancedWebScraper();

// Export functions for use in other scripts
window.scrapeAllRetailers = async function(category, location) {
    return await window.enhancedWebScraper.scrapeAllRetailers(category, location);
};

window.scrapeRetailerProducts = async function(retailerKey, category, location) {
    return await window.enhancedWebScraper.scrapeRetailer(retailerKey, category, location);
};

window.scrapeStoreLocations = async function(retailerKey, location) {
    return await window.enhancedWebScraper.scrapeStoreLocations(retailerKey, location);
};

