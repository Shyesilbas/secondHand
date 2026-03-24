import { get, post } from '../../common/services/api/request.js';
import { API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';
import { OFFER_DEFAULTS } from '../offerConstants.js';

const buildPagedUrl = (endpoint, page, size) => `${endpoint}?page=${page}&size=${size}`;

export const offerService = {
  create: async (payload) => {
    return post(API_ENDPOINTS.OFFERS.CREATE, payload);
  },
  listMade: async (page = OFFER_DEFAULTS.PAGE, size = OFFER_DEFAULTS.PAGE_SIZE) => {
    return get(buildPagedUrl(API_ENDPOINTS.OFFERS.MADE, page, size));
  },
  listReceived: async (page = OFFER_DEFAULTS.PAGE, size = OFFER_DEFAULTS.PAGE_SIZE) => {
    return get(buildPagedUrl(API_ENDPOINTS.OFFERS.RECEIVED, page, size));
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

