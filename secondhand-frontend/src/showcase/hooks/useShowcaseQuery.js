import { useQuery } from '@tanstack/react-query';
import { showcaseService } from '../services/showcaseService.js';

const SHOWCASE_KEYS = {
    all: ['showcases'],
    active: () => [...SHOWCASE_KEYS.all, 'active'],
    userShowcases: () => [...SHOWCASE_KEYS.all, 'user']
};

export const useShowcaseQuery = (options = {}) => {
    const {
        data: showcases = [],
        isLoading: loading,
        error: queryError,
        refetch: fetchShowcases
    } = useQuery({
        queryKey: SHOWCASE_KEYS.active(),
        queryFn: showcaseService.getActiveShowcases,
        enabled: options.enabled ?? true,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        retry: 1,
        retryDelay: 1000,
    });

    return {
        showcases,
        loading,
        error: queryError?.message,
        fetchShowcases,
        // Check if a listing is currently in an active showcase
        isInShowcase: (listingId) => {
            if (!Array.isArray(showcases)) return false;
            return showcases.some(s => (s.listing?.id || s.listingId) === listingId);
        }
    };
};

export { SHOWCASE_KEYS };
