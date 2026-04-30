import {API_ENDPOINTS} from '../../common/constants/apiEndpoints.js';
import {get, post, put} from '../../common/services/api/request.js';
import { ORDER_DEFAULTS } from '../constants/orderUiConstants.js';

const buildPagedOrdersUrl = (endpoint, page, size, sort, direction) => {
  let url = `${endpoint}?page=${page}&size=${size}`;
  if (sort) {
    url += `&sort=${sort},${direction}`;
  }
  return url;
};

export const orderService = {
  checkout: async (payload) => {
    return post(API_ENDPOINTS.ORDERS.CHECKOUT, payload);
  },
  initiatePaymentVerification: async (payload) => {
    return post(API_ENDPOINTS.PAYMENTS.INITIATE_VERIFICATION, payload);
  },
  myOrders: async (
    page = ORDER_DEFAULTS.INITIAL_PAGE,
    size = ORDER_DEFAULTS.INITIAL_PAGE_SIZE,
    sort = null,
    direction = ORDER_DEFAULTS.SORT_DIRECTION
  ) => {
    return get(buildPagedOrdersUrl(API_ENDPOINTS.ORDERS.LIST_MY_ORDERS, page, size, sort, direction));
  },
  getByOrderNumber: async (orderNumber) => {
    return get(API_ENDPOINTS.ORDERS.GET_BY_ORDER_NUMBER(orderNumber));
  },
  getById: async (id) => {
    return get(API_ENDPOINTS.ORDERS.GET_ORDER_DETAILS(id));
  },
  getSellerOrderById: async (id) => {
    return get(API_ENDPOINTS.ORDERS.GET_SELLER_ORDER_DETAILS(id));
  },
  cancelOrder: async (id, payload) => {
    return put(API_ENDPOINTS.ORDERS.CANCEL_ORDER(id), payload);
  },
  refundOrder: async (id, payload) => {
    return post(API_ENDPOINTS.ORDERS.REFUND_ORDER(id), payload);
  },
  completeOrder: async (id) => {
    return put(API_ENDPOINTS.ORDERS.COMPLETE_ORDER(id));
  },
  updateOrderName: async (id, name) => {
    return put(API_ENDPOINTS.ORDERS.UPDATE_ORDER_NAME(id), { name });
  },
  updateOrderAddress: async (id, shippingAddressId, billingAddressId = null) => {
    return put(API_ENDPOINTS.ORDERS.UPDATE_ORDER_ADDRESS(id), { shippingAddressId, billingAddressId });
  },
  updateOrderNotes: async (id, notes) => {
    return put(API_ENDPOINTS.ORDERS.UPDATE_ORDER_NOTES(id), { notes });
  },
  sellerOrders: async (
    page = ORDER_DEFAULTS.INITIAL_PAGE,
    size = ORDER_DEFAULTS.INITIAL_PAGE_SIZE,
    sort = null,
    direction = ORDER_DEFAULTS.SORT_DIRECTION
  ) => {
    return get(buildPagedOrdersUrl(API_ENDPOINTS.ORDERS.LIST_SELLER_ORDERS, page, size, sort, direction));
  },
  getPendingEscrowAmount: async () => {
    return get(API_ENDPOINTS.ORDERS.GET_PENDING_ESCROW_AMOUNT);
  },
  getPendingCompletionStatus: async () => {
    return get(API_ENDPOINTS.ORDERS.PENDING_COMPLETION);
  },
  shipOrder: async (id, payload) => {
    return put(API_ENDPOINTS.ORDERS.SHIP_ORDER(id), payload);
  },
};


