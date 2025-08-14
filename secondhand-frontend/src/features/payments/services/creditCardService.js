import { get, post, del } from '../../../services/api/request';
import { API_ENDPOINTS } from '../../../constants/apiEndpoints';

export const creditCardService = {
  getAllCreditCards: async () => get(API_ENDPOINTS.CREDIT_CARDS.GET_ALL),

  createCreditCard: async (creditCardData) => post(API_ENDPOINTS.CREDIT_CARDS.CREATE, creditCardData),

  deleteCreditCard: async () => del(API_ENDPOINTS.CREDIT_CARDS.DELETE),
};