import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listingService } from '../services/listingService.js';
import { useListingFilters } from './useListingFilters.js';
import { cleanObject } from '../../common/formatters.js';

// Query keys for react-query
const LISTINGS_KEYS = {
    all: ['listings'],
    filtered: (filters) => [...LISTINGS_KEYS.all, 'filtered', filters],
};

/**
 * Optimized advanced listings hook using React Query
 * Prevents unnecessary API calls and provides caching
 */
export const useAdvancedListingsQuery = (initialFilters = {}) => {
    const {
        filters,
        updateFilters,
        updatePage,
        resetFilters,
        hasActiveFilters,
        getActiveFilterCount
    } = useListingFilters(initialFilters);

    // Clean filters to create stable query key
    const cleanedFilters = useMemo(() => {
        return cleanObject(filters);
    }, [filters]);

    // Create stable query key
    const queryKey = useMemo(() => 
        LISTINGS_KEYS.filtered(cleanedFilters), 
        [cleanedFilters]
    );

    // Use React Query for listings with caching
    const {
        data: queryData,
        isLoading,
        error: queryError,
        refetch
    } = useQuery({
        queryKey,
        queryFn: () => listingService.filterListings(cleanedFilters),
        enabled: !!cleanedFilters.listingType, // Only fetch if we have a listing type
        staleTime: 2 * 60 * 1000, // Data is fresh for 2 minutes
        cacheTime: 5 * 60 * 1000, // Cache for 5 minutes
        refetchOnWindowFocus: false,
        refetchOnMount: false, // Don't refetch on every mount
        keepPreviousData: true, // Keep previous data while fetching new
        retry: 2,
        retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    });

    // Extract data with fallbacks
    const listings = queryData?.content || [];
    const totalPages = queryData?.totalPages || 0;
    const totalElements = queryData?.totalElements || 0;
    const currentPage = queryData?.number || 0;
    const error = queryError?.message || null;

    // Wrapper functions for backward compatibility
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
