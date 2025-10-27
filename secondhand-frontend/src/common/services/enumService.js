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

    getElectronicTypes: async () => get(API_ENDPOINTS.ENUMS.ELECTRONIC_TYPES),

  getElectronicBrands: async () => get(API_ENDPOINTS.ENUMS.ELECTRONIC_BRANDS),

    getRealEstateTypes: async () => get(API_ENDPOINTS.ENUMS.REAL_ESTATE_TYPES),

  getRealEstateAdTypes: async () => get(API_ENDPOINTS.ENUMS.REAL_ESTATE_AD_TYPES),

  getHeatingTypes: async () => get(API_ENDPOINTS.ENUMS.HEATING_TYPES),

  getOwnerTypes: async () => get(API_ENDPOINTS.ENUMS.OWNER_TYPES),

    getClothingBrands: async () => get(API_ENDPOINTS.ENUMS.CLOTHING_BRANDS),

  getClothingTypes: async () => get(API_ENDPOINTS.ENUMS.CLOTHING_TYPES),

  getClothingConditions: async () => get(API_ENDPOINTS.ENUMS.CLOTHING_CONDITIONS),

  getClothingGenders: async () => get(API_ENDPOINTS.ENUMS.CLOTHING_GENDERS),

  getClothingCategories: async () => get(API_ENDPOINTS.ENUMS.CLOTHING_CATEGORIES),

    getBookGenres: async () => get(API_ENDPOINTS.ENUMS.BOOK_GENRES),
  getBookLanguages: async () => get(API_ENDPOINTS.ENUMS.BOOK_LANGUAGES),
  getBookFormats: async () => get(API_ENDPOINTS.ENUMS.BOOK_FORMATS),
  getBookConditions: async () => get(API_ENDPOINTS.ENUMS.BOOK_CONDITIONS),

    getGenders: async () => get(API_ENDPOINTS.ENUMS.GENDERS),

    getSportDisciplines: async () => get(API_ENDPOINTS.ENUMS.SPORT_DISCIPLINES),
  getSportEquipmentTypes: async () => get(API_ENDPOINTS.ENUMS.SPORT_EQUIPMENT_TYPES),
  getSportConditions: async () => get(API_ENDPOINTS.ENUMS.SPORT_CONDITIONS),

    getPaymentTypes: async () => get(API_ENDPOINTS.ENUMS.PAYMENT_TYPES),
  getShippingStatuses: async () => get(API_ENDPOINTS.ENUMS.SHIPPING_STATUSES),
  getEmailTypes: async () => get(API_ENDPOINTS.ENUMS.EMAIL_TYPES),

  getAuditEventTypes: async () => get(API_ENDPOINTS.AUDIT_ENUMS.EVENT_TYPES),
  getAuditEventStatuses: async () => get(API_ENDPOINTS.AUDIT_ENUMS.EVENT_STATUSES),

  getListingFeeConfig: async () => get(API_ENDPOINTS.ENUMS.LISTING_FEE_CONFIG),
  getShowcasePricingConfig: async () => get(API_ENDPOINTS.ENUMS.SHOWCASE_PRICING_CONFIG),
  getAgreementGroups: async () => get(API_ENDPOINTS.ENUMS.AGREEMENT_GROUPS),
  getAgreementTypes: async () => get(API_ENDPOINTS.ENUMS.AGREEMENT_TYPES),
};