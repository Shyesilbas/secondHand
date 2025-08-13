import { get, post, del } from '../../../services/api/request';
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
    return post(API_ENDPOINTS.FAVORITES.ADD, requestData);
  },

  /**
   * Remove a listing from favorites
   */
  removeFromFavorites: async (listingId) => {
    return del(API_ENDPOINTS.FAVORITES.REMOVE(listingId));
  },


  toggleFavorite: async (listingId) => {
    // Use DTO with validation
    const requestData = createFavoriteRequest(listingId);
    return post(API_ENDPOINTS.FAVORITES.TOGGLE, requestData);
  },

  /**
   * Get user's favorite listings with pagination
   */
  getMyFavorites: async (params = {}) => {
    const filterParams = createFavoriteFilter(params);
    return get(API_ENDPOINTS.FAVORITES.MY_FAVORITES, { params: filterParams });
  },

  /**
   * Get favorite statistics for a listing
   */
  getFavoriteStats: async (listingId) => {
    return get(API_ENDPOINTS.FAVORITES.STATS(listingId));
  },

  /**
   * Get favorite statistics for multiple listings
   */
  getBulkFavoriteStats: async (listingIds) => {
    const requestData = createBulkStatsRequest(listingIds);
    return post(API_ENDPOINTS.FAVORITES.BULK_STATS, requestData);
  },

  /**
   * Check if a listing is favorited by current user
   */
  isFavorited: async (listingId) => {
    return get(API_ENDPOINTS.FAVORITES.CHECK(listingId));
  },

  /**
   * Get total favorite count for a listing
   */
  getFavoriteCount: async (listingId) => {
    return get(API_ENDPOINTS.FAVORITES.COUNT(listingId));
  },

  /**
   * Get current user's favorite listing IDs
   */
  getMyFavoriteIds: async () => {
    return get(API_ENDPOINTS.FAVORITES.IDS);
  },

  /**
   * Get top favorited listings
   */
  getTopFavorites: async (params = {}) => {
    return get(API_ENDPOINTS.FAVORITES.TOP, { params: { page: 0, size: 10, ...params } });
  }
};