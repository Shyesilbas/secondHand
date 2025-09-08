import { get, post } from '../../common/services/api/request.js';
import { API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';
import { 
  createFavoriteRequest
} from '../favorites.js';

export const favoriteService = {

  toggleFavorite: async (listingId) => {
    const requestData = createFavoriteRequest(listingId);
    return post(API_ENDPOINTS.FAVORITES.TOGGLE, requestData);
  },


  isFavorited: async (listingId) => {
    return get(API_ENDPOINTS.FAVORITES.CHECK(listingId));
  },

  getMyFavorites: async (params = {}) => {
    const query = new URLSearchParams({
      page: params.page ?? 0,
      size: params.size ?? 20,
      sortBy: params.sortBy ?? 'createdAt',
      sortDirection: params.sortDirection ?? 'DESC',
    }).toString();

    return get(API_ENDPOINTS.FAVORITES.MY_FAVORITES);
  }

};