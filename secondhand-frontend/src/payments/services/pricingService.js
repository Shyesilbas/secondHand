import { get } from '../../common/services/api/request.js';
import { API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';

export const pricingService = {
    getListingFeeConfig: async () => {
        return get(API_ENDPOINTS.PAYMENTS.LISTING_FEE_CONFIG);
    }
};
