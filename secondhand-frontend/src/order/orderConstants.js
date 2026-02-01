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
  const shipping = order?.shipping;

  if (status === 'DELIVERED' && shipping?.deliveredAt) {
    return { status, updatedAt: shipping.deliveredAt };
  }
  if (status === 'SHIPPED' && shipping?.inTransitAt) {
    return { status, updatedAt: shipping.inTransitAt };
  }
  if (shipping?.updatedAt) {
    return { status, updatedAt: shipping.updatedAt };
  }
  if (order?.updatedAt) {
    return { status, updatedAt: order.updatedAt };
  }
  return { status, updatedAt: order?.createdAt };
};

