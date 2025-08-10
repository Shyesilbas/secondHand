import { useState, useEffect } from 'react';
import { listingService } from '../services/listingService';

export const useListings = () => {
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchListings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await listingService.getAllListings();
      setListings(data);
    } catch (err) {
      setError(err.response?.data?.message || 'İlanlar yüklenirken bir hata oluştu');
      console.error('Error fetching listings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const refetch = () => {
    fetchListings();
  };

  return {
    listings,
    isLoading,
    error,
    refetch,
  };
};