import { useState, useEffect, useCallback, useMemo } from 'react';
import { listingService } from '../services/listingService.js';
import { useListingFilters } from './useListingFilters.js';
import { cleanObject } from '../../common/formatters.js';
import { ERROR_MESSAGES } from '../types/index.js';

export const useAdvancedListings = (initialFilters = {}, listingType = null) => {
  const [listings, setListings] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Use the new filter management hook
  const {
    filters,
    updateFilters,
    updatePage,
    resetFilters,
    hasActiveFilters,
    getActiveFilterCount
  } = useListingFilters(initialFilters, listingType);

  // Memoize cleaned filters to prevent unnecessary API calls
  const cleanedFilters = useMemo(() => {
    return cleanObject(filters);
  }, [filters]);

  const fetchListings = useCallback(async (newFilters = cleanedFilters) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Use smart filtering that automatically chooses the right endpoint
      const response = await listingService.filterListings(newFilters);
      
      setListings(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
      setCurrentPage(response.number || 0);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          ERROR_MESSAGES.NETWORK_ERROR;
      setError(errorMessage);
      console.error('Error fetching listings with filters:', err);
      
      // Reset listings on error
      setListings([]);
      setTotalPages(0);
      setTotalElements(0);
      setCurrentPage(0);
    } finally {
      setIsLoading(false);
    }
  }, [cleanedFilters]);

  const handleUpdateFilters = useCallback((newFilters) => {
    updateFilters(newFilters);
  }, [updateFilters]);

  const handleUpdatePage = useCallback((page) => {
    updatePage(page);
  }, [updatePage]);

  const handleResetFilters = useCallback(() => {
    resetFilters();
  }, [resetFilters]);

  const refreshListings = useCallback(() => {
    fetchListings();
  }, [fetchListings]);

  // Fetch listings when cleaned filters change
  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

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