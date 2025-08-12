import { useState, useEffect } from 'react';
import { listingService } from '../services/listingService';
import { ListingFilterDTO, ListingResponseDTO } from '../../../types/listings';

export const useAdvancedListings = () => {
  const [listings, setListings] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    ...ListingFilterDTO
  });

  const fetchListings = async (newFilters = filters) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Clean filters - remove empty values
      const cleanFilters = Object.entries(newFilters).reduce((acc, [key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          if (Array.isArray(value) && value.length === 0) {
            return acc;
          }
          acc[key] = value;
        }
        return acc;
      }, {});

      const response = await listingService.getListingsWithFilters(cleanFilters);
      
      setListings(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
      setCurrentPage(response.number || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'İlanlar yüklenirken bir hata oluştu');
      console.error('Error fetching listings with filters:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateFilters = (newFilters) => {
    const updatedFilters = { ...filters, ...newFilters, page: 0 };
    setFilters(updatedFilters);
    fetchListings(updatedFilters);
  };

  const updatePage = (page) => {
    const updatedFilters = { ...filters, page };
    setFilters(updatedFilters);
    fetchListings(updatedFilters);
  };

  const resetFilters = () => {
    const defaultFilters = { ...ListingFilterDTO };
    setFilters(defaultFilters);
    fetchListings(defaultFilters);
  };

  useEffect(() => {
    fetchListings();
  }, []);

  return {
    listings,
    totalPages,
    totalElements,
    currentPage,
    isLoading,
    error,
    filters,
    updateFilters,
    updatePage,
    resetFilters,
    refetch: () => fetchListings()
  };
};