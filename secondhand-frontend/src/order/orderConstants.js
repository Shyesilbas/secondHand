import { ORDER_STATUSES } from './constants/orderUiConstants.js';

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

export const getStatusColor = (status) => {
  const value = String(status || '').toUpperCase();

  if (value === ORDER_STATUSES.COMPLETED) return 'text-emerald-600';
  if (value === ORDER_STATUSES.DELIVERED) return 'text-blue-600';
  if (value === ORDER_STATUSES.SHIPPED) return 'text-indigo-600';
  if (value === ORDER_STATUSES.PROCESSING) return 'text-amber-600';
  if (value === ORDER_STATUSES.CONFIRMED) return 'text-green-600';
  if (value === ORDER_STATUSES.PENDING) return 'text-slate-600';

  if (value === ORDER_STATUSES.PAID) return 'text-emerald-600';
  if (value === ORDER_STATUSES.PARTIALLY_REFUNDED) return 'text-amber-600';
  if (value === ORDER_STATUSES.REFUNDED) return 'text-rose-600';
  if (value === ORDER_STATUSES.FAILED) return 'text-rose-600';
  if (value === ORDER_STATUSES.CANCELLED) return 'text-rose-600';

  return 'text-slate-600';
};

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
