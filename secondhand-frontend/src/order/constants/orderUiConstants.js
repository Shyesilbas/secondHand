import { PAGE_SIZE_OPTIONS_5_10_20_50 } from '../../common/constants/pagination.js';

export const ORDER_VIEW_MODES = Object.freeze({
  BUYER: 'buyer',
  SELLER: 'seller',
});

export const ORDER_STATUSES = Object.freeze({
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  PROCESSING: 'PROCESSING',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
  PARTIALLY_REFUNDED: 'PARTIALLY_REFUNDED',
  FAILED: 'FAILED',
  PAID: 'PAID',
});

/** Tab filters: groups instead of single API status (resolved in useOrderFlow) */
export const ORDER_STATUS_TAB_FILTER = Object.freeze({
  ALL: '',
  /** PENDING + CONFIRMED + PROCESSING */
  PREPARING: '__TAB_PREPARING__',
  SHIPPED: ORDER_STATUSES.SHIPPED,
  /** DELIVERED + COMPLETED */
  DELIVERED_GROUP: '__TAB_DELIVERED__',
  CANCELLED: ORDER_STATUSES.CANCELLED,
});

export const ORDER_STATUS_FILTER_OPTIONS = Object.freeze([
  { value: '', label: 'All Statuses' },
  { value: ORDER_STATUSES.PENDING, label: 'Pending' },
  { value: ORDER_STATUSES.CONFIRMED, label: 'Confirmed' },
  { value: ORDER_STATUSES.PROCESSING, label: 'Processing' },
  { value: ORDER_STATUSES.SHIPPED, label: 'Shipped' },
  { value: ORDER_STATUSES.DELIVERED, label: 'Delivered' },
  { value: ORDER_STATUSES.COMPLETED, label: 'Completed' },
  { value: ORDER_STATUSES.CANCELLED, label: 'Cancelled' },
  { value: ORDER_STATUSES.REFUNDED, label: 'Refunded' },
]);

export const ORDER_STATUS_ACCENT = Object.freeze({
  [ORDER_STATUSES.COMPLETED]: 'border-l-emerald-400',
  [ORDER_STATUSES.DELIVERED]: 'border-l-blue-400',
  [ORDER_STATUSES.SHIPPED]: 'border-l-indigo-400',
  [ORDER_STATUSES.PROCESSING]: 'border-l-amber-400',
  [ORDER_STATUSES.CONFIRMED]: 'border-l-green-400',
  [ORDER_STATUSES.PENDING]: 'border-l-gray-300',
  [ORDER_STATUSES.CANCELLED]: 'border-l-red-300',
  [ORDER_STATUSES.REFUNDED]: 'border-l-rose-300',
});

export const ORDER_DEFAULTS = Object.freeze({
  INITIAL_PAGE: 0,
  INITIAL_PAGE_SIZE: 5,
  SEARCH_PAYMENT_FETCH_SIZE: 20,
  SORT_DIRECTION: 'desc',
  PAGE_SIZE_OPTIONS: PAGE_SIZE_OPTIONS_5_10_20_50,
});

export const ORDER_LIMITS = Object.freeze({
  ORDER_NAME_MAX_LENGTH: 100,
  ORDER_NOTES_MAX_LENGTH: 1000,
});

export const ORDER_TIME = Object.freeze({
  SECOND_MS: 1000,
  MINUTE_MS: 60 * 1000,
  DELIVERY_CONFIRMATION_WINDOW_MS: 48 * 60 * 60 * 1000,
  PENDING_ESCROW_REFRESH_MS: 30 * 1000,
  PENDING_ESCROW_STALE_MS: 30 * 1000,
  ORDERS_QUERY_GC_MS: 10 * 60 * 1000,
  ESCROW_QUERY_GC_MS: 5 * 60 * 1000,
  PENDING_COMPLETION_STALE_MS: 2 * 60 * 1000,
  PENDING_COMPLETION_REFRESH_ACTIVE_MS: 2 * 60 * 1000,
  PENDING_COMPLETION_REFRESH_IDLE_MS: 5 * 60 * 1000,
});

export const ORDER_MESSAGES = Object.freeze({
  ORDER_NOT_FOUND: 'Order not found. Please check the order number.',
  /** @deprecated use CONFIRM_ORDER_MODAL_TITLE / BODY; kept for any stray references */
  CONFIRM_COMPLETE_ORDER: 'Are you sure you want to complete this order? This action cannot be undone.',
  CONFIRM_ORDER_MODAL_TITLE: 'Confirm order?',
  CONFIRM_ORDER_MODAL_BODY:
    'You are about to confirm that you have received this order. After you confirm, you will not be able to cancel this order or request a refund from this screen. Make sure you are satisfied with your purchase before continuing.',
  CONFIRM_ORDER_BUTTON: 'Confirm order',
  CANCEL_ORDER_BUTTON: 'Cancel',
  UPDATE_NAME_FAILED: 'Failed to update order name',
  CANCEL_ORDER_FAILED: 'Failed to cancel order',
  REQUEST_REFUND_FAILED: 'Failed to request refund',
  COMPLETE_ORDER_FAILED: 'Failed to complete order',
  UPDATE_ADDRESS_FAILED: 'Failed to update address',
  UPDATE_NOTES_FAILED: 'Failed to update notes',
  UNKNOWN_ERROR: 'An error occurred',
  ORDER_NAME_TOO_LONG: (max) => `Order name must be ${max} characters or less`,
  ORDER_NOTES_TOO_LONG: (max) => `Notes must be ${max} characters or less`,
});
