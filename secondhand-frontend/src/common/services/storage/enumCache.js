
const ENUM_CACHE_KEY = 'secondhand_enums_cache';
const ENUM_CACHE_VERSION = '3.0';
const REQUIRED_ENUM_KEYS = [
  'listingTypes',
  'listingStatuses',
  'orderStatuses',
  'carBrands',
  'fuelTypes',
  'colors',
  'doors',
  'currencies',
  'gearTypes',
  'seatCounts',
  'electronicTypes',
  'electronicBrands',
  'processors',
  'drivetrains',
  'bodyTypes',
  'realEstateTypes',
  'realEstateAdTypes',
  'heatingTypes',
  'ownerTypes',
  'clothingBrands',
  'clothingTypes',
  'clothingConditions',
  'clothingGenders',
  'clothingCategories',
  'bookGenres',
  'bookLanguages',
  'bookFormats',
  'bookConditions',
  'sportDisciplines',
  'sportEquipmentTypes',
  'sportConditions',
  'genders',
  'paymentTypes',
  'shippingStatuses',
  'emailTypes',
  'auditEventTypes',
  'auditEventStatuses',
  'listingFeeConfig',
  'showcasePricingConfig',
  'agreementGroups',
  'agreementTypes',
];
const CACHE_EXPIRY_HOURS = 24;
export const getCachedEnums = () => {
    try {
        const cached = localStorage.getItem(ENUM_CACHE_KEY);
        if (!cached) return null;

        const { data, timestamp, version, pricingCacheVersions } = JSON.parse(cached);
        
        if (version !== ENUM_CACHE_VERSION) {
            console.log('Enum cache version mismatch, clearing cache');
            clearEnumCache();
            return null;
        }

        const missingKeys = REQUIRED_ENUM_KEYS.filter((key) => !(key in (data || {})));
        if (missingKeys.length > 0) {
            console.log('Enum cache missing keys', missingKeys, '— clearing cache');
            clearEnumCache();
            return null;
        }

        const now = Date.now();
        const expiryTime = timestamp + (CACHE_EXPIRY_HOURS * 60 * 60 * 1000);
        
        if (now > expiryTime) {
            console.log('Enum cache expired, clearing cache');
            clearEnumCache();
            return null;
        }

        // Check if pricing config cache versions have changed
        if (pricingCacheVersions) {
            const currentListingFeeVersion = data.listingFeeConfig?.cacheVersion;
            const currentShowcaseVersion = data.showcasePricingConfig?.cacheVersion;
            
            if (currentListingFeeVersion && pricingCacheVersions.listingFeeConfig && 
                currentListingFeeVersion !== pricingCacheVersions.listingFeeConfig) {
                console.log('Listing fee config cache version changed, clearing cache');
                clearEnumCache();
                return null;
            }
            
            if (currentShowcaseVersion && pricingCacheVersions.showcasePricingConfig && 
                currentShowcaseVersion !== pricingCacheVersions.showcasePricingConfig) {
                console.log('Showcase pricing config cache version changed, clearing cache');
                clearEnumCache();
                return null;
            }
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
        // Extract pricing cache versions for future comparison
        const pricingCacheVersions = {
            listingFeeConfig: enums.listingFeeConfig?.cacheVersion,
            showcasePricingConfig: enums.showcasePricingConfig?.cacheVersion
        };
        
        const cacheData = {
            data: enums,
            timestamp: Date.now(),
            version: ENUM_CACHE_VERSION,
            pricingCacheVersions
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

export const forceClearEnumCache = () => {
    try {
        localStorage.removeItem(ENUM_CACHE_KEY);
        console.log('Enum cache force cleared - will refetch all enums including audit enums');
    } catch (error) {
        console.error('Error force clearing enum cache:', error);
    }
};
