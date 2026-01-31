
export * from '../auth/auth.js';

export * from '../user/users.js';

export * from '../listing/listings.js';

export * from '../vehicle/vehicles.js';

export * from '../electronics/electronics.js';

export * from '../payments/paymentSchema.js';

export * from '../favorites/favorites.js';

export const ApiResponse = {
  success: false,
  message: '',
  data: null,
  errors: [],
};

export const PaginatedResponse = {
  content: [],
  totalElements: 0,
  totalPages: 0,
  number: 0,
  size: 0,
  first: false,
  last: false,
  numberOfElements: 0,
  empty: true,
};

export const ErrorResponse = {
  timestamp: '',
  status: 0,
  error: '',
  message: '',
  path: '',
};