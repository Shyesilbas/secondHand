import { useEffect } from 'react';
import { listingService } from '../services/listingService';
import { ListingStatisticsDTO } from '../listings.js';
import useApi from '../../common/hooks/useApi';

export const useListingStatistics = () => {
    const { data, isLoading, error, callApi } = useApi({ ...ListingStatisticsDTO });

    useEffect(() => {
        useApi(listingService.getListingStatistics);
    }, []);

    return {
        statistics: data,
        isLoading,
        error,
        refetch: () => callApi(listingService.getListingStatistics)
    };
};