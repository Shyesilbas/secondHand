import { get, post, put, del } from '../../common/services/api/request.js';
import { API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';
import {
  createVehicleFilterRequest,
  createElectronicsFilterRequest,
  createRealEstateFilterRequest
} from '../listings.js';
import { createClothingFilterRequest } from '../../clothing/clothing.js';
import { createBooksFilterRequest } from '../../books/books.js';
import { createSportsFilterRequest } from '../../sports/sports.js';
import {
  LISTING_TYPES,
  ERROR_MESSAGES,
  createBaseFilterDTO
} from '../types/index.js';

const createEmptyResponse = (filters) => ({
  content: [],
  totalPages: 0,
  totalElements: 0,
  number: 0,
  size: filters.size || 20,
  first: true,
  last: true,
  empty: true
});

const withErrorHandling = async (operation, errorMessage) => {
  try {
    return await operation();
  } catch (error) {
    console.error(errorMessage, error);
    throw error;
  }
};

export const listingService = {
  getMyListingsByStatus: async (status) =>
      withErrorHandling(
          () => get(API_ENDPOINTS.LISTINGS.BY_STATUS(status)),
          `Error fetching listings by status: ${status}`
      ),

  getListingById: async (id) => {
    if (!id) throw new Error(ERROR_MESSAGES.INVALID_DATA);
    return withErrorHandling(
        () => get(API_ENDPOINTS.LISTINGS.BY_ID(id)),
        `Error fetching listing by id: ${id}`
    );
  },

  getListingByNo: async (listingNo) => {
    if (!listingNo) throw new Error(ERROR_MESSAGES.INVALID_DATA);
    return withErrorHandling(
        () => get(API_ENDPOINTS.LISTINGS.BY_LISTING_NO(listingNo)),
        `Error fetching listing by number: ${listingNo}`
    );
  },

  getMyListings: async () =>
      withErrorHandling(
          () => get(API_ENDPOINTS.LISTINGS.MY_LISTINGS),
          'Error fetching user listings'
      ),

  activateListing: async (id) => put(API_ENDPOINTS.LISTINGS.ACTIVATE(id)),
  markListingSold: async (id) => put(API_ENDPOINTS.LISTINGS.MARK_SOLD(id)),
  deactivateListing: async (id) => put(API_ENDPOINTS.LISTINGS.DEACTIVATE(id)),

  getListingStatistics: async () => get(API_ENDPOINTS.LISTINGS.STATISTICS),
  getUserListings: async (userId) => get(API_ENDPOINTS.LISTINGS.BY_USER(userId)),
  deleteListing: async (id) => del(API_ENDPOINTS.LISTINGS.DELETE(id)),

  updateVehicle: async (id, data) => {
    if (!id) throw new Error(ERROR_MESSAGES.INVALID_DATA);
    return withErrorHandling(
        () => put(API_ENDPOINTS.VEHICLES.UPDATE(id), data),
        `Error updating vehicle listing: ${id}`
    );
  },

  updateElectronics: async (id, data) => {
    if (!id) throw new Error(ERROR_MESSAGES.INVALID_DATA);
    return withErrorHandling(
        () => put(API_ENDPOINTS.ELECTRONICS.UPDATE(id), data),
        `Error updating electronics listing: ${id}`
    );
  },

  updateRealEstate: async (id, data) => {
    if (!id) throw new Error(ERROR_MESSAGES.INVALID_DATA);
    return withErrorHandling(
        () => put(API_ENDPOINTS.REAL_ESTATES.UPDATE(id), data),
        `Error updating real estate listing: ${id}`
    );
  },

  updateClothing: async (id, data) => {
    if (!id) throw new Error(ERROR_MESSAGES.INVALID_DATA);
    return withErrorHandling(
        () => put(API_ENDPOINTS.CLOTHING.UPDATE(id), data),
        `Error updating clothing listing: ${id}`
    );
  },

  updateBooks: async (id, data) => {
    if (!id) throw new Error(ERROR_MESSAGES.INVALID_DATA);
    return withErrorHandling(
        () => put(API_ENDPOINTS.BOOKS.UPDATE(id), data),
        `Error updating books listing: ${id}`
    );
  },

  updateSports: async (id, data) => {
    if (!id) throw new Error(ERROR_MESSAGES.INVALID_DATA);
    return withErrorHandling(
        () => put(API_ENDPOINTS.SPORTS.UPDATE(id), data),
        `Error updating sports listing: ${id}`
    );
  },

  filterVehicles: async (filters) => {
    const filterData = createVehicleFilterRequest(filters);
    return post(API_ENDPOINTS.VEHICLES.FILTER, filterData);
  },

  filterElectronics: async (filters) => {
    const filterData = createElectronicsFilterRequest(filters);
    return post(API_ENDPOINTS.ELECTRONICS.FILTER, filterData);
  },

  filterRealEstates: async (filters) => {
    const filterData = createRealEstateFilterRequest(filters);
    return post(API_ENDPOINTS.REAL_ESTATES.FILTER, filterData);
  },

  filterClothing: async (filters) => {
    const filterData = createClothingFilterRequest(filters);
    return post(API_ENDPOINTS.CLOTHING.FILTER, filterData);
  },

  filterBooks: async (filters) => {
    const filterData = createBooksFilterRequest(filters);
    return post(API_ENDPOINTS.BOOKS.FILTER, filterData);
  },

  filterSports: async (filters) => {
    const filterData = createSportsFilterRequest(filters);
    return post(API_ENDPOINTS.SPORTS.FILTER, filterData);
  },

  filterListings: async (filters) => {
    try {
      const listingType = filters.listingType?.toUpperCase();
      if (!listingType || !Object.values(LISTING_TYPES).includes(listingType)) {
        console.warn(`Invalid listing type: ${listingType}`);
        return createEmptyResponse(filters);
      }

      switch (listingType) {
        case LISTING_TYPES.VEHICLE:
          return await listingService.filterVehicles(filters);
        case LISTING_TYPES.ELECTRONICS:
          return await listingService.filterElectronics(filters);
        case LISTING_TYPES.REAL_ESTATE:
          return await listingService.filterRealEstates(filters);
        case LISTING_TYPES.CLOTHING:
          return await listingService.filterClothing(filters);
        case LISTING_TYPES.BOOKS:
          return await listingService.filterBooks(filters);
        case LISTING_TYPES.SPORTS:
          return await listingService.filterSports(filters);
        default:
          return createEmptyResponse(filters);
      }
    } catch (error) {
      console.error('Error in filterListings:', error);
      throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
    }
  },

  getCountsForTypes: async (types) => {
    if (!Array.isArray(types) || types.length === 0) return {};

    const results = await Promise.all(types.map((type) => {
      const filters = { listingType: type, status: 'ACTIVE', page: 0, size: 1 };
      return listingService.filterListings(filters)
          .then(res => res?.totalElements || 0)
          .catch(() => 0);
    }));

    return types.reduce((acc, type, idx) => {
      acc[type] = results[idx];
      return acc;
    }, {});
  },

  // ✅ Genel update method
  updateListing: async (id, data) => {
    if (!id || !data?.type) throw new Error(ERROR_MESSAGES.INVALID_DATA);

    return withErrorHandling(async () => {
      switch (data.type.toUpperCase()) {
        case LISTING_TYPES.VEHICLE:
          return listingService.updateVehicle(id, data);
        case LISTING_TYPES.ELECTRONICS:
          return listingService.updateElectronics(id, data);
        case LISTING_TYPES.REAL_ESTATE:
          return listingService.updateRealEstate(id, data);
        case LISTING_TYPES.CLOTHING:
          return listingService.updateClothing(id, data);
        case LISTING_TYPES.BOOKS:
          return listingService.updateBooks(id, data);
        case LISTING_TYPES.SPORTS:
          return listingService.updateSports(id, data);
        default:
          throw new Error(`Unsupported listing type: ${data.type}`);
      }
    }, `Error updating listing with id: ${id}`);
  },
};
