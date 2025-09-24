import { get, post, put } from '../../common/services/api/request.js';
import { API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';
import { createRealEstateCreateRequest, createRealEstateUpdateRequest } from '../realEstates.js';

export const realEstateService = {
    createRealEstateListing: async (realEstateData) => {
    const createData = createRealEstateCreateRequest(realEstateData);
        if (import.meta && import.meta.env && import.meta.env.DEV) {
            console.log('[realEstateService.createRealEstateListing] payload', createData);
    }
    return post(API_ENDPOINTS.REAL_ESTATES.CREATE, createData);
  },

    updateRealEstateListing: async (id, realEstateData) => {
    const updateData = createRealEstateUpdateRequest(realEstateData);
    if (import.meta && import.meta.env && import.meta.env.DEV) {
            console.log('[realEstateService.updateRealEstateListing] payload', { id, updateData });
    }
    return put(API_ENDPOINTS.REAL_ESTATES.UPDATE(id), updateData);
  },

    getRealEstateById: async (id) => get(API_ENDPOINTS.REAL_ESTATES.BY_ID(id)),

    filterRealEstates: async (filters) => {
    if (import.meta && import.meta.env && import.meta.env.DEV) {
            console.log('[realEstateService.filterRealEstates] filters', filters);
    }
    return post(API_ENDPOINTS.REAL_ESTATES.FILTER, filters);
  },
};
