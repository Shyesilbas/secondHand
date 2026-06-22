import apiClient from './api/interceptors.js';
import {API_ENDPOINTS} from '../constants/apiEndpoints.js';

export const membershipService = {
  getStatus: async () => {
    const response = await apiClient.get(API_ENDPOINTS.MEMBERSHIP.STATUS);
    return response.data;
  },

  upgradeToPremium: async () => {
    const response = await apiClient.post(API_ENDPOINTS.MEMBERSHIP.UPGRADE);
    return response.data;
  },

  cancelSubscription: async () => {
    const response = await apiClient.post(API_ENDPOINTS.MEMBERSHIP.CANCEL);
    return response.data;
  },
};
