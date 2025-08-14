import { useEffect } from 'react';
import { listingService } from '../services/listingService';
import { ListingResponseDTO } from '../../../types/listings';
import useApi from '../../../hooks/useApi';

export const useListings = (listingType = null, onlyActive = true) => {
  const { data, isLoading, error, callApi, setData } = useApi([]);

  useEffect(() => {
    const run = async () => {
      if (listingType) {
        if (onlyActive) {
          await callApi(listingService.getActiveListingsByType, listingType);
        } else {
          await callApi(listingService.getListingsByTypeOrderByDate, listingType);
        }
      } else {
        await callApi(listingService.getAllListings);
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listingType, onlyActive]);

  return {
    listings: data,
    isLoading,
    error,
    refetch: () => {
      // Re-run the same selection
      if (listingType) {
        if (onlyActive) {
          return callApi(listingService.getActiveListingsByType, listingType);
        }
        return callApi(listingService.getListingsByTypeOrderByDate, listingType);
      }
      return callApi(listingService.getAllListings);
    },
    setListings: setData,
  };
};