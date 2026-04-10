import { get, post } from '../../common/services/api/request.js';
import { API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';

export const showcaseService = {
  getActiveShowcases: ({ page = 0, size = 12 } = {}) =>
    get(API_ENDPOINTS.SHOWCASES.ACTIVE, { params: { page, size } }),

  getUserShowcases: () => get(API_ENDPOINTS.SHOWCASES.MY_SHOWCASES),

  createShowcase: async (listingId, days, paymentType, verificationCode, agreementsAccepted = false, acceptedAgreementIds = []) => {
    const payload = {
      listingId,
      days,
      paymentType,
      verificationCode,
      agreementsAccepted,
      acceptedAgreementIds,
      idempotencyKey: `showcase-${listingId}-${days}-${Date.now()}`
    };
    return post(API_ENDPOINTS.SHOWCASES.CREATE, payload);
  },

  extendShowcase: (showcaseId, days) =>
    post(API_ENDPOINTS.SHOWCASES.EXTEND(showcaseId), null, { params: { days } }),

  cancelShowcase: (showcaseId) =>
    post(API_ENDPOINTS.SHOWCASES.CANCEL(showcaseId)),

  getPricingConfig: () => get(API_ENDPOINTS.SHOWCASES.PRICING_CONFIG),
};
