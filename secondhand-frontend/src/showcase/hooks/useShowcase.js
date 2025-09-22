import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { showcaseService } from '../services/showcaseService.js';

// Query keys for react-query
const SHOWCASE_KEYS = {
    all: ['showcases'],
    active: () => [...SHOWCASE_KEYS.all, 'active'],
    userShowcases: () => [...SHOWCASE_KEYS.all, 'user']
};

export const useShowcase = () => {
    const [error, setError] = useState(null);
    const queryClient = useQueryClient();

    // Use React Query for caching active showcases
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
        refetchOnMount: false, // Don't refetch on every mount
        onError: (err) => setError(err.message)
    });

    // Create showcase mutation
    const createShowcaseMutation = useMutation({
        mutationFn: ({ listingId, days, paymentType }) => 
            showcaseService.createShowcase(listingId, days, paymentType),
        onSuccess: () => {
            // Invalidate and refetch active showcases
            queryClient.invalidateQueries({ queryKey: SHOWCASE_KEYS.active() });
            queryClient.invalidateQueries({ queryKey: SHOWCASE_KEYS.userShowcases() });
        },
        onError: (err) => setError(err.message)
    });

    // Extend showcase mutation
    const extendShowcaseMutation = useMutation({
        mutationFn: ({ showcaseId, days }) => 
            showcaseService.extendShowcase(showcaseId, days),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: SHOWCASE_KEYS.active() });
            queryClient.invalidateQueries({ queryKey: SHOWCASE_KEYS.userShowcases() });
        },
        onError: (err) => setError(err.message)
    });

    // Cancel showcase mutation
    const cancelShowcaseMutation = useMutation({
        mutationFn: (showcaseId) => showcaseService.cancelShowcase(showcaseId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: SHOWCASE_KEYS.active() });
            queryClient.invalidateQueries({ queryKey: SHOWCASE_KEYS.userShowcases() });
        },
        onError: (err) => setError(err.message)
    });

    // Wrapper functions for backward compatibility
    const createShowcase = (listingId, days, paymentType) => 
        createShowcaseMutation.mutateAsync({ listingId, days, paymentType });

    const extendShowcase = (showcaseId, days) => 
        extendShowcaseMutation.mutateAsync({ showcaseId, days });

    const cancelShowcase = (showcaseId) => 
        cancelShowcaseMutation.mutateAsync(showcaseId);

    return {
        showcases,
        loading: loading || createShowcaseMutation.isLoading || 
                extendShowcaseMutation.isLoading || cancelShowcaseMutation.isLoading,
        error: error || queryError?.message,
        fetchShowcases,
        createShowcase,
        extendShowcase,
        cancelShowcase
    };
};
