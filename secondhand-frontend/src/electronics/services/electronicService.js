import { get, post, put } from '../../common/services/api/request.js';
import { API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';
import { createElectronicCreateRequest, createElectronicUpdateRequest } from '../electronics.js';

export const electronicService = {
  createElectronicListing: async (data) => {
    const payload = createElectronicCreateRequest(data);
    return post(API_ENDPOINTS.ELECTRONICS.CREATE, payload);
  },

  updateElectronicListing: async (id, data) => {
    const payload = createElectronicUpdateRequest(data);
    return put(API_ENDPOINTS.ELECTRONICS.UPDATE(id), payload);
  },

  getElectronicById: async (id) => get(API_ENDPOINTS.ELECTRONICS.BY_ID(id)),

  findByElectronicType: async (electronicType) => get(API_ENDPOINTS.ELECTRONICS.BY_TYPE(electronicType)),
};


