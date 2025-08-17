import { useState, useEffect, useCallback } from 'react';
import { listingService } from '../services/listingService';
import { useListingFilters } from './useListingFilters';
import { cleanObject } from '../../../utils/formatters';

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

  const fetchListings = useCallback(async (newFilters = filters) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Clean filters - remove empty values using shared util
      const cleanFilters = cleanObject(newFilters);
      
      // Use smart filtering that automatically chooses the right endpoint
      console.log('[useAdvancedListings] cleanFilters:', cleanFilters);
      const response = await listingService.filterListings(cleanFilters);
      console.log('[useAdvancedListings] response:', response);
      
      setListings(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
      setCurrentPage(response.number || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Error loading listings');
      console.error('Error fetching listings with filters:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

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

  // Fetch listings when filters change
  useEffect(() => {
    fetchListings();
  }, [filters]);

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