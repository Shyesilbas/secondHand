import { useEffect, useMemo } from 'react';
import { listingService } from '../services/listingService';
import useApi from '../../common/hooks/useApi.js';

export const useMyListings = (statusFilter = null) => {
    const { data: allListings, isLoading, error, callApi } = useApi([]);

    useEffect(() => {
        const run = async () => {
            await callApi(listingService.getMyListings);
        };
        run();
    }, []);

    const filteredListings = useMemo(() => {
        if (!allListings) return [];
        if (!statusFilter) return allListings;
        return allListings.filter(listing => listing.status === statusFilter);
    }, [allListings, statusFilter]);

    const refetch = () => callApi(listingService.getMyListings);

    return {
        allListings,
        listings: filteredListings,
        isLoading,
        error,
        refetch,
    };
};