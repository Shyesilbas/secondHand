import { get } from '../../common/services/api/request.js';
import { API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';
import { post } from '../../common/services/api/request.js';

export const couponService = {
  preview: async (couponCode) => {
    return post(API_ENDPOINTS.COUPONS.PREVIEW, { couponCode: couponCode || null });
  },
  active: async () => {
    return get(API_ENDPOINTS.COUPONS.ACTIVE);
  },
};

