import { get, post, del } from '../../common/services/api/request.js';
import { API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';

export const creditCardService = {
  getAllCreditCards: async () => {
    const data = await get(API_ENDPOINTS.CREDIT_CARDS.GET_ALL);
    return Array.isArray(data) ? data : [data].filter(Boolean);
  },

  createCreditCard: async () => post(API_ENDPOINTS.CREDIT_CARDS.CREATE),

  deleteCreditCard: async () => del(API_ENDPOINTS.CREDIT_CARDS.DELETE),
};