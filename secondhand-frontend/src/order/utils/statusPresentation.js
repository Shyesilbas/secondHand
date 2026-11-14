import { ORDER_STATUSES } from '../constants/orderUiConstants.js';
import { PAYMENT_STATUSES } from '../../payments/paymentSchema.js';

const statusUpper = (status) => String(status || '').toUpperCase();

/** Standard Status Badge Token Matrix class */
export const getOrderStatusBadgeClass = (status) => {
  const value = statusUpper(status);
  if ([ORDER_STATUSES.COMPLETED, ORDER_STATUSES.DELIVERED].includes(value)) {
    return 'bg-status-success-bg text-status-success-text border-status-success-border';
  }
  if ([
    ORDER_STATUSES.CONFIRMED,
    ORDER_STATUSES.PROCESSING,
    ORDER_STATUSES.SHIPPED,
    ORDER_STATUSES.MEETUP_PENDING,
    ORDER_STATUSES.HANDOVER_CONFIRMED,
    ORDER_STATUSES.PENDING
  ].includes(value)) {
    return 'bg-status-warning-bg text-status-warning-text border-status-warning-border';
  }
  if ([
    ORDER_STATUSES.CANCELLED,
    ORDER_STATUSES.REFUNDED,
    ORDER_STATUSES.VERIFICATION_LOCKED,
    'FAILED'
  ].includes(value)) {
    return 'bg-status-error-bg text-status-error-text border-status-error-border';
  }
  return 'bg-background-secondary text-text-secondary border-border';
};

/** 6px status dot colour (aligned 1-to-1 with getOrderStatusBadgeClass semantic families) */
export const getOrderStatusDotClass = (status) => {
  const s = statusUpper(status);
  if ([ORDER_STATUSES.COMPLETED, ORDER_STATUSES.DELIVERED].includes(s)) {
    return 'bg-status-success';
  }
  if ([
    ORDER_STATUSES.CONFIRMED,
    ORDER_STATUSES.PROCESSING,
    ORDER_STATUSES.SHIPPED,
    ORDER_STATUSES.MEETUP_PENDING,
    ORDER_STATUSES.HANDOVER_CONFIRMED,
    ORDER_STATUSES.PENDING
  ].includes(s)) {
    return 'bg-status-warning';
  }
  if ([
    ORDER_STATUSES.CANCELLED,
    ORDER_STATUSES.REFUNDED,
    ORDER_STATUSES.VERIFICATION_LOCKED,
    'FAILED'
  ].includes(s)) {
    return 'bg-status-error';
  }
  return 'bg-text-muted';
};

/** Inline text color — modal label, links */
export const getOrderStatusTextClass = (status) => {
  const value = statusUpper(status);

  if ([ORDER_STATUSES.COMPLETED, ORDER_STATUSES.DELIVERED].includes(value)) {
    return 'text-status-success';
  }
  if ([
    ORDER_STATUSES.CONFIRMED,
    ORDER_STATUSES.PROCESSING,
    ORDER_STATUSES.SHIPPED,
    ORDER_STATUSES.MEETUP_PENDING,
    ORDER_STATUSES.HANDOVER_CONFIRMED,
    ORDER_STATUSES.PENDING
  ].includes(value)) {
    return 'text-status-warning';
  }
  if ([
    ORDER_STATUSES.CANCELLED,
    ORDER_STATUSES.REFUNDED,
    ORDER_STATUSES.VERIFICATION_LOCKED,
    'FAILED'
  ].includes(value)) {
    return 'text-status-error';
  }

  return 'text-text-secondary';
};

export const getPaymentStatusIndicatorClass = (status) => {
  const s = statusUpper(status);
  if ([PAYMENT_STATUSES.COMPLETED, PAYMENT_STATUSES.PAID].includes(s)) {
    return 'bg-status-success';
  }
  if ([PAYMENT_STATUSES.ESCROW, PAYMENT_STATUSES.PARTIALLY_REFUNDED].includes(s)) {
    return 'bg-status-warning';
  }
  if ([PAYMENT_STATUSES.FAILED, PAYMENT_STATUSES.CANCELLED, PAYMENT_STATUSES.REFUNDED].includes(s)) {
    return 'bg-status-error';
  }
  if (s === PAYMENT_STATUSES.PENDING) {
    return 'bg-text-muted';
  }
  return 'bg-text-muted';
};

export const getPaymentStatusTextClass = (status) => {
  const s = statusUpper(status);
  if ([PAYMENT_STATUSES.COMPLETED, PAYMENT_STATUSES.PAID].includes(s)) {
    return 'text-text-secondary';
  }
  if ([PAYMENT_STATUSES.ESCROW, PAYMENT_STATUSES.PARTIALLY_REFUNDED].includes(s)) {
    return 'text-status-warning';
  }
  if ([PAYMENT_STATUSES.FAILED, PAYMENT_STATUSES.CANCELLED, PAYMENT_STATUSES.REFUNDED].includes(s)) {
    return 'text-status-error';
  }
  if (s === PAYMENT_STATUSES.PENDING) {
    return 'text-text-muted';
  }
  return 'text-text-secondary';
};
