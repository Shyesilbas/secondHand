import { useState, useEffect } from 'react';
import { listingService } from '../../listing/services/listingService.js';

export const useUserListings = (userId, options = {}) => {
    const [listings, setListings] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasBeenFetched, setHasBeenFetched] = useState(false);
    const enabled = options.enabled ?? true;

    const fetchUserListings = async () => {
        if (!userId || !enabled) return;

        setIsLoading(true);
        setError(null);
        try {
            const response = await listingService.getListingByUserId(userId);

            if (response && Array.isArray(response) && response.length > 0) {
                setListings(response);
            } else if (response && Array.isArray(response) && response.length === 0) {
                setListings([]);
            }
            setHasBeenFetched(true);
        } catch (err) {
            console.error('User listings fetch error:', err);
            console.error('Error details:', err.response?.data);

            setError(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (enabled && !hasBeenFetched) {
            fetchUserListings();
        }
    }, [userId, enabled, hasBeenFetched]);

    return {
        listings,
        isLoading,
        error,
        refetch: fetchUserListings
    };
};
