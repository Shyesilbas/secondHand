
export const LISTING_TYPES = {
  VEHICLE: 'VEHICLE',
  ELECTRONICS: 'ELECTRONICS', 
  REAL_ESTATE: 'REAL_ESTATE',
  CLOTHING: 'CLOTHING',
  BOOKS: 'BOOKS',
  SPORTS: 'SPORTS',
};

export const LISTING_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE', 
  SOLD: 'SOLD',
  PENDING: 'PENDING',
  DRAFT: 'DRAFT',
};

export const CURRENCY_TYPES = {
  TRY: 'TRY',
  USD: 'USD',
  EUR: 'EUR',
};

export const SORT_DIRECTIONS = {
  ASC: 'ASC',
  DESC: 'DESC',
};

export const SORT_FIELDS = {
  CREATED_AT: 'createdAt',
  UPDATED_AT: 'updatedAt',
  PRICE: 'price',
  TITLE: 'title',
  YEAR: 'year',
  MILEAGE: 'mileage',
  BRAND: 'brand',
};

export const DEFAULT_PAGE_SIZE = 20;
export const DEFAULT_PAGE = 0;

export const createBaseListingDTO = () => ({
  id: '',
  listingNo: '',
  title: '',
  description: '',
  price: 0,
  currency: CURRENCY_TYPES.TRY,
  status: LISTING_STATUS.ACTIVE,
  city: '',
  district: '',
  sellerName: '',
  sellerSurname: '',
  sellerId: 0,
  type: '',
  createdAt: '',
  updatedAt: '',
});

export const createBaseFilterDTO = (listingType = null) => ({
  type: listingType,
  listingType: listingType,
  status: LISTING_STATUS.ACTIVE,
  city: '',
  district: '',
  minPrice: null,
  maxPrice: null,
  currency: '',
  sortBy: SORT_FIELDS.CREATED_AT,
  sortDirection: SORT_DIRECTIONS.DESC,
  page: DEFAULT_PAGE,
  size: DEFAULT_PAGE_SIZE,
});

export const isValidListingType = (type) => {
  return Object.values(LISTING_TYPES).includes(type);
};

export const isValidStatus = (status) => {
  return Object.values(LISTING_STATUS).includes(status);
};

export const isValidCurrency = (currency) => {
  return Object.values(CURRENCY_TYPES).includes(currency);
};

export const ERROR_MESSAGES = {
  LISTING_NOT_FOUND: 'Listing not found',
  INVALID_LISTING_TYPE: 'Invalid listing type',
  INVALID_DATA: 'Invalid data provided',
  NETWORK_ERROR: 'Network error occurred',
  PERMISSION_DENIED: 'Permission denied',
  FORM_VALIDATION_ERROR: 'Please check the form fields',
};

export const SUCCESS_MESSAGES = {
  LISTING_CREATED: 'Listing created successfully',
  LISTING_UPDATED: 'Listing updated successfully',
  LISTING_DELETED: 'Listing deleted successfully',
  LISTING_ACTIVATED: 'Listing activated successfully',
  LISTING_DEACTIVATED: 'Listing deactivated successfully',
  LISTING_MARKED_SOLD: 'Listing marked as sold',
};
