
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
