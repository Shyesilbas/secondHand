import { useQuery } from '@tanstack/react-query';
import { showcaseService } from '../services/showcaseService.js';

const SHOWCASE_PRICING_KEYS = {
    all: ['showcasePricing'],
    pricingConfig: () => [...SHOWCASE_PRICING_KEYS.all, 'pricingConfig']
};

export const useShowcasePricing = () => {
    const {
        data: pricingConfig,
        isLoading,
        error,
        refetch
    } = useQuery({
        queryKey: SHOWCASE_PRICING_KEYS.pricingConfig(),
        queryFn: showcaseService.getPricingConfig,
        staleTime: 10 * 60 * 1000, // 10 minutes
        cacheTime: 30 * 60 * 1000, // 30 minutes
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        retry: 1,
        retryDelay: 1000,
        onError: (error) => {
            console.debug('Showcase pricing fetch failed:', error.message);
        }
    });

    return {
        pricingConfig,
        isLoading,
        error,
        refetch
    };
};

export { SHOWCASE_PRICING_KEYS };
