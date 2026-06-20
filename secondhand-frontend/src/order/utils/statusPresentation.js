import { ORDER_STATUSES } from '../constants/orderUiConstants.js';
import { PAYMENT_STATUSES } from '../../payments/paymentSchema.js';

const statusUpper = (status) => String(status || '').toUpperCase();

/** Pill/badge row (border + bg + text) — list view */
export const getOrderStatusBadgeClass = (status) => {
  const s = statusUpper(status);
  if (s === ORDER_STATUSES.COMPLETED) return 'bg-status-success-bg text-emerald-800 border-emerald-200';
  if (s === ORDER_STATUSES.DELIVERED) return 'bg-blue-50 text-blue-800 border-primary';
  if (s === ORDER_STATUSES.SHIPPED) return 'bg-indigo-50 text-primary border-primary';
  if (s === ORDER_STATUSES.PROCESSING) return 'bg-status-warning-bg text-amber-900 border-amber-200';
  if (s === ORDER_STATUSES.CONFIRMED) return 'bg-status-success-bg text-green-800 border-green-200';
  if (s === ORDER_STATUSES.PENDING) return 'bg-slate-100 text-slate-700 border-border-light';
  if (s === ORDER_STATUSES.CANCELLED || s === ORDER_STATUSES.REFUNDED) return 'bg-rose-50 text-rose-800 border-rose-200';
  if (s === ORDER_STATUSES.MEETUP_PENDING) return 'bg-indigo-50 text-primary border-primary';
  if (s === ORDER_STATUSES.HANDOVER_CONFIRMED) return 'bg-primary text-violet-800 border-violet-200';
  if (s === ORDER_STATUSES.VERIFICATION_LOCKED) return 'bg-purple-50 text-purple-900 border-purple-300';
  return 'bg-slate-50 text-slate-700 border-border-light';
};

/** Inline text color — modal label, links */
export const getOrderStatusTextClass = (status) => {
  const value = statusUpper(status);

  if (value === ORDER_STATUSES.COMPLETED) return 'text-status-success';
  if (value === ORDER_STATUSES.DELIVERED) return 'text-primary';
  if (value === ORDER_STATUSES.SHIPPED) return 'text-primary';
  if (value === ORDER_STATUSES.PROCESSING) return 'text-status-warning';
  if (value === ORDER_STATUSES.CONFIRMED) return 'text-status-success';
  if (value === ORDER_STATUSES.PENDING) return 'text-slate-600';
  if (value === ORDER_STATUSES.MEETUP_PENDING) return 'text-primary';
  if (value === ORDER_STATUSES.HANDOVER_CONFIRMED) return 'text-violet-600';
  if (value === ORDER_STATUSES.VERIFICATION_LOCKED) return 'text-purple-600';
  if (value === ORDER_STATUSES.REFUNDED) return 'text-rose-600';
  if (value === ORDER_STATUSES.CANCELLED) return 'text-rose-600';

  return 'text-slate-600';
};

export const getOrderStatusIndicatorClass = (status) => {
  if (status === ORDER_STATUSES.COMPLETED) return 'bg-status-success-bg';
  if (status === ORDER_STATUSES.DELIVERED) return 'bg-blue-500';
  if (status === ORDER_STATUSES.SHIPPED) return 'bg-indigo-500';
  if (status === ORDER_STATUSES.PROCESSING) return 'bg-status-warning-bg';
  if (status === ORDER_STATUSES.CONFIRMED) return 'bg-status-success-bg';
  if (status === ORDER_STATUSES.MEETUP_PENDING) return 'bg-indigo-500';
  if (status === ORDER_STATUSES.HANDOVER_CONFIRMED) return 'bg-primary';
  if (status === ORDER_STATUSES.VERIFICATION_LOCKED) return 'bg-purple-500';
  return 'bg-gray-400';
};

export const getPaymentStatusIndicatorClass = (status) => {
  const s = String(status || '').toUpperCase();
  if (s === PAYMENT_STATUSES.PAID) return 'bg-status-success-bg';
  if (s === PAYMENT_STATUSES.PARTIALLY_REFUNDED) return 'bg-status-warning-bg';
  if (s === PAYMENT_STATUSES.REFUNDED) return 'bg-rose-400';
  if (s === PAYMENT_STATUSES.PENDING) return 'bg-text-muted';
  return 'bg-status-error-bg';
};

export const getPaymentStatusTextClass = (status) => {
  const s = String(status || '').toUpperCase();
  if (s === PAYMENT_STATUSES.PAID) return 'text-emerald-400';
  if (s === PAYMENT_STATUSES.PARTIALLY_REFUNDED) return 'text-amber-400';
  if (s === PAYMENT_STATUSES.REFUNDED) return 'text-rose-400';
  if (s === PAYMENT_STATUSES.PENDING) return 'text-slate-400';
  return 'text-red-400';
};
