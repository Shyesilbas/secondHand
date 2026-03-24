import { get, post } from '../../common/services/api/request.js';
import { API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';
import { 
  createFavoriteRequest
} from '../favorites.js';
import { FAVORITE_DEFAULTS } from '../favoriteConstants.js';

export const favoriteService = {

  toggleFavorite: async (listingId) => {
    const requestData = createFavoriteRequest(listingId);
    return post(API_ENDPOINTS.FAVORITES.TOGGLE, requestData);
  },


  isFavorited: async (listingId) => {
    return get(API_ENDPOINTS.FAVORITES.CHECK(listingId));
  },

  getMyFavorites: async ({
    page = FAVORITE_DEFAULTS.PAGE,
    size = FAVORITE_DEFAULTS.PAGE_SIZE,
  } = {}) => {
    return get(API_ENDPOINTS.FAVORITES.MY_FAVORITES, { params: { page, size } });
  },

};