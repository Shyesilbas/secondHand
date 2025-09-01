import { get, post, put } from '../../common/services/api/request.js';
import { API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';
import { createBooksCreateRequest, createBooksUpdateRequest, createBooksFilterRequest } from '../books.js';

export const booksService = {
  createBooksListing: async (data) => {
    const payload = createBooksCreateRequest(data);
    return post(API_ENDPOINTS.BOOKS.CREATE, payload);
  },
  updateBooksListing: async (id, data) => {
    const payload = createBooksUpdateRequest(data);
    return put(API_ENDPOINTS.BOOKS.UPDATE(id), payload);
  },
  getBooksDetails: async (id) => get(API_ENDPOINTS.BOOKS.BY_ID(id)),
  filterBooks: async (filters) => {
    const payload = createBooksFilterRequest(filters);
    return post(API_ENDPOINTS.BOOKS.FILTER, payload);
  },
};


