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

  if (value === 'COMPLETED') return 'text-emerald-600';
  if (value === 'DELIVERED') return 'text-blue-600';
  if (value === 'SHIPPED') return 'text-indigo-600';
  if (value === 'PROCESSING') return 'text-amber-600';
  if (value === 'CONFIRMED') return 'text-green-600';
  if (value === 'PENDING') return 'text-slate-600';

  if (value === 'PAID') return 'text-emerald-600';
  if (value === 'PARTIALLY_REFUNDED') return 'text-amber-600';
  if (value === 'REFUNDED') return 'text-rose-600';
  if (value === 'FAILED') return 'text-rose-600';
  if (value === 'CANCELLED') return 'text-rose-600';

  return 'text-slate-600';
};

export const getLastUpdateInfo = (order) => {
  const status = order?.status;
  const updatedAt = order?.updatedAt ?? order?.createdAt;
  return { status, updatedAt };
};

/* ---------- Status helpers driven by backend enums ---------- */

const FALLBACK_CANCELLABLE = ['PENDING', 'CONFIRMED'];
const FALLBACK_REFUNDABLE  = ['DELIVERED'];
const FALLBACK_MODIFIABLE  = ['PENDING', 'CONFIRMED'];

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
