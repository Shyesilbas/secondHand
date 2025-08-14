import { get, post, put, del } from '../../../services/api/request';
import { API_ENDPOINTS } from '../../../constants/apiEndpoints';
import { createListingFilterRequest } from '../../../types/listings';

export const listingService = {
  getAllListings: async () => get(API_ENDPOINTS.LISTINGS.ALL),

  getMyListingsByStatus: async (status) => get(API_ENDPOINTS.LISTINGS.BY_STATUS(status)),

  getListingById: async (id) => get(API_ENDPOINTS.LISTINGS.BY_ID(id)),

  getListingByNo: async (listingNo) => get(API_ENDPOINTS.LISTINGS.BY_LISTING_NO(listingNo)),

  getMyListings: async () => get(API_ENDPOINTS.LISTINGS.MY_LISTINGS),


  activateListing: async (id) => put(API_ENDPOINTS.LISTINGS.ACTIVATE(id)),

  markListingSold: async (id) => put(API_ENDPOINTS.LISTINGS.MARK_SOLD(id)),

  deactivateListing: async (id) => put(API_ENDPOINTS.LISTINGS.DEACTIVATE(id)),

  getListingStatistics: async () => get(API_ENDPOINTS.LISTINGS.STATISTICS),

  deleteListing: async (id) => del(API_ENDPOINTS.LISTINGS.DELETE(id)),


  getActiveListingsByType: async (listingType) => get(API_ENDPOINTS.LISTINGS.BY_TYPE_ACTIVE(listingType)),

  getListingsByTypeOrderByDate: async (listingType) => get(API_ENDPOINTS.LISTINGS.BY_TYPE_ORDERED(listingType)),

  getListingsWithFilters: async (filters) => {
    const filterData = createListingFilterRequest(filters);
    return post(API_ENDPOINTS.LISTINGS.FILTER, filterData);
  },

  getCountsForTypes: async (types) => {
    if (!Array.isArray(types) || types.length === 0) return {};
    const results = await Promise.all(types.map((t) => (
      post(
        API_ENDPOINTS.LISTINGS.FILTER,
        createListingFilterRequest({ listingType: t, status: 'ACTIVE', page: 0, size: 1 })
      ).then(res => res?.totalElements || 0).catch(() => 0)
    )));
    return types.reduce((acc, t, idx) => {
      acc[t] = results[idx];
      return acc;
    }, {});
  }
};