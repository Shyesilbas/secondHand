import { useQuery } from '@tanstack/react-query';
import { reviewService } from '../services/reviewService.js';

const REVIEW_KEYS = {
  all: ['reviews'],
  listing: (listingId) => [...REVIEW_KEYS.all, 'listing', listingId],
};

export const useListingReviews = (listingId) => {
  const {
    data: reviewsResponse,
    isLoading,
    error: queryError,
    isError
  } = useQuery({
    queryKey: REVIEW_KEYS.listing(listingId),
    queryFn: () => {
      console.log('📝 useListingReviews: Fetching reviews for listing', listingId);
      return reviewService.getReviewsForListing(listingId);
    },
    enabled: !!listingId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const reviews = reviewsResponse?.content || [];
  const error = isError ? (queryError?.message || 'Failed to load reviews') : null;

  return {
    reviews,
    isLoading,
    error,
    hasReviews: reviews.length > 0
  };
};
