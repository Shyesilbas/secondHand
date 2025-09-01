import { useEffect } from 'react';
import { listingService } from '../services/listingService';
import { ListingStatisticsDTO } from '../listings.js';
import useApi from '../../hooks/useApi';

export const useListingStatistics = () => {
    const { data, isLoading, error, callApi } = useApi({ ...ListingStatisticsDTO });

    useEffect(() => {
        callApi(listingService.getListingStatistics);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        statistics: data,
        isLoading,
        error,
        refetch: () => callApi(listingService.getListingStatistics)
    };
};