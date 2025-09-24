import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { showcaseService } from '../services/showcaseService.js';

const SHOWCASE_KEYS = {
    all: ['showcases'],
    active: () => [...SHOWCASE_KEYS.all, 'active'],
    userShowcases: () => [...SHOWCASE_KEYS.all, 'user']
};

export const useShowcase = () => {
    const [error, setError] = useState(null);
    const queryClient = useQueryClient();

        const {
        data: showcases = [],
        isLoading: loading,
        error: queryError,
        refetch: fetchShowcases
    } = useQuery({
        queryKey: SHOWCASE_KEYS.active(),
        queryFn: showcaseService.getActiveShowcases,
        staleTime: 5 * 60 * 1000,         cacheTime: 10 * 60 * 1000,         refetchOnWindowFocus: false,
        refetchOnMount: false,         onError: (err) => setError(err.message)
    });

        const createShowcaseMutation = useMutation({
        mutationFn: ({ listingId, days, paymentType }) => 
            showcaseService.createShowcase(listingId, days, paymentType),
        onSuccess: () => {
                        queryClient.invalidateQueries({ queryKey: SHOWCASE_KEYS.active() });
            queryClient.invalidateQueries({ queryKey: SHOWCASE_KEYS.userShowcases() });
        },
        onError: (err) => setError(err.message)
    });

        const extendShowcaseMutation = useMutation({
        mutationFn: ({ showcaseId, days }) => 
            showcaseService.extendShowcase(showcaseId, days),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: SHOWCASE_KEYS.active() });
            queryClient.invalidateQueries({ queryKey: SHOWCASE_KEYS.userShowcases() });
        },
        onError: (err) => setError(err.message)
    });

        const cancelShowcaseMutation = useMutation({
        mutationFn: (showcaseId) => showcaseService.cancelShowcase(showcaseId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: SHOWCASE_KEYS.active() });
            queryClient.invalidateQueries({ queryKey: SHOWCASE_KEYS.userShowcases() });
        },
        onError: (err) => setError(err.message)
    });

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
