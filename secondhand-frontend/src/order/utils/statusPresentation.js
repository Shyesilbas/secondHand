import { ORDER_STATUSES } from '../constants/orderUiConstants.js';

export const getOrderStatusIndicatorClass = (status) => {
  if (status === ORDER_STATUSES.COMPLETED) return 'bg-emerald-500';
  if (status === ORDER_STATUSES.DELIVERED) return 'bg-blue-500';
  if (status === ORDER_STATUSES.SHIPPED) return 'bg-indigo-500';
  if (status === ORDER_STATUSES.PROCESSING) return 'bg-amber-500';
  if (status === ORDER_STATUSES.CONFIRMED) return 'bg-green-500';
  return 'bg-gray-400';
};

export const getPaymentStatusIndicatorClass = (status) => {
  if (status === ORDER_STATUSES.PAID) return 'bg-emerald-400';
  if (status === ORDER_STATUSES.PARTIALLY_REFUNDED) return 'bg-amber-400';
  if (status === ORDER_STATUSES.REFUNDED) return 'bg-rose-400';
  if (status === ORDER_STATUSES.PENDING) return 'bg-slate-400';
  return 'bg-red-400';
};

export const getPaymentStatusTextClass = (status) => {
  if (status === ORDER_STATUSES.PAID) return 'text-emerald-400';
  if (status === ORDER_STATUSES.PARTIALLY_REFUNDED) return 'text-amber-400';
  if (status === ORDER_STATUSES.REFUNDED) return 'text-rose-400';
  if (status === ORDER_STATUSES.PENDING) return 'text-slate-400';
  return 'text-red-400';
};
