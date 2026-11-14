export { getOrderStatusTextClass as getStatusColor } from './utils/statusPresentation.js';

export const ORDER_QUERY_KEYS = Object.freeze({
 orders: ['orders'],
 myOrders: (userId, page, size, sort, direction, deliveryMethod, statuses = [], orderNumber = '') => [
 'orders',
 'my',
 userId,
 { page, size, sort, direction, deliveryMethod, statuses, orderNumber },
 ],
 myStatusCounts: (userId, deliveryMethod) => ['orders', 'statusCounts', userId, { deliveryMethod }],

 sellerOrders: ['sellerOrders'],
 sellerOrdersList: (userId, page, size, sort, direction, deliveryMethod, statuses = [], orderNumber = '') => [
 'sellerOrders',
 userId,
 { page, size, sort, direction, deliveryMethod, statuses, orderNumber },
 ],
 sellerStatusCounts: (userId, deliveryMethod) => ['sellerOrders', 'statusCounts', userId, { deliveryMethod }],

 escrow: ['escrow'],
 pendingEscrow: (userId) => ['escrow', 'pending', userId],

 pendingCompletionOrders: ['pendingCompletionOrders'],
 pendingCompletion: (userId) => ['pendingCompletionOrders', userId],

 orderShipment: (scope, orderId) => ['orderShipment', scope, orderId],
 detail: (orderId, isSellerView) => ['orders', 'detail', { orderId, isSellerView }],
 byNumber: (orderNumber) => ['orders', 'byNumber', orderNumber],
 itemReviews: (orderItemIds) => ['orders', 'itemReviews', orderItemIds],
});

export const getLastUpdateInfo = (order) => {
 const status = order?.status;
 const updatedAt = order?.updatedAt ?? order?.createdAt;
 return { status, updatedAt };
};

/**
 * True when the backend lists `action` in the order's `allowedActions` for the current viewer.
 * The backend derives the list from the same policies that guard the endpoints; never infer an
 * action from the status here.
 */
export const hasOrderAction = (order, action) =>
 Array.isArray(order?.allowedActions) && order.allowedActions.includes(action);
