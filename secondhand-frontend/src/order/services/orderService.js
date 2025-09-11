import { API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';
import { get, post } from '../../common/services/api/request.js';

export const orderService = {
  checkout: async (payload) => {
    return post(API_ENDPOINTS.ORDERS.CHECKOUT, payload);
  },
  myOrders: async (page = 0, size = 10) => {
    return get(`${API_ENDPOINTS.ORDERS.MY_ORDERS}?page=${page}&size=${size}`);
  },
  getByOrderNumber: async (orderNumber) => {
    return get(API_ENDPOINTS.ORDERS.BY_ORDER_NUMBER(orderNumber));
  },
  getById: async (id) => {
    return get(API_ENDPOINTS.ORDERS.BY_ID(id));
  },
};


