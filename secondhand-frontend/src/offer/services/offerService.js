import { get, post } from '../../common/services/api/request.js';
import { API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';

export const offerService = {
  create: async (payload) => {
    return post(API_ENDPOINTS.OFFERS.CREATE, payload);
  },
  listMade: async (page = 0, size = 5) => {
    return get(`${API_ENDPOINTS.OFFERS.MADE}?page=${page}&size=${size}`);
  },
  listReceived: async (page = 0, size = 5) => {
    return get(`${API_ENDPOINTS.OFFERS.RECEIVED}?page=${page}&size=${size}`);
  },
  getById: async (id) => {
    return get(API_ENDPOINTS.OFFERS.BY_ID(id));
  },
  accept: async (id) => {
    return post(API_ENDPOINTS.OFFERS.ACCEPT(id), {});
  },
  reject: async (id) => {
    return post(API_ENDPOINTS.OFFERS.REJECT(id), {});
  },
  counter: async (id, payload) => {
    return post(API_ENDPOINTS.OFFERS.COUNTER(id), payload);
  },
};

