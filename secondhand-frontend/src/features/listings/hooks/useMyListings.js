import { useEffect } from 'react';
import { listingService } from '../services/listingService';
import useApi from '../../../hooks/useApi';

export const useMyListings = (status = null) => {
    const { data, isLoading, error, callApi } = useApi([]);

    useEffect(() => {
        const run = async () => {
            if (status) {
                await callApi(listingService.getMyListingsByStatus, status);
            } else {
                await callApi(listingService.getMyListings);
            }
        };
        run();
    }, [status]);

    return {
        listings: data,
        isLoading,
        error,
        refetch: () => (status ? callApi(listingService.getMyListingsByStatus, status) : callApi(listingService.getMyListings)),
    };
};