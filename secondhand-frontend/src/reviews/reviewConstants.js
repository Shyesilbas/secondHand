export const REVIEW_LIMITS = Object.freeze({
  MAX_RATING: 5,
  MIN_RATING: 1,
  MAX_COMMENT_LENGTH: 1000,
  SKELETON_ROWS: 3,
});

export const REVIEW_DEFAULTS = Object.freeze({
  INITIAL_RATING: 0,
  WRITTEN_PAGE: 0,
  WRITTEN_SIZE: 20,
  RECEIVED_PAGE: 0,
  RECEIVED_SIZE: 10,
  RETRY_COUNT: 2,
  RETRY_BASE_DELAY_MS: 1000,
  RETRY_MAX_DELAY_MS: 30000,
  STALE_TIME_MS: 5 * 60 * 1000,
  GC_TIME_MS: 15 * 60 * 1000,
  LISTING_CACHE_TIME_MS: 10 * 60 * 1000,
});

export const REVIEW_MESSAGES = Object.freeze({
  RATING_REQUIRED: 'Please rate the product before submitting a review',
  UNKNOWN_ERROR: 'An error occurred.',
  LOAD_FAILED: 'Failed to load reviews',
  CHECKING: 'Checking...',
  REVIEW: 'Review',
  SEND_REVIEW: 'Send Review',
  SENDING: 'Sending...',
  ERROR_OCCURRED_TITLE: 'Error Occurred',
  TRY_AGAIN: 'Try Again',
  NO_REVIEWS_YET: 'No reviews yet',
  NO_REVIEW_INFO: 'No Review information found.',
  LOAD_MORE: 'Load More',
  LOADING: 'Loading...',
});
