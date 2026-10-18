import { ORDER_STATUSES } from '../constants/orderUiConstants.js';
import { PAYMENT_STATUSES } from '../../payments/paymentSchema.js';

const statusUpper = (status) => String(status || '').toUpperCase();

/** 6px status dot colour (DESIGN.md: dot + text, never a filled pill) */
export const getOrderStatusDotClass = (status) => {
 const s = statusUpper(status);
 if ([ORDER_STATUSES.COMPLETED, ORDER_STATUSES.DELIVERED, ORDER_STATUSES.CONFIRMED, ORDER_STATUSES.HANDOVER_CONFIRMED].includes(s)) return 'bg-status-success';
 if ([ORDER_STATUSES.SHIPPED, ORDER_STATUSES.VERIFICATION_LOCKED].includes(s)) return 'bg-primary';
 if ([ORDER_STATUSES.PROCESSING, ORDER_STATUSES.MEETUP_PENDING].includes(s)) return 'bg-status-warning';
 if ([ORDER_STATUSES.CANCELLED, ORDER_STATUSES.REFUNDED].includes(s)) return 'bg-status-error';
 return 'bg-secondary-400';
};

/** Inline text color — modal label, links */
export const getOrderStatusTextClass = (status) => {
 const value = statusUpper(status);

 if (value === ORDER_STATUSES.COMPLETED) return 'text-status-success';
 if (value === ORDER_STATUSES.DELIVERED) return 'text-primary';
 if (value === ORDER_STATUSES.SHIPPED) return 'text-primary';
 if (value === ORDER_STATUSES.PROCESSING) return 'text-status-warning';
 if (value === ORDER_STATUSES.CONFIRMED) return 'text-status-success';
 if (value === ORDER_STATUSES.PENDING) return 'text-text-secondary';
 if (value === ORDER_STATUSES.MEETUP_PENDING) return 'text-primary';
 if (value === ORDER_STATUSES.HANDOVER_CONFIRMED) return 'text-text-primary';
 if (value === ORDER_STATUSES.VERIFICATION_LOCKED) return 'text-primary';
 if (value === ORDER_STATUSES.REFUNDED) return 'text-status-error-text';
 if (value === ORDER_STATUSES.CANCELLED) return 'text-status-error-text';

 return 'text-text-secondary';
};

export const getPaymentStatusIndicatorClass = (status) => {
 const s = String(status || '').toUpperCase();
 if (s === PAYMENT_STATUSES.PAID) return 'bg-status-success';
 if (s === PAYMENT_STATUSES.PARTIALLY_REFUNDED) return 'bg-status-warning';
 if (s === PAYMENT_STATUSES.REFUNDED) return 'bg-status-error';
 if (s === PAYMENT_STATUSES.PENDING) return 'bg-text-muted';
 return 'bg-status-error';
};

export const getPaymentStatusTextClass = (status) => {
 const s = String(status || '').toUpperCase();
 if (s === PAYMENT_STATUSES.PAID) return 'text-text-secondary';
 if (s === PAYMENT_STATUSES.PARTIALLY_REFUNDED) return 'text-status-warning';
 if (s === PAYMENT_STATUSES.REFUNDED) return 'text-status-error';
 if (s === PAYMENT_STATUSES.PENDING) return 'text-text-muted';
 return 'text-status-error';
};
