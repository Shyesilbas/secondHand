/**
 * Enum Cache Service
 * Manages caching of enum values in localStorage for performance optimization
 */

const ENUM_CACHE_KEY = 'secondhand_enums_cache';
const ENUM_CACHE_VERSION = '1.1'; // Increment this when backend enum structure changes
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

/**
 * Cache enums to localStorage
 * @param {Object} enums - Enum data to cache
 */
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
        // If localStorage is full or unavailable, continue without caching
    }
};

/**
 * Clear enum cache from localStorage
 */
export const clearEnumCache = () => {
    try {
        localStorage.removeItem(ENUM_CACHE_KEY);
        console.log('Enum cache cleared');
    } catch (error) {
        console.error('Error clearing enum cache:', error);
    }
};

/**
 * Get cache info for debugging
 * @returns {Object} Cache metadata
 */
export const getEnumCacheInfo = () => {
    try {
        const cached = localStorage.getItem(ENUM_CACHE_KEY);
        if (!cached) return { exists: false };

        const { timestamp, version } = JSON.parse(cached);
        const now = Date.now();
        const age = now - timestamp;
        const expiryTime = timestamp + (CACHE_EXPIRY_HOURS * 60 * 60 * 1000);
        const isExpired = now > expiryTime;

        return {
            exists: true,
            version,
            timestamp: new Date(timestamp).toISOString(),
            age: Math.floor(age / 1000 / 60), // age in minutes
            isExpired,
            expiresAt: new Date(expiryTime).toISOString()
        };
    } catch (error) {
        return { exists: false, error: error.message };
    }
};