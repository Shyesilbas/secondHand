import { get, post, put } from '../../common/services/api/request.js';
import { API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';
import { createClothingCreateRequest, createClothingUpdateRequest, createClothingFilterRequest } from '../clothing.js';

export const clothingService = {
    createClothingListing: async (clothingData) => {
    const createData = createClothingCreateRequest(clothingData);
        if (import.meta && import.meta.env && import.meta.env.DEV) {
    }
    return post(API_ENDPOINTS.CLOTHING.CREATE, createData);
  },

    updateClothingListing: async (id, clothingData) => {
    const updateData = createClothingUpdateRequest(clothingData);
    if (import.meta && import.meta.env && import.meta.env.DEV) {
    }
    return put(API_ENDPOINTS.CLOTHING.UPDATE(id), updateData);
  },

    getClothingDetails: async (id) => get(API_ENDPOINTS.CLOTHING.BY_ID(id)),

    findByBrandAndClothingType: async (brandId, clothingTypeId) => get(API_ENDPOINTS.CLOTHING.BY_BRAND_TYPE(brandId, clothingTypeId)),

    filterClothing: async (filters) => {
    const filterData = createClothingFilterRequest(filters);
    return post(API_ENDPOINTS.CLOTHING.FILTER, filterData);
  },

};
