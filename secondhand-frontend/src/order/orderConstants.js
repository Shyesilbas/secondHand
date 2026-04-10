import { ORDER_STATUSES } from './constants/orderUiConstants.js';

export { getOrderStatusTextClass as getStatusColor } from './utils/statusPresentation.js';

export const ORDER_QUERY_KEYS = Object.freeze({
  orders: ['orders'],
  myOrders: (userId, page, size, sort, direction) => [
    'orders',
    'my',
    userId,
    { page, size, sort, direction },
  ],

  sellerOrders: ['sellerOrders'],
  sellerOrdersList: (userId, page, size, sort, direction) => [
    'sellerOrders',
    userId,
    { page, size, sort, direction },
  ],

  escrow: ['escrow'],
  pendingEscrow: (userId) => ['escrow', 'pending', userId],

  pendingCompletionOrders: ['pendingCompletionOrders'],
  pendingCompletion: (userId) => ['pendingCompletionOrders', userId],
});

export const getLastUpdateInfo = (order) => {
  const status = order?.status;
  const updatedAt = order?.updatedAt ?? order?.createdAt;
  return { status, updatedAt };
};

/* ---------- Status helpers driven by backend enums ---------- */

const FALLBACK_CANCELLABLE = [ORDER_STATUSES.PENDING, ORDER_STATUSES.CONFIRMED];
const FALLBACK_REFUNDABLE  = [ORDER_STATUSES.DELIVERED];
const FALLBACK_MODIFIABLE  = [ORDER_STATUSES.PENDING, ORDER_STATUSES.CONFIRMED];

export const isCancellableStatus = (status, enums = {}) => {
  const list = enums?.cancellableOrderStatuses ?? FALLBACK_CANCELLABLE;
  return list.includes(status);
};

export const isRefundableStatus = (status, enums = {}) => {
  const list = enums?.refundableOrderStatuses ?? FALLBACK_REFUNDABLE;
  return list.includes(status);
};

export const isModifiableStatus = (status, enums = {}) => {
  const list = enums?.modifiableOrderStatuses ?? FALLBACK_MODIFIABLE;
  return list.includes(status);
};
