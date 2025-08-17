import { get } from './api/request';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

export const enumService = {
  getListingTypes: async () => get(API_ENDPOINTS.ENUMS.LISTING_TYPES),

  getListingStatuses: async () => get(API_ENDPOINTS.ENUMS.LISTING_STATUSES),

  getCarBrands: async () => get(API_ENDPOINTS.ENUMS.CAR_BRANDS),

  getFuelTypes: async () => get(API_ENDPOINTS.ENUMS.FUEL_TYPES),

  getColors: async () => get(API_ENDPOINTS.ENUMS.COLORS),

  getDoors: async () => get(API_ENDPOINTS.ENUMS.DOORS),

  getCurrencies: async () => get(API_ENDPOINTS.ENUMS.CURRENCIES),

  getGearTypes: async () => get(API_ENDPOINTS.ENUMS.GEAR_TYPES),

  getSeatCounts: async () => get(API_ENDPOINTS.ENUMS.SEAT_COUNTS),

  // Electronics enums
  getElectronicTypes: async () => get(API_ENDPOINTS.ENUMS.ELECTRONIC_TYPES),

  getElectronicBrands: async () => get(API_ENDPOINTS.ENUMS.ELECTRONIC_BRANDS),

  // Real Estate enums
  getRealEstateTypes: async () => get(API_ENDPOINTS.ENUMS.REAL_ESTATE_TYPES),

  getRealEstateAdTypes: async () => get(API_ENDPOINTS.ENUMS.REAL_ESTATE_AD_TYPES),

  getHeatingTypes: async () => get(API_ENDPOINTS.ENUMS.HEATING_TYPES),

  getOwnerTypes: async () => get(API_ENDPOINTS.ENUMS.OWNER_TYPES),

  // Clothing enums
  getClothingBrands: async () => get(API_ENDPOINTS.ENUMS.CLOTHING_BRANDS),

  getClothingTypes: async () => get(API_ENDPOINTS.ENUMS.CLOTHING_TYPES),

  getClothingConditions: async () => get(API_ENDPOINTS.ENUMS.CLOTHING_CONDITIONS),
};