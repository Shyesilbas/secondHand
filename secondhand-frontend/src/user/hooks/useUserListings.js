import { useState, useEffect } from 'react';
import { listingService } from '../../listing/services/listingService.js';

export const useUserListings = (userId) => {
    const [listings, setListings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchUserListings = async () => {
        if (!userId) return;

        setIsLoading(true);
        setError(null);
        try {
            const response = await listingService.getListingByUserId(userId);

            if (response && Array.isArray(response) && response.length > 0) {
                setListings(response);
            } else if (response && Array.isArray(response) && response.length === 0) {
                setListings([]);
            }
        } catch (err) {
            console.error('User listings fetch error:', err);
            console.error('Error details:', err.response?.data);


            setError(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUserListings();
    }, [userId]);

    return {
        listings,
        isLoading,
        error,
        refetch: fetchUserListings
    };
};
