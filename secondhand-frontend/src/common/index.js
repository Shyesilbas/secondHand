/**
 * Central export file for all DTOs
 */

// Authentication DTOs
export * from '../auth/auth.js';

// User DTOs
export * from '../user/users.js';

// Listing DTOs
export * from '../listing/listings.js';

// Vehicle DTOs
export * from '../vehicle/vehicles.js';

// Electronics DTOs
export * from '../electronics/electronics.js';

// Payment DTOs
export * from '../payments/payments.js';

// Favorites DTOs
export * from '../favorites/favorites.js';

// Common Response Types
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