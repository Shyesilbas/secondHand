import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listingService } from '../services/listingService.js';
import { ERROR_MESSAGES } from '../types/index.js';

const LISTING_KEYS = {
  all: ['listings'],
  detail: (id) => [...LISTING_KEYS.all, 'detail', id],
};

export const useListingData = (listingId, autoFetch = true) => {
  const {
    data: listing,
    isLoading,
    error: queryError,
    refetch,
    isError
  } = useQuery({
    queryKey: LISTING_KEYS.detail(listingId),
    queryFn: () => {
      console.log('🔍 useListingData: Fetching listing', listingId);
      return listingService.getListingById(listingId);
    },
    enabled: autoFetch && !!listingId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const error = isError ? (queryError?.response?.data?.message || queryError?.message || ERROR_MESSAGES.NETWORK_ERROR) : null;

  const reset = useCallback(() => {
    // React Query handles this automatically
  }, []);

  const fetchListing = useCallback(() => {
    refetch();
  }, [refetch]);

  return {
    listing: listing || null,
    isLoading,
    error,
    refetch,
    reset,
    fetchListing
  };
};

export const useListingsData = (fetchFunction, initialFilters = {}) => {
  const [listings, setListings] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchListings = useCallback(async (filters = initialFilters) => {
    if (!fetchFunction || typeof fetchFunction !== 'function') {
      setError(ERROR_MESSAGES.INVALID_DATA);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetchFunction(filters);
      
      setListings(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
      setCurrentPage(response.number || 0);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          ERROR_MESSAGES.NETWORK_ERROR;
      setError(errorMessage);
      setListings([]);
    } finally {
      setIsLoading(false);
    }
  }, [fetchFunction, initialFilters]);

  const refetch = useCallback((filters) => {
    fetchListings(filters);
  }, [fetchListings]);

  const reset = useCallback(() => {
    setListings([]);
    setTotalPages(0);
    setTotalElements(0);
    setCurrentPage(0);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    listings,
    totalPages,
    totalElements,
    currentPage,
    isLoading,
    error,
    refetch,
    reset,
    fetchListings
  };
};

export default useListingData;
