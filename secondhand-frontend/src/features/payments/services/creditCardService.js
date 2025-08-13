import { get, post, del } from '../../../services/api/request';
import { API_ENDPOINTS } from '../../../constants/apiEndpoints';

export const creditCardService = {
  // Get all credit cards
  getAllCreditCards: async () => get(API_ENDPOINTS.CREDIT_CARDS.GET_ALL),

  // Create new credit card
  createCreditCard: async (creditCardData) => post(API_ENDPOINTS.CREDIT_CARDS.CREATE, creditCardData),

  // Delete credit card
  deleteCreditCard: async () => del(API_ENDPOINTS.CREDIT_CARDS.DELETE),

  // Check if credit card exists
  checkCreditCardExists: async () => get(API_ENDPOINTS.CREDIT_CARDS.EXISTS),

  // Get available credit
  getAvailableCredit: async () => get(API_ENDPOINTS.CREDIT_CARDS.AVAILABLE_CREDIT),
};