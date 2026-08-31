// Spect-IT Shop - Web Scraping & E-commerce
// Fetches products from retailers and enables purchases

let products = [];
let filteredProducts = [];
let shoppingCart = JSON.parse(localStorage.getItem('shoppingCart') || '[]');
let currentCategory = 'all';

// Initialize shop
document.addEventListener('DOMContentLoaded', function() {
    // Check if shop section exists
    const shopSection = document.getElementById('shop');
    if (!shopSection) {
        console.warn('Shop section not found. Shop functionality will not be available.');
        return;
    }
    
    // Initialize shop
    try {
        loadProducts();
        updateCartDisplay();
    } catch (error) {
        console.error('Error initializing shop:', error);
    }
});

// Load products from web scraping or fallback data
async function loadProducts() {
    const loadingEl = document.getElementById('products-loading');
    const containerEl = document.getElementById('products-container');
    
    // Safety checks
    if (!loadingEl || !containerEl) {
        console.error('Shop elements not found. Shop section may not be loaded.');
        return;
    }
    
    loadingEl.style.display = 'block';
    containerEl.innerHTML = '';
    
    try {
        // Curated catalog only — do not scrape retailer sites.
        products = getFallbackProducts();
        filteredProducts = products;
        displayProducts(products);
        window.retailerContacts = RETAILER_CONTACTS;
    } catch (error) {
        console.error('Error loading products:', error);
        products = getFallbackProducts();
        filteredProducts = products;
        displayProducts(products);
    }
    
    loadingEl.style.display = 'none';
}

// Enhanced function to extract contact details from text (reuse from specialists.js if available)
function extractRetailerContactDetails(text) {
    if (!text) return { phone: '', email: '', website: '' };
    
    // Extract phone numbers (South African format)
    const phonePatterns = [
        /(\+27\s?[0-9]{2}\s?[0-9]{3}\s?[0-9]{4})/g,
        /(0[0-9]{2}\s?[0-9]{3}\s?[0-9]{4})/g,
        /(27[0-9]{2}\s?[0-9]{3}\s?[0-9]{4})/g,
        /(\([0-9]{2,4}\)\s?[0-9]{3,4}\s?[0-9]{3,4})/g
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

// Enhanced retailer database with contact details
const RETAILER_CONTACTS = {
    'Spec-Savers': {
        phone: '+27117840202',
        email: 'info@specsavers.co.za',
        website: 'https://www.specsavers.co.za',
        address: 'Multiple locations across South Africa'
    },
    'OPSM': {
        phone: '+27214180330',
        email: 'info@opsm.co.za',
        website: 'https://www.opsm.co.za',
        address: 'Multiple locations across South Africa'
    },
    'Vision Express': {
        phone: '+27315661234',
        email: 'info@visionexpress.co.za',
        website: 'https://www.visionexpress.co.za',
        address: 'Multiple locations across South Africa'
    },
    'Takealot': {
        phone: '+27108001111',
        email: 'support@takealot.com',
        website: 'https://www.takealot.com',
        address: 'Online retailer'
    },
    'Clicks': {
        phone: '+27108001111',
        email: 'customercare@clicks.co.za',
        website: 'https://www.clicks.co.za',
        address: 'Multiple locations across South Africa'
    },
    'Dis-Chem': {
        phone: '+27108001111',
        email: 'info@dischem.co.za',
        website: 'https://www.dischem.co.za',
        address: 'Multiple locations across South Africa'
    }
};

// Scrape products from South African retailers with enhanced contact extraction
async function scrapeRetailerProducts() {
    // Multiple CORS proxies for reliability
    const corsProxies = [
        'https://api.allorigins.win/get?url=',
        'https://corsproxy.io/?',
        'https://api.codetabs.com/v1/proxy?quest='
    ];
    
    const retailers = [
        {
            name: 'Spec-Savers',
            url: 'https://www.specsavers.co.za',
            contactUrl: 'https://www.specsavers.co.za/contact',
            selectors: {
                products: '.product-item, .product, [class*="product"]',
                name: '.product-name, .product-title, h2, h3',
                price: '.product-price, .price, [class*="price"]',
                image: '.product-image img, img[src*="product"]',
                phone: '[class*="phone"], [class*="tel"], a[href^="tel:"]',
                email: '[class*="email"], a[href^="mailto:"]',
                website: 'a[href*="specsavers"]'
            }
        },
        {
            name: 'OPSM',
            url: 'https://www.opsm.co.za',
            contactUrl: 'https://www.opsm.co.za/contact',
            selectors: {
                products: '.product, .product-item, [class*="product"]',
                name: '.product-title, .product-name, h2, h3',
                price: '.price, .product-price, [class*="price"]',
                image: '.product-image img, img[src*="product"]',
                phone: '[class*="phone"], [class*="tel"], a[href^="tel:"]',
                email: '[class*="email"], a[href^="mailto:"]',
                website: 'a[href*="opsm"]'
            }
        },
        {
            name: 'Takealot',
            url: 'https://www.takealot.com',
            contactUrl: 'https://www.takealot.com/help/contact-us',
            selectors: {
                products: '.product-card, .product, [class*="product"]',
                name: '.product-title, .product-name, h2, h3',
                price: '.price, .product-price, [class*="price"]',
                image: '.product-image img, img[src*="product"]',
                phone: '[class*="phone"], [class*="tel"], a[href^="tel:"]',
                email: '[class*="email"], a[href^="mailto:"]',
                website: 'a[href*="takealot"]'
            }
        },
        {
            name: 'Clicks',
            url: 'https://www.clicks.co.za',
            contactUrl: 'https://www.clicks.co.za/contact',
            selectors: {
                products: '.product, .product-item, [class*="product"]',
                name: '.product-name, .product-title, h2, h3',
                price: '.price, .product-price, [class*="price"]',
                image: '.product-image img, img[src*="product"]',
                phone: '[class*="phone"], [class*="tel"], a[href^="tel:"]',
                email: '[class*="email"], a[href^="mailto:"]',
                website: 'a[href*="clicks"]'
            }
        },
        {
            name: 'Dis-Chem',
            url: 'https://www.dischem.co.za',
            contactUrl: 'https://www.dischem.co.za/contact',
            selectors: {
                products: '.product, .product-item, [class*="product"]',
                name: '.product-name, .product-title, h2, h3',
                price: '.price, .product-price, [class*="price"]',
                image: '.product-image img, img[src*="product"]',
                phone: '[class*="phone"], [class*="tel"], a[href^="tel:"]',
                email: '[class*="email"], a[href^="mailto:"]',
                website: 'a[href*="dischem"]'
            }
        },
        {
            name: 'Vision Express',
            url: 'https://www.visionexpress.co.za',
            contactUrl: 'https://www.visionexpress.co.za/contact',
            selectors: {
                products: '.product, .product-item, [class*="product"]',
                name: '.product-title, .product-name, h2, h3',
                price: '.price, .product-price, [class*="price"]',
                image: '.product-image img, img[src*="product"]',
                phone: '[class*="phone"], [class*="tel"], a[href^="tel:"]',
                email: '[class*="email"], a[href^="mailto:"]',
                website: 'a[href*="visionexpress"]'
            }
        },
        {
            name: 'Zando',
            url: 'https://www.zando.co.za',
            contactUrl: 'https://www.zando.co.za/contact',
            selectors: {
                products: '.product, .product-item, [class*="product"]',
                name: '.product-name, .product-title, h2, h3',
                price: '.price, .product-price, [class*="price"]',
                image: '.product-image img, img[src*="product"]',
                phone: '[class*="phone"], [class*="tel"], a[href^="tel:"]',
                email: '[class*="email"], a[href^="mailto:"]',
                website: 'a[href*="zando"]'
            }
        },
        {
            name: 'Superbalist',
            url: 'https://www.superbalist.com',
            contactUrl: 'https://www.superbalist.com/contact',
            selectors: {
                products: '.product, .product-item, [class*="product"]',
                name: '.product-name, .product-title, h2, h3',
                price: '.price, .product-price, [class*="price"]',
                image: '.product-image img, img[src*="product"]',
                phone: '[class*="phone"], [class*="tel"], a[href^="tel:"]',
                email: '[class*="email"], a[href^="mailto:"]',
                website: 'a[href*="superbalist"]'
            }
        },
        {
            name: 'Eyewear Direct',
            url: 'https://www.eyeweardirect.co.za',
            contactUrl: 'https://www.eyeweardirect.co.za/contact',
            selectors: {
                products: '.product, .product-item, [class*="product"]',
                name: '.product-name, .product-title, h2, h3',
                price: '.price, .product-price, [class*="price"]',
                image: '.product-image img, img[src*="product"]',
                phone: '[class*="phone"], [class*="tel"], a[href^="tel:"]',
                email: '[class*="email"], a[href^="mailto:"]',
                website: 'a[href*="eyeweardirect"]'
            }
        },
        {
            name: 'SmartBuyGlasses',
            url: 'https://www.smartbuyglasses.co.za',
            contactUrl: 'https://www.smartbuyglasses.co.za/contact',
            selectors: {
                products: '.product, .product-item, [class*="product"]',
                name: '.product-name, .product-title, h2, h3',
                price: '.price, .product-price, [class*="price"]',
                image: '.product-image img, img[src*="product"]',
                phone: '[class*="phone"], [class*="tel"], a[href^="tel:"]',
                email: '[class*="email"], a[href^="mailto:"]',
                website: 'a[href*="smartbuyglasses"]'
            }
        }
    ];
    
    const allProducts = [];
    const retailerContacts = {}; // Store extracted contact details
    
    for (const retailer of retailers) {
        try {
            console.log(`🔍 Scraping products and contact details from ${retailer.name}...`);
            
            // Try to fetch contact page for retailer contact details
            let retailerContact = RETAILER_CONTACTS[retailer.name] || { phone: '', email: '', website: retailer.url, address: '' };
            
            if (retailer.contactUrl) {
                try {
                    // Try multiple CORS proxies
                    for (const proxy of corsProxies) {
                        try {
                            const contactProxyUrl = proxy + encodeURIComponent(retailer.contactUrl);
                            const contactResponse = await fetch(contactProxyUrl, { 
                                method: 'GET',
                                headers: { 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' }
                            });
                            
                            if (contactResponse.ok) {
                                const contactData = await contactResponse.json();
                                const contactHtml = contactData.contents || contactData.content || (typeof contactData === 'string' ? contactData : null);
                                
                                if (contactHtml) {
                                    const parser = new DOMParser();
                                    const contactDoc = parser.parseFromString(contactHtml, 'text/html');
                                    
                                    // Extract contact details
                                    const phoneEl = contactDoc.querySelector(retailer.selectors.phone);
                                    const emailEl = contactDoc.querySelector(retailer.selectors.email);
                                    const websiteEl = contactDoc.querySelector(retailer.selectors.website);
                                    
                                    if (phoneEl) {
                                        retailerContact.phone = phoneEl.textContent || phoneEl.getAttribute('href')?.replace('tel:', '') || retailerContact.phone;
                                    }
                                    if (emailEl) {
                                        retailerContact.email = emailEl.textContent || emailEl.getAttribute('href')?.replace('mailto:', '') || retailerContact.email;
                                    }
                                    if (websiteEl) {
                                        retailerContact.website = websiteEl.getAttribute('href') || websiteEl.textContent || retailerContact.website;
                                    }
                                    
                                    // Also extract from page text
                                    const pageText = contactDoc.body?.textContent || '';
                                    const extracted = extractRetailerContactDetails(pageText);
                                    if (extracted.phone && !retailerContact.phone) retailerContact.phone = extracted.phone;
                                    if (extracted.email && !retailerContact.email) retailerContact.email = extracted.email;
                                    if (extracted.website && !retailerContact.website) retailerContact.website = extracted.website;
                                    
                                    break; // Success, exit proxy loop
                                }
                            }
                        } catch (proxyError) {
                            continue; // Try next proxy
                        }
                    }
                } catch (error) {
                    console.warn(`Could not fetch contact page for ${retailer.name}:`, error);
                }
            }
            
            // Store retailer contact info
            retailerContacts[retailer.name] = retailerContact;
            console.log(`✅ Extracted contact for ${retailer.name}: Phone: ${retailerContact.phone || 'none'}, Email: ${retailerContact.email || 'none'}`);
            
            // Now scrape products from multiple pages
            const productPages = [
                retailer.url,
                retailer.url + '/products',
                retailer.url + '/shop',
                retailer.url + '/catalog',
                retailer.url + '/eyewear',
                retailer.url + '/contact-lenses',
                retailer.url + '/frames',
                retailer.url + '/sunglasses'
            ];
            
            let totalProducts = 0;
            for (const pageUrl of productPages.slice(0, 3)) { // Limit to 3 pages per retailer
                try {
                    let html = null;
                    for (const proxy of corsProxies) {
                        try {
                            const proxyUrl = proxy + encodeURIComponent(pageUrl);
                            const response = await fetch(proxyUrl, { 
                                method: 'GET',
                                headers: { 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' },
                                timeout: 10000
                            });
                            
                            if (response.ok) {
                                const data = await response.json();
                                html = data.contents || data.content || (typeof data === 'string' ? data : null);
                                if (html) break;
                            }
                        } catch (proxyError) {
                            continue; // Try next proxy
                        }
                    }
                    
                    if (html) {
                        const products = parseRetailerProducts(html, retailer, retailerContact);
                        allProducts.push(...products);
                        totalProducts += products.length;
                    }
                } catch (pageError) {
                    console.warn(`Error scraping ${pageUrl}:`, pageError);
                }
            }
            
            if (totalProducts > 0) {
                console.log(`✅ Scraped ${totalProducts} products from ${retailer.name}`);
            } else {
                console.warn(`Could not fetch products from ${retailer.name}, using fallback`);
                // Add fallback products with contact info
                const fallback = getRetailerFallbackProducts(retailer.name, retailerContact);
                allProducts.push(...fallback);
            }
            
        } catch (error) {
            console.warn(`Error scraping ${retailer.name}:`, error);
            // Add fallback products with contact info
            const fallback = getRetailerFallbackProducts(retailer.name, retailerContacts[retailer.name] || RETAILER_CONTACTS[retailer.name] || {});
            allProducts.push(...fallback);
        }
    }
    
    // Store retailer contacts globally for display
    window.retailerContacts = retailerContacts;
    
    console.log(`✅ Total products scraped: ${allProducts.length}`);
    console.log(`✅ Retailer contacts extracted: ${Object.keys(retailerContacts).length}`);
    
    return allProducts;
}

// Parse retailer HTML with enhanced contact info
function parseRetailerProducts(html, retailer, retailerContact = {}) {
    const products = [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Enhanced selector matching - try multiple patterns
    const productSelectors = [
        retailer.selectors.products,
        '.product-item',
        '.product',
        '[class*="product"]',
        '.product-card',
        'article',
        '.item'
    ];
    
    let productElements = [];
    for (const selector of productSelectors) {
        productElements = doc.querySelectorAll(selector);
        if (productElements.length > 0) break;
    }
    
    productElements.forEach((element, index) => {
        if (index >= 30) return; // Limit to 30 products per retailer
        
        // Try multiple name selectors
        const nameSelectors = retailer.selectors.name.split(', ');
        let nameEl = null;
        for (const sel of nameSelectors) {
            nameEl = element.querySelector(sel);
            if (nameEl) break;
        }
        
        // Try multiple price selectors
        const priceSelectors = retailer.selectors.price.split(', ');
        let priceEl = null;
        for (const sel of priceSelectors) {
            priceEl = element.querySelector(sel);
            if (priceEl) break;
        }
        
        // Try multiple image selectors
        const imageSelectors = retailer.selectors.image.split(', ');
        let imageEl = null;
        for (const sel of imageSelectors) {
            imageEl = element.querySelector(sel);
            if (imageEl) break;
        }
        
        if (nameEl && priceEl) {
            const name = nameEl.textContent.trim();
            if (!name || name.length < 3) return; // Skip invalid names
            
            const priceText = priceEl.textContent.trim();
            const price = parsePrice(priceText);
            if (price <= 0) return; // Skip invalid prices
            
            const image = imageEl ? (imageEl.src || imageEl.getAttribute('data-src')) : getDefaultImage(name);
            
            // Determine category
            const category = determineCategory(name);
            
            // Include retailer contact info with product
            products.push({
                id: `${retailer.name.toLowerCase().replace(/\s+/g, '-')}-${index}`,
                name: name,
                retailer: retailer.name,
                retailerPhone: retailerContact.phone || '',
                retailerEmail: retailerContact.email || '',
                retailerWebsite: retailerContact.website || retailer.url,
                retailerAddress: retailerContact.address || '',
                price: price,
                image: image,
                category: category,
                url: retailer.url,
                inStock: true
            });
        }
    });
    
    return products;
}

// Parse price from text
function parsePrice(priceText) {
    // Remove currency symbols and extract number
    const match = priceText.match(/[\d,]+\.?\d*/);
    if (match) {
        return parseFloat(match[0].replace(/,/g, ''));
    }
    return 0;
}

// Determine product category
function determineCategory(name) {
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('contact lens') || lowerName.includes('lens')) {
        return 'contact-lenses';
    }
    if (lowerName.includes('frame') || lowerName.includes('eyeglass')) {
        return 'frames';
    }
    if (lowerName.includes('sunglass') || lowerName.includes('sun glass')) {
        return 'sunglasses';
    }
    if (lowerName.includes('reading') || lowerName.includes('reader')) {
        return 'reading-glasses';
    }
    
    return 'frames'; // Default
}

// Get default product image
function getDefaultImage(name) {
    const category = determineCategory(name);
    if (window.SpectitProductImages) {
        return window.SpectitProductImages.category(category);
    }
    const images = {
        'contact-lenses': 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect fill="#faf9f7" width="300" height="300"/></svg>'),
        'frames': 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect fill="#faf9f7" width="300" height="300"/></svg>'),
        'sunglasses': 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect fill="#faf9f7" width="300" height="300"/></svg>'),
        'reading-glasses': 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect fill="#faf9f7" width="300" height="300"/></svg>')
    };
    return images[category] || images.frames;
}

// Fallback products (curated South African retailer products)
function getFallbackProducts() {
    var img = function (name, cat) {
        return window.SpectitProductImages ? window.SpectitProductImages.product(name, cat) : getDefaultImage(name);
    };
    return [
        // Contact Lenses
        {
            id: 'cl-1',
            name: 'Acuvue Oasys 1-Day (30 pack)',
            retailer: 'Spec-Savers',
            price: 450.00,
            image: img('Acuvue Oasys', 'contact-lenses'),
            category: 'contact-lenses',
            description: 'Premium daily disposable contact lenses with UV protection',
            inStock: true
        },
        {
            id: 'cl-2',
            name: 'Air Optix Aqua Monthly (6 pack)',
            retailer: 'OPSM',
            price: 380.00,
            image: img('Air Optix', 'contact-lenses'),
            category: 'contact-lenses',
            description: 'Comfortable monthly lenses with high oxygen permeability',
            inStock: true
        },
        {
            id: 'cl-3',
            name: 'Biofinity Toric (6 pack)',
            retailer: 'Vision Express',
            price: 520.00,
            image: img('Biofinity', 'contact-lenses'),
            category: 'contact-lenses',
            description: 'Monthly toric lenses for astigmatism correction',
            inStock: true
        },
        // Frames
        {
            id: 'frame-1',
            name: 'Ray-Ban RB2140 Original Wayfarer',
            retailer: 'OPSM',
            price: 1890.00,
            image: img('Ray-Ban Wayfarer', 'frames'),
            category: 'frames',
            description: 'Classic wayfarer frame in black',
            sizes: ['Small', 'Medium', 'Large'],
            colors: ['Black', 'Tortoise', 'Red'],
            inStock: true
        },
        {
            id: 'frame-2',
            name: 'Oakley OO9208 Holbrook',
            retailer: 'Vision Express',
            price: 2450.00,
            image: img('Oakley Holbrook', 'frames'),
            category: 'frames',
            description: 'Modern rectangular frame with metal accents',
            sizes: ['Medium', 'Large'],
            colors: ['Matte Black', 'Polished Black', 'Gunmetal'],
            inStock: true
        },
        {
            id: 'frame-3',
            name: 'Tom Ford FT5234',
            retailer: 'Spec-Savers',
            price: 3200.00,
            image: img('Tom Ford', 'frames'),
            category: 'frames',
            description: 'Luxury acetate frame with titanium accents',
            sizes: ['Medium', 'Large'],
            colors: ['Black', 'Brown', 'Tortoise'],
            inStock: true
        },
        // Sunglasses
        {
            id: 'sunglass-1',
            name: 'Ray-Ban RB3025 Aviator Classic',
            retailer: 'OPSM',
            price: 1650.00,
            image: img('Ray-Ban Aviator', 'sunglasses'),
            category: 'sunglasses',
            description: 'Classic aviator sunglasses with green lenses',
            inStock: true
        },
        {
            id: 'sunglass-2',
            name: 'Oakley OO9208 Holbrook Sunglasses',
            retailer: 'Vision Express',
            price: 1950.00,
            image: img('Oakley Sunglasses', 'sunglasses'),
            category: 'sunglasses',
            description: 'Sport sunglasses with polarized lenses',
            inStock: true
        },
        {
            id: 'sunglass-3',
            name: 'Maui Jim Peahi',
            retailer: 'Spec-Savers',
            price: 2800.00,
            image: img('Maui Jim', 'sunglasses'),
            category: 'sunglasses',
            description: 'Premium polarized sunglasses with SuperThin Glass',
            inStock: true
        },
        // Reading Glasses
        {
            id: 'reading-1',
            name: 'Foster Grant Reading Glasses +1.00',
            retailer: 'Clicks',
            price: 120.00,
            image: img('Reading Glasses', 'reading-glasses'),
            category: 'reading-glasses',
            description: 'Basic reading glasses, strength +1.00',
            strengths: ['+1.00', '+1.50', '+2.00', '+2.50', '+3.00'],
            inStock: true
        },
        {
            id: 'reading-2',
            name: 'Magnivision Reading Glasses +1.50',
            retailer: 'Clicks',
            price: 150.00,
            image: img('Magnivision', 'reading-glasses'),
            category: 'reading-glasses',
            description: 'Comfortable reading glasses with blue light filter',
            strengths: ['+1.00', '+1.50', '+2.00', '+2.50'],
            inStock: true
        }
    ];
}

// Get fallback products for specific retailer
function getRetailerFallbackProducts(retailerName, retailerContact = {}) {
    // Get default contact info if not provided
    if (!retailerContact || Object.keys(retailerContact).length === 0) {
        retailerContact = RETAILER_CONTACTS[retailerName] || { phone: '', email: '', website: '', address: '' };
    }
    
    // Get fallback products and add contact info
    const fallbackProducts = getFallbackProducts().filter(p => p.retailer === retailerName);
    return fallbackProducts.map(product => ({
        ...product,
        retailerPhone: retailerContact.phone || '',
        retailerEmail: retailerContact.email || '',
        retailerWebsite: retailerContact.website || product.url || '',
        retailerAddress: retailerContact.address || ''
    }));
}

// Display products
function displayProducts(productsToShow) {
    const container = document.getElementById('products-container');
    
    if (!container) {
        console.error('Products container not found');
        return;
    }
    
    if (!productsToShow || productsToShow.length === 0) {
        container.innerHTML = '<div class="no-products"><p>No products found. Try a different search or category.</p></div>';
        return;
    }
    
    function optionList(values) {
        return (values || []).map(function (value) {
            return '<option value="' + escapeHtml(value) + '">' + escapeHtml(value) + '</option>';
        }).join('');
    }

    container.innerHTML = productsToShow.map(function (product) {
        var imageUrl = product.image || getDefaultImage(product.name);
        var imageId = 'product-img-' + product.id;
        var phone = product.retailerPhone || (window.retailerContacts && window.retailerContacts[product.retailer] && window.retailerContacts[product.retailer].phone) || '';
        var email = product.retailerEmail || (window.retailerContacts && window.retailerContacts[product.retailer] && window.retailerContacts[product.retailer].email) || '';
        var website = product.retailerWebsite || (window.retailerContacts && window.retailerContacts[product.retailer] && window.retailerContacts[product.retailer].website) || product.url || '';
        var address = product.retailerAddress || (window.retailerContacts && window.retailerContacts[product.retailer] && window.retailerContacts[product.retailer].address) || '';
        var canTryOn = product.category === 'frames' || product.category === 'sunglasses';

        return (
            '<div class="product-card premium-product-card" data-category="' + escapeHtml(product.category) + '">' +
            '<div class="product-image premium-product-image">' +
            '<img id="' + escapeHtml(imageId) + '" src="' + escapeHtml(imageUrl) + '" alt="' + escapeHtml(product.name) + '" loading="lazy">' +
            (product.inStock
                ? '<span class="stock-badge in-stock premium-stock-badge">Listed</span>'
                : '<span class="stock-badge out-of-stock premium-stock-badge">Unavailable</span>') +
            (product.brand ? '<div class="product-brand-badge">' + escapeHtml(product.brand) + '</div>' : '') +
            '</div>' +
            '<div class="product-info premium-product-info">' +
            '<h3 class="product-name premium-product-name">' + escapeHtml(product.name) + '</h3>' +
            (product.brand ? '<div class="product-brand premium-brand">' + escapeHtml(product.brand) + '</div>' : '') +
            '<div class="product-retailer-info premium-retailer-info">' +
            '<p>Retailer: <strong>' + escapeHtml(product.retailer) + '</strong></p>' +
            (phone ? '<p><a href="tel:' + escapeHtml(phone.replace(/\s+/g, '')) + '">' + escapeHtml(phone) + '</a></p>' : '') +
            (email ? '<p><a href="mailto:' + escapeHtml(email) + '">' + escapeHtml(email) + '</a></p>' : '') +
            (website ? '<p><a href="' + escapeHtml(website) + '" target="_blank" rel="noopener">Visit ' + escapeHtml(product.retailer) + '</a></p>' : '') +
            (address ? '<p>' + escapeHtml(address) + '</p>' : '') +
            '</div>' +
            (product.description ? '<p class="product-description">' + escapeHtml(product.description) + '</p>' : '') +
            (product.sizes ? '<div class="product-options"><label>Size</label><select class="product-size" data-product-id="' + escapeHtml(product.id) + '">' + optionList(product.sizes) + '</select></div>' : '') +
            (product.colors ? '<div class="product-options"><label>Color</label><select class="product-color" data-product-id="' + escapeHtml(product.id) + '">' + optionList(product.colors) + '</select></div>' : '') +
            (product.strengths ? '<div class="product-options"><label>Strength</label><select class="product-strength" data-product-id="' + escapeHtml(product.id) + '">' + optionList(product.strengths) + '</select></div>' : '') +
            '<div class="product-price"><span class="price-amount">R' + product.price.toFixed(2) + '</span><span class="price-vat">indicative, incl. VAT</span></div>' +
            '<div class="product-actions">' +
            (canTryOn ? '<button type="button" class="btn btn-try-on" data-product-id="' + escapeHtml(product.id) + '">Try on</button>' : '') +
            '<button type="button" class="btn btn-add-cart" data-product-id="' + escapeHtml(product.id) + '"' + (product.inStock ? '' : ' disabled') + '>' +
            (product.inStock ? 'Add to list' : 'Unavailable') +
            '</button></div></div></div>'
        );
    }).join('');

    container.querySelectorAll('.btn-add-cart').forEach(function (btn) {
        btn.addEventListener('click', function () { addToCart(btn.getAttribute('data-product-id')); });
    });
    container.querySelectorAll('.btn-try-on').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var id = btn.getAttribute('data-product-id');
            var product = products.find(function (p) { return p.id === id; });
            if (product) openVirtualTryOn(product.id, product.image, product.name);
        });
    });
}

// Enhanced image error handling
function handleImageError(imgId, productName) {
    const img = document.getElementById(imgId);
    if (!img) return;
    
    // Try multiple fallback sources
    const fallbacks = [
        getDefaultImage(productName)
    ];
    
    let currentFallback = 0;
    const tryNext = () => {
        if (currentFallback >= fallbacks.length) {
            img.src = getDefaultImage(productName);
            return;
        }
        
        const testImg = new Image();
        testImg.onload = () => {
            img.src = fallbacks[currentFallback];
        };
        testImg.onerror = () => {
            currentFallback++;
            tryNext();
        };
        testImg.src = fallbacks[currentFallback];
    };
    
    tryNext();
}

// Filter products by category
function filterProducts(category) {
    currentCategory = category;
    
    // Update active tab
    const tabs = document.querySelectorAll('.category-tab');
    if (tabs.length > 0) {
        tabs.forEach(tab => {
            tab.classList.remove('active');
        });
        const activeTab = document.querySelector('.category-tab[data-category="' + category + '"]');
        if (activeTab) {
            activeTab.classList.add('active');
        }
    }
    
    if (category === 'all') {
        filteredProducts = products;
    } else {
        filteredProducts = products.filter(p => p.category === category);
    }
    
    displayProducts(filteredProducts);
}

// Enhanced search with debouncing
let searchTimeout = null;

// Search products with enhanced matching
function searchProducts() {
    const searchInput = document.getElementById('product-search');
    const searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const searchResultsEl = document.getElementById('search-results-count');
    
    // Clear previous timeout
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }
    
    // Debounce search (wait 300ms after user stops typing)
    searchTimeout = setTimeout(() => {
        performSearch(searchTerm, searchResultsEl);
    }, 300);
}

// Perform the actual search
function performSearch(searchTerm, searchResultsEl) {
    // Show/hide clear button
    const clearBtn = document.getElementById('search-clear-btn');
    if (clearBtn) {
        clearBtn.style.display = searchTerm ? 'flex' : 'none';
    }
    
    if (!searchTerm) {
        // No search term - show all products in current category
        filteredProducts = currentCategory === 'all' ? products : products.filter(p => p.category === currentCategory);
        if (searchResultsEl) {
            searchResultsEl.textContent = `Showing ${filteredProducts.length} products`;
        }
        displayProducts(filteredProducts);
        return;
    }
    
    // Enhanced search across multiple fields
    const searchWords = searchTerm.split(/\s+/).filter(word => word.length > 0);
    
    filteredProducts = (currentCategory === 'all' ? products : products.filter(p => p.category === currentCategory))
        .filter(product => {
            // Search in multiple fields
            const searchableText = [
                product.name,
                product.brand || '',
                product.retailer || '',
                product.description || '',
                product.category || '',
                product.type || ''
            ].join(' ').toLowerCase();
            
            // Check if all search words are found
            return searchWords.every(word => searchableText.includes(word));
        })
        .sort((a, b) => {
            // Sort by relevance (exact name matches first, then brand, then description)
            const aNameMatch = a.name.toLowerCase().includes(searchTerm) ? 1 : 0;
            const bNameMatch = b.name.toLowerCase().includes(searchTerm) ? 1 : 0;
            
            if (aNameMatch !== bNameMatch) {
                return bNameMatch - aNameMatch;
            }
            
            const aBrandMatch = (a.brand || '').toLowerCase().includes(searchTerm) ? 1 : 0;
            const bBrandMatch = (b.brand || '').toLowerCase().includes(searchTerm) ? 1 : 0;
            
            if (aBrandMatch !== bBrandMatch) {
                return bBrandMatch - aBrandMatch;
            }
            
            return 0;
        });
    
    // Update results count
    if (searchResultsEl) {
        if (filteredProducts.length === 0) {
            searchResultsEl.innerHTML = `
                <span style="color: #f44336;">No products found for "${searchTerm}"</span>
                <div class="suggestions" style="margin-top: 0.5rem; font-size: 0.85rem; color: #666;">
                    <strong>Suggestions:</strong> Try different keywords, check spelling, or browse by category
                </div>
            `;
        } else {
            searchResultsEl.textContent = `Found ${filteredProducts.length} product${filteredProducts.length !== 1 ? 's' : ''} for "${searchTerm}"`;
        }
    }
    
    displayProducts(filteredProducts);
}

// Clear search
function clearSearch() {
    const searchInput = document.getElementById('product-search');
    const searchResultsEl = document.getElementById('search-results-count');
    
    if (searchInput) {
        searchInput.value = '';
    }
    
    if (searchResultsEl) {
        searchResultsEl.textContent = '';
    }
    
    // Reset to category view
    filteredProducts = currentCategory === 'all' ? products : products.filter(p => p.category === currentCategory);
    displayProducts(filteredProducts);
}

// Advanced search with filters
function applyAdvancedFilters() {
    const searchTerm = document.getElementById('product-search')?.value.trim().toLowerCase() || '';
    const minPrice = parseFloat(document.getElementById('filter-min-price')?.value) || 0;
    const maxPrice = parseFloat(document.getElementById('filter-max-price')?.value) || Infinity;
    const selectedBrand = document.getElementById('filter-brand')?.value || 'all';
    const selectedRetailer = document.getElementById('filter-retailer')?.value || 'all';
    
    let results = currentCategory === 'all' ? products : products.filter(p => p.category === currentCategory);
    
    // Apply text search
    if (searchTerm) {
        const searchWords = searchTerm.split(/\s+/).filter(word => word.length > 0);
        results = results.filter(product => {
            const searchableText = [
                product.name,
                product.brand || '',
                product.retailer || '',
                product.description || ''
            ].join(' ').toLowerCase();
            return searchWords.every(word => searchableText.includes(word));
        });
    }
    
    // Apply price filter
    results = results.filter(p => p.price >= minPrice && p.price <= maxPrice);
    
    // Apply brand filter
    if (selectedBrand !== 'all') {
        results = results.filter(p => (p.brand || '').toLowerCase() === selectedBrand.toLowerCase());
    }
    
    // Apply retailer filter
    if (selectedRetailer !== 'all') {
        results = results.filter(p => (p.retailer || '').toLowerCase() === selectedRetailer.toLowerCase());
    }
    
    filteredProducts = results;
    displayProducts(filteredProducts);
    
    // Update results count
    const searchResultsEl = document.getElementById('search-results-count');
    if (searchResultsEl) {
        searchResultsEl.textContent = `Found ${filteredProducts.length} product${filteredProducts.length !== 1 ? 's' : ''}`;
    }
}

// Show advanced filters
function showAdvancedFilters() {
    const filtersContainer = document.getElementById('advanced-filters');
    if (!filtersContainer) return;
    
    if (filtersContainer.style.display === 'none' || !filtersContainer.style.display) {
        filtersContainer.style.display = 'block';
        
        // Get unique brands and retailers
        const brands = [...new Set(products.map(p => p.brand).filter(Boolean))].sort();
        const retailers = [...new Set(products.map(p => p.retailer).filter(Boolean))].sort();
        const maxPrice = Math.max(...products.map(p => p.price), 0);
        
        filtersContainer.innerHTML = `
            <div class="filters-grid">
                <div class="filter-group">
                    <label>Price Range (ZAR)</label>
                    <div class="price-range">
                        <input type="number" id="filter-min-price" placeholder="Min" min="0" step="10" onchange="applyAdvancedFilters()">
                        <span>to</span>
                        <input type="number" id="filter-max-price" placeholder="Max" min="0" step="10" value="${maxPrice}" onchange="applyAdvancedFilters()">
                    </div>
                </div>
                <div class="filter-group">
                    <label>Brand</label>
                    <select id="filter-brand" onchange="applyAdvancedFilters()">
                        <option value="all">All Brands</option>
                        ${brands.map(brand => `<option value="${brand}">${brand}</option>`).join('')}
                    </select>
                </div>
                <div class="filter-group">
                    <label>Retailer</label>
                    <select id="filter-retailer" onchange="applyAdvancedFilters()">
                        <option value="all">All Retailers</option>
                        ${retailers.map(retailer => `<option value="${retailer}">${retailer}</option>`).join('')}
                    </select>
                </div>
                <div class="filter-group">
                    <button class="btn btn-secondary" onclick="clearAdvancedFilters()">Clear Filters</button>
                </div>
            </div>
        `;
    } else {
        filtersContainer.style.display = 'none';
    }
}

// Clear advanced filters
function clearAdvancedFilters() {
    document.getElementById('filter-min-price').value = '';
    document.getElementById('filter-max-price').value = '';
    document.getElementById('filter-brand').value = 'all';
    document.getElementById('filter-retailer').value = 'all';
    
    clearSearch();
}

// Add to cart
async function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product || !product.inStock) return;
    
    const card = document.querySelector(`[data-category="${product.category}"]`);
    const size = card?.querySelector('.product-size')?.value || null;
    const color = card?.querySelector('.product-color')?.value || null;
    const strength = card?.querySelector('.product-strength')?.value || null;
    
    const cartItem = {
        id: `${productId}-${Date.now()}`,
        productId: productId,
        name: product.name,
        retailer: product.retailer,
        price: product.price,
        image: product.image,
        quantity: 1,
        size: size,
        color: color,
        strength: strength
    };
    
    shoppingCart.push(cartItem);
    localStorage.setItem('shoppingCart', JSON.stringify(shoppingCart));
    
    // Save to Supabase if available
    const userEmail = window.getUserEmail ? window.getUserEmail() : null;
    if (window.SupabaseStorage && window.SupabaseStorage.isAvailable() && userEmail) {
        try {
            await window.SupabaseStorage.cart.saveCart(shoppingCart, userEmail);
        } catch (error) {
            console.warn('Failed to save cart to Supabase:', error);
        }
    }
    
    updateCartDisplay();
    showNotification(`${product.name} added to your order list.`);
}

// Remove from cart
async function removeFromCart(itemId) {
    shoppingCart = shoppingCart.filter(item => item.id !== itemId);
    localStorage.setItem('shoppingCart', JSON.stringify(shoppingCart));
    
    // Save to Supabase if available
    const userEmail = window.getUserEmail ? window.getUserEmail() : null;
    if (window.SupabaseStorage && window.SupabaseStorage.isAvailable() && userEmail) {
        try {
            await window.SupabaseStorage.cart.saveCart(shoppingCart, userEmail);
        } catch (error) {
            console.warn('Failed to save cart to Supabase:', error);
        }
    }
    
    updateCartDisplay();
}

// Update cart display
function updateCartDisplay() {
    const cartItemsEl = document.getElementById('cart-items');
    const cartCountEl = document.getElementById('cart-count');
    const cartSubtotalEl = document.getElementById('cart-subtotal');
    const cartVatEl = document.getElementById('cart-vat');
    const cartTotalEl = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');
    
    // Safety check - if cart elements don't exist, return early
    if (!cartItemsEl && !cartCountEl) {
        // Cart sidebar may not be loaded yet, that's okay
        return;
    }
    
    // Update count
    if (cartCountEl) {
        cartCountEl.textContent = shoppingCart.length;
    }
    
    // Calculate totals
    const subtotal = shoppingCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const vat = subtotal * 0.15;
    const total = subtotal + vat;
    
    // Update totals
    if (cartSubtotalEl) cartSubtotalEl.textContent = `R${subtotal.toFixed(2)}`;
    if (cartVatEl) cartVatEl.textContent = `R${vat.toFixed(2)}`;
    if (cartTotalEl) cartTotalEl.textContent = `R${total.toFixed(2)}`;
    
    // Update cart items
    if (cartItemsEl) {
        if (shoppingCart.length === 0) {
            cartItemsEl.innerHTML = '<p class="cart-empty">Your order list is empty</p>';
            if (checkoutBtn) checkoutBtn.disabled = true;
        } else {
            cartItemsEl.innerHTML = shoppingCart.map(item => `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <p>${item.retailer}</p>
                        ${item.size ? `<p>Size: ${item.size}</p>` : ''}
                        ${item.color ? `<p>Color: ${item.color}</p>` : ''}
                        ${item.strength ? `<p>Strength: ${item.strength}</p>` : ''}
                        <p class="cart-item-price">R${item.price.toFixed(2)} × ${item.quantity}</p>
                    </div>
                    <button class="cart-item-remove" onclick="removeFromCart('${item.id}')">&times;</button>
                </div>
            `).join('');
            if (checkoutBtn) checkoutBtn.disabled = false;
        }
    }
}

// Toggle cart sidebar
function toggleCart() {
    const cartSidebar = document.getElementById('cart-sidebar');
    if (!cartSidebar) return;
    const open = !cartSidebar.classList.contains('active');
    cartSidebar.classList.toggle('active', open);
    cartSidebar.setAttribute('aria-hidden', open ? 'false' : 'true');
}

// Proceed to checkout
function proceedToCheckout() {
    if (shoppingCart.length === 0) {
        showNotification('Your order list is empty.');
        return;
    }

    const subtotal = shoppingCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const vat = subtotal * 0.15;
    const total = subtotal + vat;

    showCheckoutModal({
        items: shoppingCart,
        subtotal: subtotal,
        vat: vat,
        total: total,
        timestamp: new Date().toISOString()
    });
}

function escapeHtml(value) {
    return String(value == null ? '' : value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// Show checkout modal — enquiry only, no payment
function showCheckoutModal(checkoutData) {
    const existing = document.getElementById('enquiry-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'enquiry-modal';
    modal.className = 'modal active';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-labelledby', 'enquiry-title');
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <button type="button" class="modal-close" aria-label="Close enquiry form" onclick="this.closest('.modal').remove()">&times;</button>
            <h2 id="enquiry-title">Request this order</h2>
            <p class="enquiry-note">Spect-IT does not take payment online. We send your list to the listed retailer so they can confirm stock, fit, and price.</p>
            <div class="checkout-summary">
                <h3>Your list</h3>
                ${checkoutData.items.map(item => `
                    <div class="checkout-item">
                        <span>${escapeHtml(item.name)}${item.quantity > 1 ? ' × ' + item.quantity : ''}</span>
                        <span>R${item.price.toFixed(2)}</span>
                    </div>
                `).join('')}
                <div class="checkout-totals">
                    <div class="checkout-row">
                        <span>Indicative subtotal</span>
                        <span>R${checkoutData.subtotal.toFixed(2)}</span>
                    </div>
                    <div class="checkout-row">
                        <span>VAT (15%)</span>
                        <span>R${checkoutData.vat.toFixed(2)}</span>
                    </div>
                    <div class="checkout-row checkout-total">
                        <span>Indicative total</span>
                        <span>R${checkoutData.total.toFixed(2)}</span>
                    </div>
                </div>
            </div>
            <form id="checkout-form">
                <div class="form-group">
                    <label for="enq-name">Full name</label>
                    <input id="enq-name" name="name" type="text" required autocomplete="name">
                </div>
                <div class="form-group">
                    <label for="enq-email">Email</label>
                    <input id="enq-email" name="email" type="email" required autocomplete="email">
                </div>
                <div class="form-group">
                    <label for="enq-phone">Phone</label>
                    <input id="enq-phone" name="phone" type="tel" required autocomplete="tel">
                </div>
                <div class="form-group">
                    <label for="enq-notes">Preferred collection or notes</label>
                    <textarea id="enq-notes" name="notes" rows="3" placeholder="City, branch, or fitting notes"></textarea>
                </div>
                <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 1rem;">Send order request</button>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector('#checkout-form').addEventListener('submit', function (event) {
        processCheckout(event, checkoutData);
    });
    document.getElementById('enq-name').focus();
}

// Process enquiry — never claim payment was taken
async function processCheckout(event, checkoutData) {
    event.preventDefault();

    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending…';
    }

    const orderData = {
        status: 'enquiry',
        customer: {
            name: form.querySelector('#enq-name').value.trim(),
            email: form.querySelector('#enq-email').value.trim(),
            phone: form.querySelector('#enq-phone').value.trim(),
            notes: form.querySelector('#enq-notes').value.trim()
        },
        payment: { method: 'enquiry' },
        order: checkoutData,
        orderNumber: 'SPECT-ENQ-' + Date.now(),
        date: new Date().toISOString()
    };

    const orders = JSON.parse(localStorage.getItem('spectit_orders') || '[]');
    orders.push(orderData);
    localStorage.setItem('spectit_orders', JSON.stringify(orders));

    const userEmail = (window.getUserEmail && window.getUserEmail()) || orderData.customer.email;
    if (window.SupabaseStorage && window.SupabaseStorage.isAvailable() && userEmail) {
        try {
            await window.SupabaseStorage.orders.saveOrder(orderData, userEmail);
        } catch (error) {
            console.warn('Failed to save enquiry to Supabase:', error);
        }
    }

    const successModal = document.createElement('div');
    successModal.className = 'modal active';
    successModal.setAttribute('role', 'dialog');
    successModal.innerHTML = `
        <div class="modal-content" style="max-width: 500px; text-align: center;">
            <button type="button" class="modal-close" aria-label="Close" onclick="this.closest('.modal').remove()">&times;</button>
            <h2>Request received</h2>
            <p><strong>Reference:</strong> ${escapeHtml(orderData.orderNumber)}</p>
            <p>We have saved your list. A retailer or Spect-IT will follow up at <strong>${escapeHtml(orderData.customer.email)}</strong> to confirm stock and price. No payment has been taken.</p>
            <button type="button" class="btn btn-primary" onclick="this.closest('.modal').remove();" style="margin-top: 1.5rem; width: 100%;">
                Back to shop
            </button>
        </div>
    `;
    document.body.appendChild(successModal);

    shoppingCart = [];
    localStorage.setItem('shoppingCart', JSON.stringify(shoppingCart));
    updateCartDisplay();

    form.closest('.modal').remove();
    const cartSidebar = document.getElementById('cart-sidebar');
    if (cartSidebar) {
        cartSidebar.classList.remove('active');
        cartSidebar.setAttribute('aria-hidden', 'true');
    }
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 10);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Open virtual try-on for a product
function openVirtualTryOn(productId, frameImageUrl, productName) {
    // Find product details
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    // Show virtual try-on modal
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'virtual-tryon-modal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 800px;">
            <button class="modal-close" onclick="closeVirtualTryOn()">&times;</button>
            <h2>Virtual Try-On: ${productName}</h2>
            <div class="tryon-container">
                <div class="camera-container" id="tryon-camera-container">
                    <video id="video" autoplay playsinline></video>
                    <canvas id="canvas"></canvas>
                    <div class="eye-detection-status" id="eye-status">
                        <div>Initializing camera...</div>
                        <div class="eye-indicators">
                            <div id="left-eye-status">Left eye: Not detected</div>
                            <div id="right-eye-status">Right eye: Not detected</div>
                        </div>
                    </div>
                    <div class="frame-overlay" id="frame-overlay">
                        <img id="frame-image" src="${frameImageUrl}" alt="${productName}">
                    </div>
                </div>
                <div class="tryon-actions">
                    <button class="btn btn-secondary" onclick="closeVirtualTryOn()">Close</button>
                    <button class="btn btn-primary" onclick="addToCartFromTryOn('${productId}')">Add to list</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Start camera and virtual try-on
    if (window.startCamera) {
        window.startCamera();
    }
    
    // Load frame image
    if (window.tryOnFrame) {
        window.tryOnFrame(frameImageUrl);
    }
}

// Close virtual try-on
function closeVirtualTryOn() {
    if (window.stopCamera) {
        window.stopCamera();
    }
    const modal = document.getElementById('virtual-tryon-modal');
    if (modal) {
        modal.remove();
    }
}

// Add to cart from virtual try-on
function addToCartFromTryOn(productId) {
    addToCart(productId);
    showNotification('Added to your order list. Request the order when you are ready.');
    closeVirtualTryOn();
}

// Make functions globally available
window.filterProducts = filterProducts;
window.searchProducts = searchProducts;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.toggleCart = toggleCart;
window.proceedToCheckout = proceedToCheckout;
window.processCheckout = processCheckout;
window.openVirtualTryOn = openVirtualTryOn;
window.closeVirtualTryOn = closeVirtualTryOn;
window.addToCartFromTryOn = addToCartFromTryOn;
window.handleImageError = handleImageError;
window.clearSearch = clearSearch;
window.showAdvancedFilters = showAdvancedFilters;
window.clearAdvancedFilters = clearAdvancedFilters;
window.applyAdvancedFilters = applyAdvancedFilters;

