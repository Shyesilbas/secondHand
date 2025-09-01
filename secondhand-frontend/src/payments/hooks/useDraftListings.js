import { useState, useEffect } from 'react';
import { listingService } from '../../listing/services/listingService.js';

export const useDraftListings = () => {
    const [draftListings, setDraftListings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDraftListings = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await listingService.getMyListingsByStatus('DRAFT');
            setDraftListings(data);
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred while fetching listings. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDraftListings();
    }, []);

    return {
        draftListings,
        isLoading,
        error,
        refetch: fetchDraftListings
    };
};
