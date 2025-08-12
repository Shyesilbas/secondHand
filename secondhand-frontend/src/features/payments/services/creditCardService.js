import apiClient from '../../../services/api/config';
import { API_ENDPOINTS } from '../../../constants/apiEndpoints';

export const creditCardService = {
  // Get all credit cards
  getAllCreditCards: async () => {
    const response = await apiClient.get(API_ENDPOINTS.CREDIT_CARDS.GET_ALL);
    return response.data;
  },

  // Create new credit card
  createCreditCard: async (creditCardData) => {
    const response = await apiClient.post(API_ENDPOINTS.CREDIT_CARDS.CREATE, creditCardData);
    return response.data;
  },

  // Delete credit card
  deleteCreditCard: async () => {
    const response = await apiClient.delete(API_ENDPOINTS.CREDIT_CARDS.DELETE);
    return response.data;
  },

  // Check if credit card exists
  checkCreditCardExists: async () => {
    const response = await apiClient.get(API_ENDPOINTS.CREDIT_CARDS.EXISTS);
    return response.data;
  },

  // Get available credit
  getAvailableCredit: async () => {
    const response = await apiClient.get(API_ENDPOINTS.CREDIT_CARDS.AVAILABLE_CREDIT);
    return response.data;
  },
};