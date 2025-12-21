import { get, post } from '../../common/services/api/request.js';
import { API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';

export const offerService = {
  create: async (payload) => {
    return post(API_ENDPOINTS.OFFERS.CREATE, payload);
  },
  listMade: async () => {
    return get(API_ENDPOINTS.OFFERS.MADE);
  },
  listReceived: async () => {
    return get(API_ENDPOINTS.OFFERS.RECEIVED);
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

