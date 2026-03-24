import {del, get, post, put} from '../../common/services/api/request.js';
import {API_ENDPOINTS} from '../../common/constants/apiEndpoints.js';
import {LISTING_TYPES} from '../types/index.js';
import { LISTING_DEFAULTS } from '../types/index.js';
import {filterConfigs} from '../filters/filterConfigs.js';
import {getMinKey, getMaxKey} from '../filters/filterRangeKeys.js';

const toInt = (value) => {
  if (value === null || value === undefined || value === '' || value === 0 || value === '0') return null;
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : null;
};

const toText = (value) => {
  const t = String(value ?? '').trim();
  return t || null;
};

const ensureArray = (value) => (Array.isArray(value) ? value : []);

const serializeFilters = (filters, config, listingType) => {
  const typeUpper = String(listingType || '').toUpperCase();

  const payload = {
    listingType: typeUpper,
    type: typeUpper,
    status: filters.status || LISTING_DEFAULTS.STATUS,
    page: parseInt(filters.page) || LISTING_DEFAULTS.PAGE,
    size: parseInt(filters.size) || LISTING_DEFAULTS.SERVICE_FILTER_PAGE_SIZE,
    sortBy: filters.sortBy || LISTING_DEFAULTS.SORT_BY,
    sortDirection: filters.sortDirection || LISTING_DEFAULTS.SORT_DIRECTION,
    city: filters.city?.trim() || null,
    district: filters.district?.trim() || null,
    minPrice: filters.minPrice ? parseFloat(filters.minPrice) : null,
    maxPrice: filters.maxPrice ? parseFloat(filters.maxPrice) : null,
    currency: filters.currency || null,
  };

  const fields = config?.getFields?.() || [];

  fields.forEach((field) => {
    if (!field?.key) return;

    if (field.type === 'enum') {
      if (field.multiple === false) {
        const v = filters[field.key];
        const value = Array.isArray(v) ? (v[0] ?? null) : (v ?? null);
        payload[field.key] = value === '' ? null : value;
      } else {
        const arr = ensureArray(filters[field.key]);
        payload[field.key] = arr.length ? arr : null;
      }
      return;
    }

    if (field.type === 'numericRange') {
      const minKey = getMinKey(field.key);
      const maxKey = getMaxKey(field.key);
      // mileage: backend only accepts maxMileage
      if (field.key === 'mileage') { payload.maxMileage = toInt(filters[maxKey]); return; }
      // floor: single value, use max if present
      if (field.key === 'floor') { payload.floor = toInt(filters[maxKey] ?? filters[minKey]); return; }
      payload[minKey] = toInt(filters[minKey]);
      payload[maxKey] = toInt(filters[maxKey]);
      return;
    }

    if (field.type === 'dateRange') {
      const minKey = getMinKey(field.key);
      const maxKey = getMaxKey(field.key);
      payload[minKey] = toText(filters[minKey]);
      payload[maxKey] = toText(filters[maxKey]);
      return;
    }

    if (field.type === 'text') {
      payload[field.key] = toText(filters[field.key]);
    }
  });

  return payload;
};

export const listingService = {

  getMyListings: async (page = 0, size = LISTING_DEFAULTS.FILTER_PAGE_SIZE, listingType = null) => {
    let url = `${API_ENDPOINTS.LISTINGS.MY_LISTINGS}?page=${page}&size=${size}`;
    if (listingType) {
      url += `&listingType=${encodeURIComponent(listingType)}`;
    }
    return get(url);
  },
  getMyListingsByStatus: async (status, page = 0, size = LISTING_DEFAULTS.SERVICE_FILTER_PAGE_SIZE) => {
    const url = `${API_ENDPOINTS.LISTINGS.MY_LISTINGS}/status/${status}?page=${page}&size=${size}`;
    return get(url);
  },
  
  globalSearch: async (query, page = 0, size = 8) => {
    return get(`${API_ENDPOINTS.LISTINGS.SEARCH}?query=${encodeURIComponent(query)}&page=${page}&size=${size}`);
  },
  getListingById: async (id) => {
    return get(API_ENDPOINTS.LISTINGS.BY_ID(id));
  },

  getListingByUserId: async (userId, page = 0, size = LISTING_DEFAULTS.FILTER_PAGE_SIZE) => {
    return get(`${API_ENDPOINTS.LISTINGS.BY_USER(userId)}?page=${page}&size=${size}`);
  },
  getListingByNo: async (no) => {
    return get(API_ENDPOINTS.LISTINGS.BY_LISTING_NO(no));
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
  updateQuantity: async (id, quantity) => {
    return put(API_ENDPOINTS.LISTINGS.UPDATE_QUANTITY(id), { quantity });
  },
  updatePrice: async (id, price) => {
    return put(API_ENDPOINTS.LISTINGS.UPDATE_PRICE(id), { price });
  },
  updateBatchQuantity: async (listingIds, quantity) => put(API_ENDPOINTS.LISTINGS.UPDATE_QUANTITY_BATCH, { listingIds, quantity }),
  updateBatchPrice: async (listingIds, price) => put(API_ENDPOINTS.LISTINGS.UPDATE_PRICE_BATCH, { listingIds, price }),
  deleteListing: async (id) => {
    return del(API_ENDPOINTS.LISTINGS.DELETE(id));
  },
  getListingStatistics: async () => {
    return get(API_ENDPOINTS.LISTINGS.STATISTICS);
  },

  filterListings: async (filters) => {
    const listingType = String(filters.listingType || filters.type || '').trim().toUpperCase();
    if (!listingType || !Object.values(LISTING_TYPES).includes(listingType)) {
      return {
        content: [],
        totalPages: 0,
        totalElements: 0,
        number: 0,
        size: filters.size || LISTING_DEFAULTS.FILTER_PAGE_SIZE,
        first: true,
        last: true,
        empty: true
      };
    }

    const config = filterConfigs[listingType];
    const payload = serializeFilters({ ...filters, listingType, type: listingType }, config, listingType);

    return post(API_ENDPOINTS.LISTINGS.FILTER, payload);
  }
};
