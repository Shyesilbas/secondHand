import { get } from './api/request.js';
import { API_ENDPOINTS } from '../constants/apiEndpoints.js';

export const enumService = {
  getAllEnums: async () => get(API_ENDPOINTS.ENUMS.ALL),
};