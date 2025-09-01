import { get, post, put } from '../../common/services/api/request.js';
import { API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';
import { createSportsCreateRequest, createSportsUpdateRequest, createSportsFilterRequest } from '../sports.js';

export const sportsService = {
  createSportsListing: async (data) => {
    const payload = createSportsCreateRequest(data);
    return post(API_ENDPOINTS.SPORTS.CREATE, payload);
  },
  updateSportsListing: async (id, data) => {
    const payload = createSportsUpdateRequest(data);
    return put(API_ENDPOINTS.SPORTS.UPDATE(id), payload);
  },
  getSportsDetails: async (id) => get(API_ENDPOINTS.SPORTS.BY_ID(id)),
  filterSports: async (filters) => {
    const payload = createSportsFilterRequest(filters);
    return post(API_ENDPOINTS.SPORTS.FILTER, payload);
  },
};


