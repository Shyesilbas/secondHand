import { get, post, put } from '../../../services/api/request';
import { API_ENDPOINTS } from '../../../constants/apiEndpoints';
import { createSportsCreateRequest, createSportsUpdateRequest, createSportsFilterRequest } from '../../../types/sports';

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


