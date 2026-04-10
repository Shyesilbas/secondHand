import { useQuery } from '@tanstack/react-query';
import { reviewService } from '../services/reviewService.js';
import { REVIEW_DEFAULTS, REVIEW_MESSAGES } from '../reviewConstants.js';

const REVIEW_KEYS = {
  all: ['reviews'],
  listing: (listingId) => [...REVIEW_KEYS.all, 'listing', listingId],
};

export const useListingReviews = (listingId, options = {}) => {
  const {
    data: reviewsResponse,
    isLoading,
    error: queryError,
    isError
  } = useQuery({
    queryKey: REVIEW_KEYS.listing(listingId),
    queryFn: () => {
      return reviewService.getReviewsForListing(listingId);
    },
    enabled: !!listingId && (options.enabled !== undefined ? options.enabled : true),
    staleTime: REVIEW_DEFAULTS.STALE_TIME_MS,
    gcTime: REVIEW_DEFAULTS.LISTING_CACHE_TIME_MS,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: REVIEW_DEFAULTS.RETRY_COUNT,
    retryDelay: attemptIndex =>
      Math.min(REVIEW_DEFAULTS.RETRY_BASE_DELAY_MS * 2 ** attemptIndex, REVIEW_DEFAULTS.RETRY_MAX_DELAY_MS),
  });

  const reviews = reviewsResponse?.content || [];
  const error = isError ? (queryError?.message || REVIEW_MESSAGES.LOAD_FAILED) : null;

  return {
    reviews,
    isLoading,
    error,
    hasReviews: reviews.length > 0
  };
};
