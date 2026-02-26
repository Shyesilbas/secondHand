import logger from '../../utils/logger.js';

const ENUM_CACHE_KEY = 'secondhand_enums_cache';
const ENUM_CACHE_VERSION = '4.2';
const REQUIRED_ENUM_KEYS = [
  'listingTypes',
  'listingStatuses',
  'orderStatuses',
  'carBrands',
  'vehicleModels',
  'fuelTypes',
  'colors',
  'doors',
  'currencies',
  'gearTypes',
  'seatCounts',
  'electronicTypes',
  'electronicBrands',
  'electronicModels',
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
  'bookTypes',
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
            clearEnumCache();
            return null;
        }

        const missingKeys = REQUIRED_ENUM_KEYS.filter((key) => !(key in (data || {})));
        if (missingKeys.length > 0) {
            clearEnumCache();
            return null;
        }

        const now = Date.now();
        const expiryTime = timestamp + (CACHE_EXPIRY_HOURS * 60 * 60 * 1000);
        
        if (now > expiryTime) {
            clearEnumCache();
            return null;
        }

        // Check if pricing config cache versions have changed
        if (pricingCacheVersions) {
            const currentListingFeeVersion = data.listingFeeConfig?.cacheVersion;
            const currentShowcaseVersion = data.showcasePricingConfig?.cacheVersion;
            
            if (currentListingFeeVersion && pricingCacheVersions.listingFeeConfig && 
                currentListingFeeVersion !== pricingCacheVersions.listingFeeConfig) {
                clearEnumCache();
                return null;
            }
            
            if (currentShowcaseVersion && pricingCacheVersions.showcasePricingConfig && 
                currentShowcaseVersion !== pricingCacheVersions.showcasePricingConfig) {
                clearEnumCache();
                return null;
            }
        }

        return data;
    } catch (error) {
        logger.error('Error reading enum cache:', error);
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
    } catch (error) {
        logger.error('Error caching enums:', error);
    }
};

export const clearEnumCache = () => {
    try {
        localStorage.removeItem(ENUM_CACHE_KEY);
    } catch (error) {
        logger.error('Error clearing enum cache:', error);
    }
};

export const forceClearEnumCache = () => {
    try {
        localStorage.removeItem(ENUM_CACHE_KEY);
    } catch (error) {
        logger.error('Error force clearing enum cache:', error);
    }
};
