import { useQuery } from '@tanstack/react-query';
import { showcaseService } from '../services/showcaseService.js';

const SHOWCASE_KEYS = {
    all: ['showcases'],
    active: () => [...SHOWCASE_KEYS.all, 'active'],
    userShowcases: () => [...SHOWCASE_KEYS.all, 'user']
};

export const useShowcaseQuery = () => {
    const {
        data: showcases = [],
        isLoading: loading,
        error: queryError,
        refetch: fetchShowcases
    } = useQuery({
        queryKey: SHOWCASE_KEYS.active(),
        queryFn: showcaseService.getActiveShowcases,
        staleTime: 5 * 60 * 1000,         cacheTime: 10 * 60 * 1000,         refetchOnWindowFocus: false,
        refetchOnMount: false,         retry: 2,         retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),     });

    return {
        showcases,
        loading,
        error: queryError?.message,
        fetchShowcases,
                isInShowcase: (listingId) => {
            if (!Array.isArray(showcases)) return false;
            return showcases.some(s => (s.listing?.id || s.listingId) === listingId);
        }
    };
};

export { SHOWCASE_KEYS };
