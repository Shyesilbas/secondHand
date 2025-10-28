import {get, post, put, del } from '../../common/services/api/request.js';
import { API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';
import { LISTING_TYPES } from '../types/index.js';

const withErrorHandling = async (operation, errorMessage) => {
  try {
    return await operation();
  } catch (error) {
    console.error(errorMessage, error);
    throw error;
  }
};



const createFilterPayload = (filters, listingType) => {
  const typeUpper = listingType.toUpperCase();

  const payload = {
    listingType: typeUpper,
    type: typeUpper,
    status: filters.status || 'ACTIVE',
    page: parseInt(filters.page) || 0,
    size: parseInt(filters.size) || 20,
    sortBy: filters.sortBy || 'createdAt',
    sortDirection: filters.sortDirection || 'DESC',
    city: filters.city?.trim() || '',
    district: filters.district?.trim() || '',
    minPrice: filters.minPrice ? parseFloat(filters.minPrice) : null,
    maxPrice: filters.maxPrice ? parseFloat(filters.maxPrice) : null,
    currency: filters.currency || null,
  };

  switch (typeUpper) {
    case LISTING_TYPES.VEHICLE:
      payload.brands = Array.isArray(filters.brands) ? filters.brands : [];
      payload.minYear = filters.minYear ? parseInt(filters.minYear) : null;
      payload.maxYear = filters.maxYear ? parseInt(filters.maxYear) : null;
      payload.maxMileage = filters.maxMileage ? parseInt(filters.maxMileage) : null;
      payload.fuelTypes = Array.isArray(filters.fuelTypes) ? filters.fuelTypes : [];
      payload.colors = Array.isArray(filters.colors) ? filters.colors : [];
      payload.doors = filters.doors || null;
      payload.gearTypes = Array.isArray(filters.gearTypes) ? filters.gearTypes : [];
      payload.seatCounts = Array.isArray(filters.seatCounts) ? filters.seatCounts : [];
      break;

    case LISTING_TYPES.ELECTRONICS:
      payload.electronicTypes = Array.isArray(filters.electronicTypes) ? filters.electronicTypes : [];
      payload.electronicBrands = Array.isArray(filters.electronicBrands) ? filters.electronicBrands : [];
      payload.brands = Array.isArray(filters.brands) ? filters.brands : [];
      payload.minYear = filters.minYear ? parseInt(filters.minYear) : null;
      payload.maxYear = filters.maxYear ? parseInt(filters.maxYear) : null;
      payload.colors = Array.isArray(filters.colors) ? filters.colors : [];
      payload.minRam = filters.minRam ? parseInt(filters.minRam) : null;
      payload.maxRam = filters.maxRam ? parseInt(filters.maxRam) : null;
      payload.minStorage = filters.minStorage ? parseInt(filters.minStorage) : null;
      payload.maxStorage = filters.maxStorage ? parseInt(filters.maxStorage) : null;
      payload.processors = Array.isArray(filters.processors) ? filters.processors : [];
      payload.minScreenSize = filters.minScreenSize ? parseInt(filters.minScreenSize) : null;
      payload.maxScreenSize = filters.maxScreenSize ? parseInt(filters.maxScreenSize) : null;
      break;

    case LISTING_TYPES.REAL_ESTATE:
      payload.realEstateTypes = Array.isArray(filters.realEstateTypes) ? filters.realEstateTypes : [];
      payload.adTypes = Array.isArray(filters.adTypes) ? filters.adTypes : [];
      break;

    case LISTING_TYPES.CLOTHING:
      payload.brands = Array.isArray(filters.brands) ? filters.brands : [];
      payload.types = Array.isArray(filters.types) ? filters.types : [];
      payload.conditions = Array.isArray(filters.conditions) ? filters.conditions : [];
      break;

    case LISTING_TYPES.BOOKS:
      payload.genres = Array.isArray(filters.genres) ? filters.genres : [];
      payload.languages = Array.isArray(filters.languages) ? filters.languages : [];
      payload.formats = Array.isArray(filters.formats) ? filters.formats : [];
      payload.conditions = Array.isArray(filters.conditions) ? filters.conditions : [];
      break;

    case LISTING_TYPES.SPORTS:
      payload.disciplines = Array.isArray(filters.disciplines) ? filters.disciplines : [];
      payload.equipmentTypes = Array.isArray(filters.equipmentTypes) ? filters.equipmentTypes : [];
      payload.conditions = Array.isArray(filters.conditions) ? filters.conditions : [];
      break;

    default:
      console.warn(`Unknown listing type in payload creation: ${typeUpper}`);
  }

  return payload;
};

export const listingService = {

  getMyListings: async (page = 0, size = 10) => {
    return get(`${API_ENDPOINTS.LISTINGS.MY_LISTINGS}?page=${page}&size=${size}`);
  },
  getMyListingsByStatus: async (status) => {
    return get(`${API_ENDPOINTS.LISTINGS.MY_LISTINGS}/status/${status}`);
  },
  
  globalSearch: async (query, page = 0, size = 8) => {
    return get(`${API_ENDPOINTS.LISTINGS.SEARCH}?query=${encodeURIComponent(query)}&page=${page}&size=${size}`);
  },
  getListingById: async (id) => {
    return get(API_ENDPOINTS.LISTINGS.BY_ID(id));
  },
  getListingByUserId: async (userId) => {
    return get(API_ENDPOINTS.LISTINGS.BY_USER(userId));
  },
  getListingByNo: async (no) => {
    return get(API_ENDPOINTS.LISTINGS.BY_LISTING_NO(no));
  },
  getCountsForTypes: async (listingType) => {
    return get(API_ENDPOINTS.LISTINGS.COUNTS_FOR_TYPES(listingType));
  },
  deactivateListing: async (id) => {
    return put(API_ENDPOINTS.LISTINGS.DEACTIVATE(id));
  },
  activateListing: async (id) => {
    return put(API_ENDPOINTS.LISTINGS.ACTIVATE(id));
  },
  markListingSold: async (id) => {
    return put(API_ENDPOINTS.LISTINGS.MARK_SOLD(id));
  },
  deleteListing: async (id) => {
    return del(API_ENDPOINTS.LISTINGS.DELETE(id));
  },
  getListingStatistics: async (listingType) => {
    return get(API_ENDPOINTS.LISTINGS.STATISTICS(listingType));
  },

  filterListings: async (filters) => {
    const listingType = filters.listingType;
    if (!listingType || !Object.values(LISTING_TYPES).includes(listingType.toUpperCase())) {
      console.warn(`Invalid or missing listing type: ${listingType}`);
      return {
        content: [],
        totalPages: 0,
        totalElements: 0,
        number: 0,
        size: filters.size || 10,
        first: true,
        last: true,
        empty: true
      };
    }

    const payload = createFilterPayload(filters, listingType);

    return withErrorHandling(
        () => post(API_ENDPOINTS.LISTINGS.FILTER, payload),
        `Error filtering listings for type: ${listingType}`
    );
  }
};
