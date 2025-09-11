import { API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';
import { get, post, del } from '../../common/services/api/request.js';

export const creditCardService = {
  getAll: async () => {
    return get(API_ENDPOINTS.CREDIT_CARDS.GET_ALL);
  },

  createCreditCard: async (limit) => {
    return post(API_ENDPOINTS.CREDIT_CARDS.CREATE, { limit });
  },

  deleteCreditCard: async () => {
    return del(API_ENDPOINTS.CREDIT_CARDS.DELETE);
  }
};