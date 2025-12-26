import { API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';
import { get, post } from '../../common/services/api/request.js';

export const orderService = {
  checkout: async (payload) => {
    return post(API_ENDPOINTS.ORDERS.CHECKOUT, payload);
  },
  initiatePaymentVerification: async (payload) => {
    return post(API_ENDPOINTS.PAYMENTS.INITIATE_VERIFICATION, payload);
  },
  myOrders: async (page = 0, size = 10, sort = null, direction = 'desc') => {
    let url = `${API_ENDPOINTS.ORDERS.LIST_MY_ORDERS}?page=${page}&size=${size}`;
    if (sort) {
      url += `&sort=${sort},${direction}`;
    }
    return get(url);
  },
  getByOrderNumber: async (orderNumber) => {
    return get(API_ENDPOINTS.ORDERS.GET_BY_ORDER_NUMBER(orderNumber));
  },
  getById: async (id) => {
    return get(API_ENDPOINTS.ORDERS.GET_ORDER_DETAILS(id));
  },
};


