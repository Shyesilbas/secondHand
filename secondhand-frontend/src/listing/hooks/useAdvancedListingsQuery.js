import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listingService } from '../services/listingService.js';
import { useListingFilters } from './useListingFilters.js';
import { cleanObject } from '../../common/formatters.js';

const LISTINGS_KEYS = {
    all: ['listings'],
    filtered: (filters) => [...LISTINGS_KEYS.all, 'filtered', filters],
};

export const useAdvancedListingsQuery = (initialFilters = {}) => {
    const {
        filters,
        updateFilters,
        updatePage,
        resetFilters,
        hasActiveFilters,
        getActiveFilterCount
    } = useListingFilters(initialFilters);

        const cleanedFilters = useMemo(() => {
        return cleanObject(filters);
    }, [filters]);

        const queryKey = useMemo(() => 
        LISTINGS_KEYS.filtered(cleanedFilters), 
        [cleanedFilters]
    );

        const {
        data: queryData,
        isLoading,
        error: queryError,
        refetch
    } = useQuery({
        queryKey,
        queryFn: () => listingService.filterListings(cleanedFilters),
        enabled: !!cleanedFilters.listingType,         staleTime: 2 * 60 * 1000,         cacheTime: 5 * 60 * 1000,         refetchOnWindowFocus: false,
        refetchOnMount: false,         keepPreviousData: true,         retry: 2,
        retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    });

        const listings = queryData?.content || [];
    const totalPages = queryData?.totalPages || 0;
    const totalElements = queryData?.totalElements || 0;
    
    // Try multiple possible field names for current page with safe fallback
    const currentPage = Number(queryData?.number ?? 
                       queryData?.pageable?.pageNumber ?? 
                       queryData?.page ?? 
                       filters?.page ?? 
                       0) || 0;
    
    const error = queryError?.message || null;

        const handleUpdateFilters = (newFilters) => {
        updateFilters(newFilters);
    };

    const handleUpdatePage = (page) => {
        updatePage(page);
    };

    const handleResetFilters = () => {
        resetFilters();
    };

    const refreshListings = () => {
        refetch();
    };

    return {
        listings,
        totalPages,
        totalElements,
        currentPage,
        isLoading,
        error,
        filters,
        updateFilters: handleUpdateFilters,
        updatePage: handleUpdatePage,
        resetFilters: handleResetFilters,
        refreshListings,
        refetch: refreshListings,
        hasActiveFilters,
        getActiveFilterCount
    };
};

export { LISTINGS_KEYS };
