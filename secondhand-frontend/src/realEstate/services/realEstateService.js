import { get, post, put } from '../../common/services/api/request.js';
import { API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';
import { createRealEstateCreateRequest, createRealEstateUpdateRequest } from '../realEstates.js';

export const realEstateService = {
  // Create a new real estate listing
  createRealEstateListing: async (realEstateData) => {
    const createData = createRealEstateCreateRequest(realEstateData);
    // Debug: inspect payload
    if (import.meta && import.meta.env && import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log('[realEstateService.createRealEstateListing] payload', createData);
    }
    return post(API_ENDPOINTS.REAL_ESTATES.CREATE, createData);
  },

  // Update an existing real estate listing
  updateRealEstateListing: async (id, realEstateData) => {
    const updateData = createRealEstateUpdateRequest(realEstateData);
    if (import.meta && import.meta.env && import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log('[realEstateService.updateRealEstateListing] payload', { id, updateData });
    }
    return put(API_ENDPOINTS.REAL_ESTATES.UPDATE(id), updateData);
  },

  // Get real estate details by ID
  getRealEstateById: async (id) => get(API_ENDPOINTS.REAL_ESTATES.BY_ID(id)),

  // Filter real estates with advanced criteria
  filterRealEstates: async (filters) => {
    if (import.meta && import.meta.env && import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log('[realEstateService.filterRealEstates] filters', filters);
    }
    return post(API_ENDPOINTS.REAL_ESTATES.FILTER, filters);
  },
};
