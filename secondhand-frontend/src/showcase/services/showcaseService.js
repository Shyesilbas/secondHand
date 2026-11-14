import { get, post } from '../../common/services/api/request.js';
import { API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';

export const showcaseService = {
 getActiveShowcases: ({ page = 0, size = 12 } = {}) =>
 get(API_ENDPOINTS.SHOWCASES.ACTIVE, { params: { page, size } }),

 getUserShowcases: () => get(API_ENDPOINTS.SHOWCASES.MY_SHOWCASES),

 // Spring binds repeated `days=` params to a list; axios would send `days[]=`.
 getQuotes: (daysOptions) => {
 const query = new URLSearchParams();
 daysOptions.forEach((d) => query.append('days', String(d)));
 return get(`${API_ENDPOINTS.SHOWCASES.QUOTES}?${query.toString()}`);
 },

 createShowcase: async (listingId, days, paymentType, verificationCode, agreementsAccepted = false, acceptedAgreementIds = []) => {
 const payload = {
 listingId,
 days,
 paymentType,
 providerName: paymentType || 'EWALLET',
 verificationCode,
 agreementsAccepted,
 acceptedAgreementIds,
 idempotencyKey: `showcase-${listingId}-${days}-${Date.now()}`
 };
 return post(API_ENDPOINTS.SHOWCASES.CREATE, payload);
 },

 extendShowcase: (showcaseId, payload) =>
 post(API_ENDPOINTS.SHOWCASES.EXTEND(showcaseId), payload),

 cancelShowcase: (showcaseId) =>
 post(API_ENDPOINTS.SHOWCASES.CANCEL(showcaseId))
};
