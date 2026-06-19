import { get, post, put } from '../../common/services/api/request.js';
import { API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';
import { createRealEstateCreateRequest, createRealEstateUpdateRequest } from '../realEstates.js';

export const realEstateService = {
    createRealEstateListing: async (realEstateData) => {
    const createData = createRealEstateCreateRequest(realEstateData);
    return post(API_ENDPOINTS.REAL_ESTATES.CREATE, createData);
  },

    updateRealEstateListing: async (id, realEstateData) => {
    const updateData = createRealEstateUpdateRequest(realEstateData);
    return put(API_ENDPOINTS.REAL_ESTATES.UPDATE(id), updateData);
  },

    getRealEstateById: async (id) => get(API_ENDPOINTS.REAL_ESTATES.BY_ID(id)),

    filterRealEstates: async (filters) => {
    return post(API_ENDPOINTS.REAL_ESTATES.FILTER, filters);
  },
};
