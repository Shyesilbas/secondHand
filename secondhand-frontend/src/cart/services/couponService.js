import { get } from '../../common/services/api/request.js';
import { API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';
import { post } from '../../common/services/api/request.js';

export const couponService = {
  preview: async (couponCode, offerId) => {
    return post(API_ENDPOINTS.COUPONS.PREVIEW, { couponCode: couponCode || null, offerId: offerId || null });
  },
  active: async () => {
    return get(API_ENDPOINTS.COUPONS.ACTIVE);
  },
};


