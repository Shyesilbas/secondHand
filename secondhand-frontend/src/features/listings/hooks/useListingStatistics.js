import { useState, useEffect } from 'react';
import { listingService } from '../services/listingService';
import { ListingStatisticsDTO } from '../../../types/listings';

export const useListingStatistics = () => {
    const [statistics, setStatistics] = useState({...ListingStatisticsDTO});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStatistics = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const data = await listingService.getListingStatistics();
                setStatistics(data);
            } catch (err) {
                console.error('Failed to fetch listing statistics:', err);
                setError(err.response?.data?.message || 'Failed to load statistics');
            } finally {
                setIsLoading(false);
            }
        };

        fetchStatistics();
    }, []);

    return {
        statistics,
        isLoading,
        error,
        refetch: () => {
            const fetchStatistics = async () => {
                try {
                    setIsLoading(true);
                    setError(null);
                    const data = await listingService.getListingStatistics();
                    setStatistics(data);
                } catch (err) {
                    console.error('Failed to fetch listing statistics:', err);
                    setError(err.response?.data?.message || 'Failed to load statistics');
                } finally {
                    setIsLoading(false);
                }
            };
            fetchStatistics();
        }
    };
};