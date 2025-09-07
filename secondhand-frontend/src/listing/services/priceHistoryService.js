import { get } from '../../common/services/api/request.js';
import { API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';

export const priceHistoryService = {
    // Get price history for a listing
    getPriceHistory: async (listingId) => {
        return get(API_ENDPOINTS.PRICE_HISTORY.BY_LISTING(listingId));
    },

    // Get latest price change for a listing
    getLatestPriceChange: async (listingId) => {
        return get(API_ENDPOINTS.PRICE_HISTORY.LATEST(listingId));
    },

    // Check if listing has price history
    hasPriceHistory: async (listingId) => {
        return get(API_ENDPOINTS.PRICE_HISTORY.EXISTS(listingId));
    },
};
