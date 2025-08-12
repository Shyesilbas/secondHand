import apiClient from './api/config';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

export const enumService = {
  getListingTypes: async () => {
    const response = await apiClient.get(API_ENDPOINTS.ENUMS.LISTING_TYPES);
    return response.data;
  },

  getListingStatuses: async () => {
    const response = await apiClient.get(API_ENDPOINTS.ENUMS.LISTING_STATUSES);
    return response.data;
  },

  getCarBrands: async () => {
    const response = await apiClient.get(API_ENDPOINTS.ENUMS.CAR_BRANDS);
    return response.data;
  },

  getFuelTypes: async () => {
    const response = await apiClient.get(API_ENDPOINTS.ENUMS.FUEL_TYPES);
    return response.data;
  },

  getColors: async () => {
    const response = await apiClient.get(API_ENDPOINTS.ENUMS.COLORS);
    return response.data;
  },

  getDoors: async () => {
    const response = await apiClient.get(API_ENDPOINTS.ENUMS.DOORS);
    return response.data;
  },

  getCurrencies: async () => {
    const response = await apiClient.get(API_ENDPOINTS.ENUMS.CURRENCIES);
    return response.data;
  },

  getGearTypes: async () => {
    const response = await apiClient.get(API_ENDPOINTS.ENUMS.GEAR_TYPES);
    return response.data;
  },

  getSeatCounts: async () => {
    const response = await apiClient.get(API_ENDPOINTS.ENUMS.SEAT_COUNTS);
    return response.data;
  },
};