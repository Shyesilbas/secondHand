import { API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';
import { get, post, put, del } from '../../common/services/api/request.js';

export const campaignService = {
  listMine: async (page = 0, size = 5) => {
    return get(`${API_ENDPOINTS.CAMPAIGNS.SELLER}?page=${page}&size=${size}`);
  },
  create: async (payload) => {
    return post(API_ENDPOINTS.CAMPAIGNS.SELLER, payload);
  },
  update: async (id, payload) => {
    return put(API_ENDPOINTS.CAMPAIGNS.BY_ID(id), payload);
  },
  remove: async (id) => {
    return del(API_ENDPOINTS.CAMPAIGNS.BY_ID(id));
  },
};


