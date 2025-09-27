import { useQuery } from '@tanstack/react-query';
import { pricingService } from '../services/pricingService.js';

const PRICING_KEYS = {
    all: ['pricing'],
    feeConfig: () => [...PRICING_KEYS.all, 'feeConfig']
};

export const usePricing = () => {
    const {
        data: feeConfig,
        isLoading,
        error,
        refetch
    } = useQuery({
        queryKey: PRICING_KEYS.feeConfig(),
        queryFn: pricingService.getListingFeeConfig,
        staleTime: 10 * 60 * 1000, // 10 minutes
        cacheTime: 30 * 60 * 1000, // 30 minutes
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        retry: 1,
        retryDelay: 1000,
        onError: (error) => {
            console.debug('Pricing fetch failed:', error.message);
        }
    });

    return {
        feeConfig,
        isLoading,
        error,
        refetch
    };
};

export { PRICING_KEYS };
