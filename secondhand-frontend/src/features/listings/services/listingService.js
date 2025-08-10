import apiClient from '../../../services/api/config';
import { API_ENDPOINTS } from '../../../constants/apiEndpoints';

export const listingService = {
  getAllListings: async () => {
    const response = await apiClient.get(API_ENDPOINTS.LISTINGS.ALL);
    return response.data;
  },

  getMyListingsByStatus: async (status) => {
    const response = await apiClient.get(API_ENDPOINTS.LISTINGS.BY_STATUS(status));
    return response.data;
  },

  getListingById: async (id) => {
    const response = await apiClient.get(API_ENDPOINTS.LISTINGS.BY_ID(id));
    return response.data;
  },

  getMyListings: async () => {
    const response = await apiClient.get(API_ENDPOINTS.LISTINGS.MY_LISTINGS);
    return response.data;
  },

  publishListing: async (id) => {
    const response = await apiClient.put(`/v1/listings/${id}/publish`);
    return response.data;
  },
};