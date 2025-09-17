import { useState, useEffect } from 'react';
import { showcaseService } from '../services/showcaseService.js';

export const useShowcase = () => {
    const [showcases, setShowcases] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchShowcases = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await showcaseService.getActiveShowcases();
            setShowcases(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const createShowcase = async (listingId, days) => {
        try {
            setLoading(true);
            setError(null);
            const data = await showcaseService.createShowcase(listingId, days);
            await fetchShowcases(); // Refresh the list
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const extendShowcase = async (showcaseId, days) => {
        try {
            setLoading(true);
            setError(null);
            await showcaseService.extendShowcase(showcaseId, days);
            await fetchShowcases(); // Refresh the list
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const cancelShowcase = async (showcaseId) => {
        try {
            setLoading(true);
            setError(null);
            await showcaseService.cancelShowcase(showcaseId);
            await fetchShowcases(); // Refresh the list
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShowcases();
    }, []);

    return {
        showcases,
        loading,
        error,
        fetchShowcases,
        createShowcase,
        extendShowcase,
        cancelShowcase
    };
};
