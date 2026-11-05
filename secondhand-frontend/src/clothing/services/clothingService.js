import { get, post, put } from '../../common/services/api/request.js';
import { API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';
import { createClothingCreateRequest, createClothingUpdateRequest } from '../clothing.js';

export const clothingService = {
 createClothingListing: async (clothingData) => {
 const createData = createClothingCreateRequest(clothingData);
 return post(API_ENDPOINTS.CLOTHING.CREATE, createData);
 },

 updateClothingListing: async (id, clothingData) => {
 const updateData = createClothingUpdateRequest(clothingData);
 return put(API_ENDPOINTS.CLOTHING.UPDATE(id), updateData);
 },

 getClothingDetails: async (id) => get(API_ENDPOINTS.CLOTHING.BY_ID(id)),
};
