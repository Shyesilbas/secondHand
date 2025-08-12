import apiClient from '../../../services/api/config';
import { API_ENDPOINTS } from '../../../constants/apiEndpoints';
import { 
  FavoriteRequestDTO,
  createFavoriteRequest, 
  createFavoriteFilter, 
  createBulkStatsRequest 
} from '../../../types/favorites';

export const favoriteService = {
  /**
   * Add a listing to favorites
   */
  addToFavorites: async (listingId) => {
    // Use DTO with validation
    const requestData = createFavoriteRequest(listingId);
    const response = await apiClient.post(API_ENDPOINTS.FAVORITES.ADD, requestData);
    return response.data;
  },

  /**
   * Remove a listing from favorites
   */
  removeFromFavorites: async (listingId) => {
    const response = await apiClient.delete(API_ENDPOINTS.FAVORITES.REMOVE(listingId));
    return response.data;
  },


  toggleFavorite: async (listingId) => {
    // Use DTO with validation
    const requestData = createFavoriteRequest(listingId);
    const response = await apiClient.post(API_ENDPOINTS.FAVORITES.TOGGLE, requestData);
    return response.data;
  },

  /**
   * Get user's favorite listings with pagination
   */
  getMyFavorites: async (params = {}) => {
    const filterParams = createFavoriteFilter(params);
    const response = await apiClient.get(API_ENDPOINTS.FAVORITES.MY_FAVORITES, {
      params: filterParams
    });
    return response.data;
  },

  /**
   * Get favorite statistics for a listing
   */
  getFavoriteStats: async (listingId) => {
    const response = await apiClient.get(API_ENDPOINTS.FAVORITES.STATS(listingId));
    return response.data;
  },

  /**
   * Get favorite statistics for multiple listings
   */
  getBulkFavoriteStats: async (listingIds) => {
    const requestData = createBulkStatsRequest(listingIds);
    const response = await apiClient.post(API_ENDPOINTS.FAVORITES.BULK_STATS, requestData);
    return response.data;
  },

  /**
   * Check if a listing is favorited by current user
   */
  isFavorited: async (listingId) => {
    const response = await apiClient.get(API_ENDPOINTS.FAVORITES.CHECK(listingId));
    return response.data;
  },

  /**
   * Get total favorite count for a listing
   */
  getFavoriteCount: async (listingId) => {
    const response = await apiClient.get(API_ENDPOINTS.FAVORITES.COUNT(listingId));
    return response.data;
  },

  /**
   * Get current user's favorite listing IDs
   */
  getMyFavoriteIds: async () => {
    const response = await apiClient.get(API_ENDPOINTS.FAVORITES.IDS);
    return response.data;
  },

  /**
   * Get top favorited listings
   */
  getTopFavorites: async (params = {}) => {
    const response = await apiClient.get(API_ENDPOINTS.FAVORITES.TOP, {
      params: {
        page: 0,
        size: 10,
        ...params
      }
    });
    return response.data;
  }
};