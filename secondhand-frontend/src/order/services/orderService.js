import {API_ENDPOINTS} from '../../common/constants/apiEndpoints.js';
import {get, post, put} from '../../common/services/api/request.js';
import { ORDER_DEFAULTS } from '../constants/orderUiConstants.js';

const appendDeliveryMethod = (params, deliveryMethod) => {
 if (deliveryMethod && deliveryMethod !== 'ALL') params.set('deliveryMethod', deliveryMethod);
};

// `filters.statuses` (array) and `filters.orderNumber` (exact match) are optional list filters.
const buildPagedOrdersUrl = (endpoint, page, size, sort, direction, deliveryMethod, filters = {}) => {
 const params = new URLSearchParams({ page: String(page), size: String(size) });
 if (sort) params.set('sort', `${sort},${direction}`);
 appendDeliveryMethod(params, deliveryMethod);
 if (filters.statuses?.length) params.set('statuses', filters.statuses.join(','));
 if (filters.orderNumber) params.set('orderNumber', filters.orderNumber);
 return `${endpoint}?${params.toString()}`;
};

const buildStatusCountsUrl = (endpoint, deliveryMethod) => {
 const params = new URLSearchParams();
 appendDeliveryMethod(params, deliveryMethod);
 const query = params.toString();
 return query ? `${endpoint}?${query}` : endpoint;
};

export const orderService = {
 checkout: async (payload) => {
 return post(API_ENDPOINTS.ORDERS.CHECKOUT, payload);
 },
 initiateCheckoutReservation: async () => {
 return post(API_ENDPOINTS.CHECKOUT.INITIATE);
 },
 initiatePaymentVerification: async (payload) => {
 return post(API_ENDPOINTS.PAYMENTS.INITIATE_VERIFICATION, payload);
 },
 myOrders: async (
 page = ORDER_DEFAULTS.INITIAL_PAGE,
 size = ORDER_DEFAULTS.INITIAL_PAGE_SIZE,
 sort = null,
 direction = ORDER_DEFAULTS.SORT_DIRECTION,
 deliveryMethod = 'ALL',
 filters = {}
 ) => {
 return get(buildPagedOrdersUrl(API_ENDPOINTS.ORDERS.LIST_MY_ORDERS, page, size, sort, direction, deliveryMethod, filters));
 },
 /** Buyer's own order by exact order number; rejects when it does not exist. */
 getByOrderNumber: async (orderNumber) => {
 const page = await get(buildPagedOrdersUrl(API_ENDPOINTS.ORDERS.LIST_MY_ORDERS, 0, 1, null, null, 'ALL', { orderNumber }));
 const order = page?.content?.[0];
 if (!order) throw new Error('ORDER_NOT_FOUND');
 return order;
 },
 myOrderStatusCounts: async (deliveryMethod = 'ALL') => {
 return get(buildStatusCountsUrl(API_ENDPOINTS.ORDERS.STATUS_COUNTS, deliveryMethod));
 },
 sellerOrderStatusCounts: async (deliveryMethod = 'ALL') => {
 return get(buildStatusCountsUrl(API_ENDPOINTS.ORDERS.SELLER_STATUS_COUNTS, deliveryMethod));
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
 direction = ORDER_DEFAULTS.SORT_DIRECTION,
 deliveryMethod = 'ALL',
 filters = {}
 ) => {
 return get(buildPagedOrdersUrl(API_ENDPOINTS.ORDERS.LIST_SELLER_ORDERS, page, size, sort, direction, deliveryMethod, filters));
 },
 getPendingEscrowAmount: async () => {
 return get(API_ENDPOINTS.ORDERS.GET_PENDING_ESCROW_AMOUNT);
 },
 shipOrder: async (id, payload) => {
 return put(API_ENDPOINTS.ORDERS.SHIP_ORDER(id), payload);
 },
 verifyMeetupCode: async (orderNumber, code) => {
 return post(API_ENDPOINTS.ORDERS.VERIFY_MEETUP(orderNumber, code));
 },
 confirmHandoverCompletion: async (orderNumber, confirmed) => {
 return post(API_ENDPOINTS.ORDERS.CONFIRM_HANDOVER(orderNumber), { confirmed });
 },
 regenerateMeetupCode: async (orderNumber) => {
 return post(API_ENDPOINTS.ORDERS.REGENERATE_MEETUP_CODE(orderNumber));
 },
};

