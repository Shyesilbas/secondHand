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
        cacheTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        retry: 1,
        retryDelay: 1000,
        onError: (error) => {
            console.debug('Showcase fetch failed (this is normal for unauthenticated users):', error.message);
        }
    });

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
