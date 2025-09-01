import { get, post, put } from '../../common/services/api/request.js';
import { API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';
import { createClothingCreateRequest, createClothingUpdateRequest, createClothingFilterRequest } from '../clothing.js';

export const clothingService = {
  // Create a new clothing listing
  createClothingListing: async (clothingData) => {
    const createData = createClothingCreateRequest(clothingData);
    // Debug: inspect payload
    if (import.meta && import.meta.env && import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log('[clothingService.createClothingListing] payload', createData);
    }
    return post(API_ENDPOINTS.CLOTHING.CREATE, createData);
  },

  // Update an existing clothing listing
  updateClothingListing: async (id, clothingData) => {
    const updateData = createClothingUpdateRequest(clothingData);
    if (import.meta && import.meta.env && import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log('[clothingService.updateClothingListing] payload', { id, updateData });
    }
    return put(API_ENDPOINTS.CLOTHING.UPDATE(id), updateData);
  },

  // Get clothing details by ID
  getClothingDetails: async (id) => get(API_ENDPOINTS.CLOTHING.BY_ID(id)),

  // Find clothing by brand and type
  findByBrandAndClothingType: async (brand, clothingType) => get(API_ENDPOINTS.CLOTHING.BY_BRAND_TYPE(brand, clothingType)),

  // Filter clothing listings
  filterClothing: async (filters) => {
    const filterData = createClothingFilterRequest(filters);
    return post(API_ENDPOINTS.CLOTHING.FILTER, filterData);
  },

};
