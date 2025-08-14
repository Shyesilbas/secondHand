import { get, post, put } from '../../../services/api/request';
import { API_ENDPOINTS } from '../../../constants/apiEndpoints';
import { createElectronicCreateRequest, createElectronicUpdateRequest } from '../../../types/electronics';

export const electronicService = {
  createElectronicListing: async (data) => {
    const payload = createElectronicCreateRequest(data);
    if (import.meta && import.meta.env && import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log('[electronicService.createElectronicListing] payload', payload);
    }
    return post(API_ENDPOINTS.ELECTRONICS.CREATE, payload);
  },

  updateElectronicListing: async (id, data) => {
    const payload = createElectronicUpdateRequest(data);
    if (import.meta && import.meta.env && import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log('[electronicService.updateElectronicListing] payload', { id, payload });
    }
    return put(API_ENDPOINTS.ELECTRONICS.UPDATE(id), payload);
  },

  getElectronicById: async (id) => get(API_ENDPOINTS.ELECTRONICS.BY_ID(id)),

  findByElectronicType: async (electronicType) => get(API_ENDPOINTS.ELECTRONICS.BY_TYPE(electronicType)),
};


