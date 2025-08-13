import apiClient from '../../../services/api/config';
import { API_ENDPOINTS } from '../../../constants/apiEndpoints';
import { createListingFilterRequest } from '../../../types/listings';

export const listingService = {
  getAllListings: async () => {
    const response = await apiClient.get(API_ENDPOINTS.LISTINGS.ALL);
    console.log('API Response for getAllListings:', response.data);
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

  getListingByNo: async (listingNo) => {
    const response = await apiClient.get(API_ENDPOINTS.LISTINGS.BY_LISTING_NO(listingNo));
    console.log('API Response for getListingByNo:', response.data);
    return response.data;
  },

  getMyListings: async () => {
    const response = await apiClient.get(API_ENDPOINTS.LISTINGS.MY_LISTINGS);
    return response.data;
  },

  publishListing: async (id) => {
    const response = await apiClient.put(API_ENDPOINTS.LISTINGS.PUBLISH(id));
    return response.data;
  },

  getListingStatistics: async () => {
    const response = await apiClient.get(API_ENDPOINTS.LISTINGS.STATISTICS);
    return response.data;
  },

  deleteListing: async (id) => {
    const response = await apiClient.delete(API_ENDPOINTS.LISTINGS.DELETE(id));
    return response.data;
  },

  getListingsByType: async (listingType) => {
    const response = await apiClient.get(API_ENDPOINTS.LISTINGS.BY_TYPE(listingType));
    return response.data;
  },

  getActiveListingsByType: async (listingType) => {
    const response = await apiClient.get(API_ENDPOINTS.LISTINGS.BY_TYPE_ACTIVE(listingType));
    return response.data;
  },

  getListingsByTypeOrderByDate: async (listingType) => {
    const response = await apiClient.get(API_ENDPOINTS.LISTINGS.BY_TYPE_ORDERED(listingType));
    return response.data;
  },

  getListingsWithFilters: async (filters) => {
    const filterData = createListingFilterRequest(filters);
    const response = await apiClient.post(API_ENDPOINTS.LISTINGS.FILTER, filterData);
    return response.data;
  },
};