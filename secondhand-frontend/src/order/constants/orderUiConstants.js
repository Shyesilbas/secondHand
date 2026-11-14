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
 MEETUP_PENDING: 'MEETUP_PENDING',
 HANDOVER_CONFIRMED: 'HANDOVER_CONFIRMED',
 VERIFICATION_LOCKED: 'VERIFICATION_LOCKED',
});

/** Mirrors backend `OrderAction`; the backend sends the allowed subset per viewer in `allowedActions`. */
export const ORDER_ACTIONS = Object.freeze({
 CANCEL: 'CANCEL',
 REFUND: 'REFUND',
 COMPLETE: 'COMPLETE',
 EDIT: 'EDIT',
 REVIEW: 'REVIEW',
 SHOW_MEETUP_CODE: 'SHOW_MEETUP_CODE',
 CONFIRM_HANDOVER: 'CONFIRM_HANDOVER',
 SHIP: 'SHIP',
 VERIFY_MEETUP: 'VERIFY_MEETUP',
});

/** List tabs. Each tab maps to a set of backend statuses; the backend filters with `statuses`. */
export const ORDER_LIST_TABS = Object.freeze({
 ALL: 'all',
 ACTION: 'action',
 PREPARING: 'preparing',
 IN_DELIVERY: 'in_delivery',
 COMPLETED: 'completed',
 CLOSED: 'closed',
});

const S = ORDER_STATUSES;

/** Statuses where the viewer has the next step (see order/README.md state machine). */
const ACTION_STATUSES = Object.freeze({
 BUYER: [S.DELIVERED, S.HANDOVER_CONFIRMED, S.MEETUP_PENDING],
 SELLER: [S.CONFIRMED, S.PROCESSING, S.MEETUP_PENDING],
});

const TAB_STATUSES = Object.freeze({
 [ORDER_LIST_TABS.ALL]: [],
 [ORDER_LIST_TABS.PREPARING]: [S.PENDING, S.CONFIRMED, S.PROCESSING],
 [ORDER_LIST_TABS.IN_DELIVERY]: [S.SHIPPED, S.MEETUP_PENDING, S.VERIFICATION_LOCKED],
 [ORDER_LIST_TABS.COMPLETED]: [S.DELIVERED, S.HANDOVER_CONFIRMED, S.COMPLETED],
 [ORDER_LIST_TABS.CLOSED]: [S.CANCELLED, S.REFUNDED],
});

/** Backend statuses for a tab; an empty array means no status filter. */
export const getOrderTabStatuses = (tab, viewMode) => {
 if (tab === ORDER_LIST_TABS.ACTION) {
 return viewMode === ORDER_VIEW_MODES.SELLER ? ACTION_STATUSES.SELLER : ACTION_STATUSES.BUYER;
 }
 return TAB_STATUSES[tab] ?? [];
};

/** Seller statuses that still need to be shipped. */
export const SELLER_TO_SHIP_STATUSES = Object.freeze([S.CONFIRMED, S.PROCESSING]);

export const ORDER_DEFAULTS = Object.freeze({
 INITIAL_PAGE: 0,
 INITIAL_PAGE_SIZE: 10,
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
 /** Display tone thresholds for the backend `shipDeadline`; the deadline itself comes from the backend. */
 SHIP_DEADLINE_WARNING_MS: 24 * 60 * 60 * 1000,
 SHIP_DEADLINE_URGENT_MS: 6 * 60 * 60 * 1000,
 PENDING_ESCROW_REFRESH_MS: 30 * 1000,
 PENDING_ESCROW_STALE_MS: 30 * 1000,
 ORDERS_QUERY_GC_MS: 10 * 60 * 1000,
 /** Sipariş listesi: gereksiz sürekli yenilemeyi azaltır */
 ORDERS_LIST_STALE_MS: 45 * 1000,
 ESCROW_QUERY_GC_MS: 5 * 60 * 1000,
 PENDING_COMPLETION_STALE_MS: 2 * 60 * 1000,
 PENDING_COMPLETION_REFRESH_ACTIVE_MS: 2 * 60 * 1000,
 PENDING_COMPLETION_REFRESH_IDLE_MS: 5 * 60 * 1000,
});

export const ORDER_MESSAGES = Object.freeze({
 ORDER_NOT_FOUND: 'Order not found. Please check the order number.',
 RECEIPT_NOT_FOUND: 'The receipt for this payment is not among your recent payments.',
 RECEIPT_LOAD_FAILED: 'Could not load the receipt. Please try again.',
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
 REVIEW_SUBMITTED_TITLE: 'Review submitted',
 REVIEW_SUBMITTED_WITH_COMMENT: 'Thanks — your comment has been saved.',
 REVIEW_SUBMITTED_RATING_ONLY: 'Thanks for rating this purchase.',
});
