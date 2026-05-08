import { get, post, put } from '../../common/services/api/request.js';
import { API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';

export const adminCouponApi = {
  list: () => get(API_ENDPOINTS.ADMIN_COUPONS.BASE),
  create: (body) => post(API_ENDPOINTS.ADMIN_COUPONS.BASE, body),
  update: (id, body) => put(API_ENDPOINTS.ADMIN_COUPONS.BY_ID(id), body),
  audienceStats: (audience) => get(API_ENDPOINTS.ADMIN_COUPONS.AUDIENCE_STATS(audience)),
};
