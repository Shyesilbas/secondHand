
export const LISTING_TYPES = {
  VEHICLE: 'VEHICLE',
  ELECTRONICS: 'ELECTRONICS', 
  REAL_ESTATE: 'REAL_ESTATE',
  CLOTHING: 'CLOTHING',
  BOOKS: 'BOOKS',
  SPORTS: 'SPORTS',
};

/** Types that cannot be added to cart or receive offers */
export const NON_PURCHASABLE_TYPES = [LISTING_TYPES.REAL_ESTATE, LISTING_TYPES.VEHICLE];

export const LISTING_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE', 
  SOLD: 'SOLD',
  PENDING: 'PENDING',
  DRAFT: 'DRAFT',
};

export const LISTING_STATUSES = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'SOLD', label: 'Sold' },
  { value: 'RESERVED', label: 'Reserved' },
];

// Shared defaults to avoid scattered magic strings across UI and service layers.
export const LISTING_DEFAULTS = Object.freeze({
  STATUS: LISTING_STATUS.ACTIVE,
  SORT_BY: 'createdAt',
  SORT_DIRECTION: 'DESC',
  PAGE: 0,
  // Used by UI filter state (see getDefaultFiltersForType)
  FILTER_PAGE_SIZE: 10,
  // Used by service payload serialization when size is not present
  SERVICE_FILTER_PAGE_SIZE: 20,
  MIN_PRICE: 0,
  MAX_PRICE: 0,
  CURRENCY: '',
  // Mine-mode: "low stock" alert threshold (exclusive upper bound).
  LOW_STOCK_MAX_QUANTITY: 10,
  // Title search: page size for loading all pages in my listings mode.
  SEARCH_MY_PAGE_SIZE: 50,
  // Title search: page size for loading all pages in browse mode.
  SEARCH_FILTER_PAGE_SIZE: 24,
  // Safety cap to avoid excessive sequential requests.
  TITLE_SEARCH_MAX_PAGES: 30,
});

export const LISTING_SORT_FIELDS = Object.freeze({
  DATE: 'createdAt',
  PRICE: 'price',
  YEAR: 'year',
  MILEAGE: 'mileage',
  BRAND: 'brand',
  TYPE: 'type',
});

export const ERROR_MESSAGES = {
  LISTING_NOT_FOUND: 'Listing not found',
  INVALID_LISTING_TYPE: 'Invalid listing type',
  INVALID_DATA: 'Invalid data provided',
  NETWORK_ERROR: 'Network error occurred',
  PERMISSION_DENIED: 'Permission denied',
  FORM_VALIDATION_ERROR: 'Please check the form fields',
};

export const ListingDTO = Object.freeze({
  id: '',
  listingNo: '',
  title: '',
  description: '',
  price: 0,
  currency: '',
  status: '',
  city: '',
  district: '',
  sellerName: '',
  sellerSurname: '',
  sellerId: 0,
  type: '',
  createdAt: '',
  updatedAt: '',
});
