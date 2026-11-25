import { useQuery } from '@tanstack/react-query';
import { listingService } from '../services/listingService.js';
import { ERROR_MESSAGES } from '../types/index.js';
import { getErrorMessage } from '../../common/utils/errorUtils.js';

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
 retry: (failureCount, err) => err?.response?.status !== 404 && failureCount < 1,
 retryDelay: 1000,
 });

 // A missing listing is a normal answer (404), not a connection problem: the page shows its own wording.
 const notFound = isError && queryError?.response?.status === 404;
 const error = isError && !notFound
 ? getErrorMessage(queryError, ERROR_MESSAGES.NETWORK_ERROR)
 : null;

 return { listing: listing || null, isLoading, error, notFound, refetch };
};

