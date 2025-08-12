/**
 * Central export file for all DTOs
 */

// Authentication DTOs
export * from './auth';

// User DTOs
export * from './users';

// Listing DTOs
export * from './listings';

// Vehicle DTOs
export * from './vehicles';

// Payment DTOs
export * from './payments';

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