import logger from '../../utils/logger.js';

const ENUM_CACHE_KEY = 'secondhand_enums_cache';
const ENUM_CACHE_VERSION = '4.4';
const REQUIRED_ENUM_PATHS = [
  ['general', 'listingTypes'],
  ['general', 'listingStatuses'],
  ['general', 'orderStatuses'],
  ['general', 'currencies'],
  ['general', 'paymentTypes'],
  ['general', 'shippingStatuses'],
  ['general', 'emailTypes'],
  ['general', 'genders'],
  ['general', 'auditEventTypes'],
  ['general', 'auditEventStatuses'],
  ['general', 'listingFeeConfig'],
  ['general', 'showcasePricingConfig'],
  ['general', 'agreementGroups'],
  ['general', 'agreementTypes'],
  ['vehicle', 'carBrands'],
  ['vehicle', 'vehicleTypes'],
  ['vehicle', 'vehicleModels'],
  ['vehicle', 'fuelTypes'],
  ['vehicle', 'colors'],
  ['vehicle', 'doors'],
  ['vehicle', 'gearTypes'],
  ['vehicle', 'seatCounts'],
  ['vehicle', 'drivetrains'],
  ['vehicle', 'bodyTypes'],
  ['electronics', 'electronicTypes'],
  ['electronics', 'electronicBrands'],
  ['electronics', 'electronicModels'],
  ['electronics', 'processors'],
  ['electronics', 'storageTypes'],
  ['electronics', 'electronicConnectionTypes'],
  ['realEstate', 'realEstateTypes'],
  ['realEstate', 'realEstateAdTypes'],
  ['realEstate', 'heatingTypes'],
  ['realEstate', 'ownerTypes'],
  ['clothing', 'clothingBrands'],
  ['clothing', 'clothingTypes'],
  ['clothing', 'clothingConditions'],
  ['clothing', 'clothingGenders'],
  ['clothing', 'clothingCategories'],
  ['clothing', 'clothingSizes'],
  ['book', 'bookTypes'],
  ['book', 'bookGenres'],
  ['book', 'bookLanguages'],
  ['book', 'bookFormats'],
  ['book', 'bookConditions'],
  ['sport', 'sportDisciplines'],
  ['sport', 'sportEquipmentTypes'],
  ['sport', 'sportConditions'],
];
const CACHE_EXPIRY_HOURS = 24;
const hasNestedKey = (obj, path) => {
    let current = obj;
    for (const segment of path) {
        if (current == null || !(segment in current)) {
            return false;
        }
        current = current[segment];
    }
    return true;
};

export const getCachedEnums = () => {
    try {
        const cached = localStorage.getItem(ENUM_CACHE_KEY);
        if (!cached) return null;

        const { data, timestamp, version, pricingCacheVersions } = JSON.parse(cached);
        
        if (version !== ENUM_CACHE_VERSION) {
            clearEnumCache();
            return null;
        }

        const missingPaths = REQUIRED_ENUM_PATHS.filter((path) => !hasNestedKey(data, path));
        if (missingPaths.length > 0) {
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
            const currentListingFeeVersion = data.general?.listingFeeConfig?.cacheVersion;
            const currentShowcaseVersion = data.general?.showcasePricingConfig?.cacheVersion;
            
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
            listingFeeConfig: enums.general?.listingFeeConfig?.cacheVersion,
            showcasePricingConfig: enums.general?.showcasePricingConfig?.cacheVersion
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
