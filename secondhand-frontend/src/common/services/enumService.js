import { get } from './api/request.js';
import { API_ENDPOINTS } from '../constants/apiEndpoints.js';

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

  // Books
  getBookGenres: async () => get(API_ENDPOINTS.ENUMS.BOOK_GENRES),
  getBookLanguages: async () => get(API_ENDPOINTS.ENUMS.BOOK_LANGUAGES),
  getBookFormats: async () => get(API_ENDPOINTS.ENUMS.BOOK_FORMATS),
  getBookConditions: async () => get(API_ENDPOINTS.ENUMS.BOOK_CONDITIONS),

  // Users
  getGenders: async () => get(API_ENDPOINTS.ENUMS.GENDERS),

  // Sports
  getSportDisciplines: async () => get(API_ENDPOINTS.ENUMS.SPORT_DISCIPLINES),
  getSportEquipmentTypes: async () => get(API_ENDPOINTS.ENUMS.SPORT_EQUIPMENT_TYPES),
  getSportConditions: async () => get(API_ENDPOINTS.ENUMS.SPORT_CONDITIONS),

  // Payments / Orders / Emails
  getPaymentTypes: async () => get(API_ENDPOINTS.ENUMS.PAYMENT_TYPES),
  getShippingStatuses: async () => get(API_ENDPOINTS.ENUMS.SHIPPING_STATUSES),
  getEmailTypes: async () => get(API_ENDPOINTS.ENUMS.EMAIL_TYPES),
};