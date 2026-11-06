import { useQuery } from '@tanstack/react-query';
import { listingService } from '../services/listingService.js';
import { ERROR_MESSAGES } from '../types/index.js';

export const LISTING_KEYS = {
 detail: (id) => ['listings', 'detail', id],
};

export const useListingData = (listingId, autoFetch = true) => {
 const { data: listing, isLoading, error: queryError, isError, refetch } = useQuery({
 queryKey: LISTING_KEYS.detail(listingId),
 queryFn: () => listingService.getListingById(listingId),
 enabled: Boolean(autoFetch && listingId),
 // Price (campaigns), stock and status change on the server, so a cached detail goes stale after a minute
 // and is refetched the next time the page mounts.
 staleTime: 60 * 1000,
 gcTime: 30 * 60 * 1000,
 refetchOnWindowFocus: false,
 refetchOnReconnect: false,
 retry: 1,
 retryDelay: 1000,
 });

 const error = isError
 ? (queryError?.response?.data?.message || queryError?.message || ERROR_MESSAGES.NETWORK_ERROR)
 : null;

 return { listing: listing || null, isLoading, error, refetch };
};

