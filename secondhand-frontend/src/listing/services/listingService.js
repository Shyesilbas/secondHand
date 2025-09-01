import { get, post, put, del } from '../../services/api/request';
import { API_ENDPOINTS } from '../../constants/apiEndpoints';
import {
  createVehicleFilterRequest, 
  createElectronicsFilterRequest,
  createRealEstateFilterRequest
} from '../listings.js';
import { createClothingFilterRequest } from '../../types/clothing';
import { createBooksFilterRequest } from '../../types/books';
import { createSportsFilterRequest } from '../../types/sports';

export const listingService = {

  getMyListingsByStatus: async (status) => get(API_ENDPOINTS.LISTINGS.BY_STATUS(status)),

  getListingById: async (id) => get(API_ENDPOINTS.LISTINGS.BY_ID(id)),

  getListingByNo: async (listingNo) => get(API_ENDPOINTS.LISTINGS.BY_LISTING_NO(listingNo)),

  getMyListings: async () => get(API_ENDPOINTS.LISTINGS.MY_LISTINGS),

  activateListing: async (id) => put(API_ENDPOINTS.LISTINGS.ACTIVATE(id)),

  markListingSold: async (id) => put(API_ENDPOINTS.LISTINGS.MARK_SOLD(id)),

  deactivateListing: async (id) => put(API_ENDPOINTS.LISTINGS.DEACTIVATE(id)),

  getListingStatistics: async () => get(API_ENDPOINTS.LISTINGS.STATISTICS),

  deleteListing: async (id) => del(API_ENDPOINTS.LISTINGS.DELETE(id)),


  filterVehicles: async (filters) => {
    const filterData = createVehicleFilterRequest(filters);
    return post(API_ENDPOINTS.VEHICLES.FILTER, filterData);
  },

  // Electronics-specific filtering
  filterElectronics: async (filters) => {
    const filterData = createElectronicsFilterRequest(filters);
    return post(API_ENDPOINTS.ELECTRONICS.FILTER, filterData);
  },

  // Real Estate-specific filtering
  filterRealEstates: async (filters) => {
    const filterData = createRealEstateFilterRequest(filters);
    return post(API_ENDPOINTS.REAL_ESTATES.FILTER, filterData);
  },

  // Clothing-specific filtering
  filterClothing: async (filters) => {
    const filterData = createClothingFilterRequest(filters);
    return post(API_ENDPOINTS.CLOTHING.FILTER, filterData);

  },

  // Books-specific filtering
  filterBooks: async (filters) => {
    const filterData = createBooksFilterRequest(filters);
    return post(API_ENDPOINTS.BOOKS.FILTER, filterData);
  },

  // Sports-specific filtering
  filterSports: async (filters) => {
    const filterData = createSportsFilterRequest(filters);
    return post(API_ENDPOINTS.SPORTS.FILTER, filterData);
  },

  // Smart filtering - automatically chooses the right endpoint based on listing type
  filterListings: async (filters) => {
    const listingType = filters.listingType?.toUpperCase();
    
    switch (listingType) {
      case 'VEHICLE':
        return listingService.filterVehicles(filters);
      case 'ELECTRONICS':
        return listingService.filterElectronics(filters);
      case 'REAL_ESTATE':
        return listingService.filterRealEstates(filters);
      case 'CLOTHING':
        return listingService.filterClothing(filters);
      case 'BOOKS':
        return listingService.filterBooks(filters);
      case 'SPORTS':
        return listingService.filterSports(filters);
      default:
        return {
          content: [],
          totalPages: 0,
          totalElements: 0,
          number: 0,
          size: filters.size || 20,
          first: true,
          last: true,
          empty: true
        };
    }
  },

  // Count operations for different types
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
};