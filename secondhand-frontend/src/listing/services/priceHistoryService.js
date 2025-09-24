import { get } from '../../common/services/api/request.js';
import { API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';

export const priceHistoryService = {
        getPriceHistory: async (listingId) => {
        return get(API_ENDPOINTS.PRICE_HISTORY.BY_LISTING(listingId));
    },

        getLatestPriceChange: async (listingId) => {
        return get(API_ENDPOINTS.PRICE_HISTORY.LATEST(listingId));
    },

        hasPriceHistory: async (listingId) => {
        return get(API_ENDPOINTS.PRICE_HISTORY.EXISTS(listingId));
    },
};
