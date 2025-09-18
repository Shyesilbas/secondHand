/**
 * Enum Cache Service
 * Manages caching of enum values in localStorage for performance optimization
 */

const ENUM_CACHE_KEY = 'secondhand_enums_cache';
const ENUM_CACHE_VERSION = '1.8'; // Increment this when backend enum structure changes
const REQUIRED_ENUM_KEYS = [
  'listingTypes',
  'listingStatuses',
  'carBrands',
  'fuelTypes',
  'colors',
  'doors',
  'currencies',
  'gearTypes',
  'seatCounts',
  // Newly added keys for electronics
  'electronicTypes',
  'electronicBrands',
  // Newly added keys for real estate
  'realEstateTypes',
  'realEstateAdTypes',
  'heatingTypes',
  'ownerTypes',
  // Clothing
  'clothingBrands',
  'clothingTypes',
  'clothingConditions',
  // Books
  'bookGenres',
  'bookLanguages',
  'bookFormats',
  'bookConditions',
  // Sports
  'sportDisciplines',
  'sportEquipmentTypes',
  'sportConditions',
  // Payments / Orders / Emails
  'paymentTypes',
  'shippingStatuses',
  'emailTypes',
];
const CACHE_EXPIRY_HOURS = 24; // Cache expires after 24 hours

/**
 * Get cached enums from localStorage
 * @returns {Object|null} Cached enums or null if not found/expired
 */
export const getCachedEnums = () => {
    try {
        const cached = localStorage.getItem(ENUM_CACHE_KEY);
        if (!cached) return null;

        const { data, timestamp, version } = JSON.parse(cached);
        
        // Check version compatibility
        if (version !== ENUM_CACHE_VERSION) {
            console.log('Enum cache version mismatch, clearing cache');
            clearEnumCache();
            return null;
        }

        // Schema/key presence check
        const missingKeys = REQUIRED_ENUM_KEYS.filter((key) => !(key in (data || {})));
        if (missingKeys.length > 0) {
            console.log('Enum cache missing keys', missingKeys, '— clearing cache');
            clearEnumCache();
            return null;
        }

        // Check expiry
        const now = Date.now();
        const expiryTime = timestamp + (CACHE_EXPIRY_HOURS * 60 * 60 * 1000);
        
        if (now > expiryTime) {
            console.log('Enum cache expired, clearing cache');
            clearEnumCache();
            return null;
        }

        console.log('Using cached enums from localStorage');
        return data;
    } catch (error) {
        console.error('Error reading enum cache:', error);
        clearEnumCache();
        return null;
    }
};


export const setCachedEnums = (enums) => {
    try {
        const cacheData = {
            data: enums,
            timestamp: Date.now(),
            version: ENUM_CACHE_VERSION
        };
        
        localStorage.setItem(ENUM_CACHE_KEY, JSON.stringify(cacheData));
        console.log('Enums cached to localStorage');
    } catch (error) {
        console.error('Error caching enums:', error);
    }
};

export const clearEnumCache = () => {
    try {
        localStorage.removeItem(ENUM_CACHE_KEY);
        console.log('Enum cache cleared');
    } catch (error) {
        console.error('Error clearing enum cache:', error);
    }
};
