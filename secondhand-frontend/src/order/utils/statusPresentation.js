import { ORDER_STATUSES } from '../constants/orderUiConstants.js';

const statusUpper = (status) => String(status || '').toUpperCase();

/** Pill/badge row (border + bg + text) — list view */
export const getOrderStatusBadgeClass = (status) => {
  const s = statusUpper(status);
  if (s === ORDER_STATUSES.COMPLETED) return 'bg-emerald-50 text-emerald-800 border-emerald-200';
  if (s === ORDER_STATUSES.DELIVERED) return 'bg-blue-50 text-blue-800 border-blue-200';
  if (s === ORDER_STATUSES.SHIPPED) return 'bg-indigo-50 text-indigo-800 border-indigo-200';
  if (s === ORDER_STATUSES.PROCESSING) return 'bg-amber-50 text-amber-900 border-amber-200';
  if (s === ORDER_STATUSES.CONFIRMED) return 'bg-green-50 text-green-800 border-green-200';
  if (s === ORDER_STATUSES.PENDING) return 'bg-slate-100 text-slate-700 border-slate-200';
  if (s === ORDER_STATUSES.CANCELLED || s === ORDER_STATUSES.REFUNDED) return 'bg-rose-50 text-rose-800 border-rose-200';
  return 'bg-slate-50 text-slate-700 border-slate-200';
};

/** Inline text color — modal label, links */
export const getOrderStatusTextClass = (status) => {
  const value = statusUpper(status);

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
