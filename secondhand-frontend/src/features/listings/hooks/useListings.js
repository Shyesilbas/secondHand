import { useState, useEffect } from 'react';
import { listingService } from '../services/listingService';
import { ListingResponseDTO } from '../../../types/listings';

export const useListings = (listingType = null, onlyActive = true) => {
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchListings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      let data;
      if (listingType) {
        if (onlyActive) {
          data = await listingService.getActiveListingsByType(listingType);
        } else {
          data = await listingService.getListingsByTypeOrderByDate(listingType);
        }
      } else {
        data = await listingService.getAllListings();
      }
      
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
  }, [listingType, onlyActive]);

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