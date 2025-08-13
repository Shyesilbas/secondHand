import { useEffect, useState } from 'react';
import { listingService } from '../services/listingService';

export const useMyListings = () => {
    const [listings, setListings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchMyListings = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await listingService.getMyListings();
            setListings(data);
        } catch (err) {
            setError(err.response?.data?.message || 'İlanlarınız yüklenirken bir hata oluştu');
            console.error('Error fetching my listings:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMyListings();
    }, []);

    const refetch = () => {
        fetchMyListings();
    };

    return {
        listings,
        isLoading,
        error,
        refetch,
    };
};