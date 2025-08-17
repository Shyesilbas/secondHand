import { useState, useEffect } from 'react';
import { realEstateService } from '../services/realEstateService';

export const useRealEstate = (realEstateId = null) => {
  const [realEstate, setRealEstate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRealEstate = async (id = realEstateId) => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const data = await realEstateService.getRealEstateById(id);
      setRealEstate(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error occurred while fetching real estate. Please try again later.');
      console.error('Error fetching real estate:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const createRealEstate = async (realEstateData) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await realEstateService.createRealEstateListing(realEstateData);
      return response;
    } catch (err) {
      setError(err.response?.data?.message || 'Error occurred while creating real estate. Please try again later.');
      console.error('Error creating real estate:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateRealEstate = async (id, realEstateData) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await realEstateService.updateRealEstateListing(id, realEstateData);
      // Optimistic update: merge changes locally to avoid full page refresh
      setRealEstate(prev => ({ ...prev, ...(realEstateData || {}) }));
      // Also refetch in background to stay consistent with backend
      fetchRealEstate(id);
      return response;
    } catch (err) {
      setError(err.response?.data?.message || 'Error occurred while updating real estate. Please try again later.');
      console.error('Error updating real estate:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (realEstateId) {
      fetchRealEstate();
    }
  }, [realEstateId]);

  return {
    realEstate,
    isLoading,
    error,
    fetchRealEstate,
    createRealEstate,
    updateRealEstate,
    refetch: () => fetchRealEstate(realEstateId),
  };
};

// Hook for real estate search operations
export const useRealEstateSearch = () => {
  const [realEstates, setRealEstates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchWithFilters = async (filters) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await realEstateService.filterRealEstates(filters);
      setRealEstates(data.content || data); // Handle paginated vs non-paginated responses
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Error occurred while filtering real estates. Please try again later.');
      console.error('Error filtering real estates:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    realEstates,
    isLoading,
    error,
    searchWithFilters,
    clearResults: () => setRealEstates([]),
  };
};
