import { useState, useEffect, useCallback } from 'react';
import { listingService } from '../services/listingService.js';
import { ERROR_MESSAGES } from '../types/index.js';

export const useListingData = (listingId, autoFetch = true) => {
  const [listing, setListing] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchListing = useCallback(async () => {
    if (!listingId) {
      setError(ERROR_MESSAGES.INVALID_DATA);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await listingService.getListingById(listingId);
      setListing(data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          ERROR_MESSAGES.NETWORK_ERROR;
      setError(errorMessage);
      setListing(null);
    } finally {
      setIsLoading(false);
    }
  }, [listingId]);

  const refetch = useCallback(() => {
    fetchListing();
  }, [fetchListing]);

  const reset = useCallback(() => {
    setListing(null);
    setError(null);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (autoFetch && listingId) {
      fetchListing();
    }
  }, [fetchListing, autoFetch, listingId]);

  return {
    listing,
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
