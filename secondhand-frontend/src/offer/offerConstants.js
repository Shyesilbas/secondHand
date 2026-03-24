export const OFFER_STATUSES = Object.freeze({
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  EXPIRED: 'EXPIRED',
  COMPLETED: 'COMPLETED',
});

export const OFFER_TABS = Object.freeze({
  MADE: 'made',
  RECEIVED: 'received',
});

export const OFFER_DEFAULTS = Object.freeze({
  PAGE: 0,
  PAGE_SIZE: 5,
  MIN_QUANTITY: 1,
  MIN_TOTAL_PRICE_EXCLUSIVE: 0,
  FALLBACK_CURRENCY: 'TRY',
  FALLBACK_LISTING_TITLE: 'Listing',
});

export const OFFER_MESSAGES = Object.freeze({
  ERROR_TITLE: 'Error',
  SUCCESS_TITLE: 'Successful',
  LOAD_FAILED: 'Failed to load offers',
  LISTING_NOT_FOUND: 'Listing not found',
  OFFER_NOT_FOUND: 'Offer not found',
  INVALID_QUANTITY: 'Quantity must be at least 1',
  INVALID_TOTAL_PRICE: 'Total price must be greater than 0',
  SEND_FAILED: 'Failed to send offer',
  COUNTER_FAILED: 'Failed to counter offer',
  ACCEPT_FAILED: 'Failed to accept offer',
  REJECT_FAILED: 'Failed to reject offer',
  OFFER_SENT: 'Offer sent',
  COUNTER_SENT: 'Counter offer sent',
  OFFER_ACCEPTED: 'Offer accepted',
  OFFER_REJECTED: 'Offer rejected',
});
