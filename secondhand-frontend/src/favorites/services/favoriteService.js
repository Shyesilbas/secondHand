import { get, post, del } from '../../common/services/api/request.js';
import { API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';
import { 
  FavoriteRequestDTO,
  createFavoriteRequest, 
  createFavoriteFilter, 
  createBulkStatsRequest 
} from '../favorites.js';

export const favoriteService = {

  /**
   * Toggle favorite status for a listing
   */
  toggleFavorite: async (listingId) => {
    const requestData = createFavoriteRequest(listingId);
    return post(API_ENDPOINTS.FAVORITES.TOGGLE, requestData);
  },

  getMyFavorites: async (params = {}) => {
    const filterParams = createFavoriteFilter(params);
    return get(API_ENDPOINTS.FAVORITES.MY_FAVORITES, { params: filterParams });
  },


  isFavorited: async (listingId) => {
    return get(API_ENDPOINTS.FAVORITES.CHECK(listingId));
  },

};