import { useQuery } from '@tanstack/react-query';
import { showcaseService } from '../services/showcaseService.js';

// Query keys for react-query
const SHOWCASE_KEYS = {
    all: ['showcases'],
    active: () => [...SHOWCASE_KEYS.all, 'active'],
    userShowcases: () => [...SHOWCASE_KEYS.all, 'user']
};

/**
 * Lightweight hook for components that only need to read showcase data
 * without mutation capabilities. Provides better performance for read-only components.
 */
export const useShowcaseQuery = () => {
    const {
        data: showcases = [],
        isLoading: loading,
        error: queryError,
        refetch: fetchShowcases
    } = useQuery({
        queryKey: SHOWCASE_KEYS.active(),
        queryFn: showcaseService.getActiveShowcases,
        staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
        cacheTime: 10 * 60 * 1000, // Cache for 10 minutes
        refetchOnWindowFocus: false,
        refetchOnMount: false, // Don't refetch on every mount - use cache
        retry: 2, // Retry failed requests 2 times
        retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    });

    return {
        showcases,
        loading,
        error: queryError?.message,
        fetchShowcases,
        // Helper function to check if a listing is in showcase
        isInShowcase: (listingId) => {
            if (!Array.isArray(showcases)) return false;
            return showcases.some(s => (s.listing?.id || s.listingId) === listingId);
        }
    };
};

export { SHOWCASE_KEYS };
