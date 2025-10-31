import { useQuery } from '@tanstack/react-query';
import { listingService } from '../services/listingService.js';

const STATISTICS_KEYS = {
    all: ['statistics'],
    listing: () => [...STATISTICS_KEYS.all, 'listing'],
};

export const useListingStatistics = () => {
    const {
        data: statistics,
        isLoading,
        error,
        refetch
    } = useQuery({
        queryKey: STATISTICS_KEYS.listing(),
        queryFn: () => listingService.getListingStatistics(),
        staleTime: 5 * 60 * 1000,
        cacheTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        retry: 2,
        retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    });

    const getCountsByCategory = () => {
        if (!statistics) return {};
        
        return {
            VEHICLE: Number(statistics?.vehicleCount ?? 0),
            ELECTRONICS: Number(statistics?.electronicsCount ?? 0),
            REAL_ESTATE: Number(statistics?.realEstateCount ?? 0),
            CLOTHING: Number(statistics?.clothingCount ?? 0),
            BOOKS: Number(statistics?.booksCount ?? 0),
            SPORTS: Number(statistics?.sportsCount ?? 0),
        };
    };

    return {
        statistics,
        isLoading,
        error,
        refetch,
        countsByCategory: getCountsByCategory(),
    };
};