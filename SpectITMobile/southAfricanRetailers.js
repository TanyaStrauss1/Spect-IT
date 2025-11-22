/**
 * South African Retailer Database
 * Major eyewear retailers and chains in South Africa
 */

export const SOUTH_AFRICAN_RETAILERS = [
  {
    id: 'specsavers',
    name: 'Spec-Savers',
    website: 'https://www.specsavers.co.za',
    storeLocatorUrl: 'https://www.specsavers.co.za/stores',
    products: ['frames', 'contact lenses', 'sunglasses'],
    description: 'Leading optical retailer with stores nationwide',
    storeCount: 200,
    apiAvailable: false,
    contact: {
      email: 'info@specsavers.co.za',
      phone: '0860 773 227',
    },
    locations: {
      type: 'chain',
      coverage: 'nationwide',
    },
  },
  {
    id: 'opsm',
    name: 'OPSM',
    website: 'https://www.opsm.co.za',
    storeLocatorUrl: 'https://www.opsm.co.za/store-locator',
    products: ['frames', 'contact lenses', 'sunglasses'],
    description: 'Premium eyewear retailer with locations in major cities',
    storeCount: 50,
    apiAvailable: false,
    contact: {
      email: 'info@opsm.co.za',
      phone: '0861 677 677',
    },
    locations: {
      type: 'chain',
      coverage: 'major-cities',
    },
  },
  {
    id: 'vision-express',
    name: 'Vision Express',
    website: 'https://www.visionexpress.co.za',
    storeLocatorUrl: 'https://www.visionexpress.co.za/store-locator',
    products: ['frames', 'contact lenses', 'sunglasses'],
    description: 'International optical chain with South African presence',
    storeCount: 30,
    apiAvailable: false,
    contact: {
      email: 'info@visionexpress.co.za',
      phone: '0861 847 466',
    },
    locations: {
      type: 'chain',
      coverage: 'major-cities',
    },
  },
  {
    id: 'takealot',
    name: 'Takealot',
    website: 'https://www.takealot.com',
    storeLocatorUrl: null,
    products: ['frames', 'sunglasses'],
    description: 'Online retailer with eyewear section',
    onlineOnly: true,
    apiAvailable: true,
    contact: {
      email: 'support@takealot.com',
      phone: '0861 825 256',
    },
    locations: {
      type: 'online',
      coverage: 'nationwide',
    },
  },
  {
    id: 'zando',
    name: 'Zando',
    website: 'https://www.zando.co.za',
    storeLocatorUrl: null,
    products: ['sunglasses'],
    description: 'Online fashion retailer with sunglasses',
    onlineOnly: true,
    apiAvailable: false,
    contact: {
      email: 'support@zando.co.za',
      phone: '0861 926 367',
    },
    locations: {
      type: 'online',
      coverage: 'nationwide',
    },
  },
];

/**
 * Get retailer by ID
 */
export const getRetailerById = (id) => {
  return SOUTH_AFRICAN_RETAILERS.find(retailer => retailer.id === id);
};

/**
 * Get retailers by product type
 */
export const getRetailersByProduct = (productType) => {
  return SOUTH_AFRICAN_RETAILERS.filter(retailer => 
    retailer.products.includes(productType)
  );
};

/**
 * Get online retailers
 */
export const getOnlineRetailers = () => {
  return SOUTH_AFRICAN_RETAILERS.filter(retailer => retailer.onlineOnly);
};

/**
 * Get physical store retailers
 */
export const getPhysicalRetailers = () => {
  return SOUTH_AFRICAN_RETAILERS.filter(retailer => !retailer.onlineOnly);
};

/**
 * Get all retailer names for search
 */
export const getRetailerSearchTerms = () => {
  return SOUTH_AFRICAN_RETAILERS.map(retailer => retailer.name.toLowerCase());
};

export default {
  SOUTH_AFRICAN_RETAILERS,
  getRetailerById,
  getRetailersByProduct,
  getOnlineRetailers,
  getPhysicalRetailers,
  getRetailerSearchTerms,
};

