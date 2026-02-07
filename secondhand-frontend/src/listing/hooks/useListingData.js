import {useCallback} from 'react';
import {useQuery} from '@tanstack/react-query';
import {listingService} from '../services/listingService.js';
import {ERROR_MESSAGES} from '../types/index.js';

const LISTING_KEYS = {
  all: ['listings'],
  detail: (id) => [...LISTING_KEYS.all, 'detail', id],
};

export const useListingData = (listingId, autoFetch = true) => {
  const {
    data: listing,
    isLoading,
    error: queryError,
    refetch,
    isError
  } = useQuery({
    queryKey: LISTING_KEYS.detail(listingId),
    queryFn: () => {
      return listingService.getListingById(listingId);
    },
    enabled: Boolean(autoFetch && listingId),
    staleTime: Infinity, // Never consider data stale - prevent automatic refetches
    gcTime: 30 * 60 * 1000, // 30 minutes - keep in cache longer
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: 1, // Reduce retries
    retryDelay: 1000,
  });

  const error = isError ? (queryError?.response?.data?.message || queryError?.message || ERROR_MESSAGES.NETWORK_ERROR) : null;

  const reset = useCallback(() => {
    // React Query handles this automatically
  }, []);

  const fetchListing = useCallback(() => {
    refetch();
  }, [refetch]);

  return {
    listing: listing || null,
    isLoading,
    error,
    refetch,
    reset,
    fetchListing
  };
};

export default useListingData;
