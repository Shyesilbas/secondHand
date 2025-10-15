import { useState, useEffect } from 'react';
import { reviewService } from '../services/reviewService.js';

export const useReviews = (userId, options = {}) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [hasBeenFetched, setHasBeenFetched] = useState(false);
    const enabled = options.enabled ?? true;

    const fetchReviews = async (pageNum = 0, reset = false) => {
        if (!enabled) return;
        
        setLoading(true);
        setError(null);
        
        try {
            const response = await reviewService.getReviewsForUser(pageNum, 10);
            
            if (reset) {
                setReviews(response.content || []);
            } else {
                setReviews(prev => [...prev, ...(response.content || [])]);
            }
            
            setHasMore(!response.last);
            setPage(pageNum);
            setHasBeenFetched(true);
        } catch (err) {
            setError(err.message || 'Failed to fetch reviews');
        } finally {
            setLoading(false);
        }
    };

    const loadMore = () => {
        if (!loading && hasMore && enabled) {
            fetchReviews(page + 1, false);
        }
    };

    const refresh = () => {
        if (enabled) {
            fetchReviews(0, true);
        }
    };

    useEffect(() => {
        if (enabled && !hasBeenFetched) {
            fetchReviews(0, true);
        }
    }, [enabled, hasBeenFetched]);

    return {
        reviews,
        loading,
        error,
        hasMore,
        loadMore,
        refresh
    };
};

export const useReviewsByUser = (userId, options = {}) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasBeenFetched, setHasBeenFetched] = useState(false);
    const enabled = options.enabled ?? true;

    const fetchReviews = async () => {
        if (!userId || !enabled) return;
        
        setLoading(true);
        setError(null);
        
        try {
            const response = await reviewService.getReviewsByUser(userId, 0, 100);
            setReviews(response.content || []);
            setHasBeenFetched(true);
        } catch (err) {
            setError(err.message || 'Failed to fetch reviews');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (enabled && !hasBeenFetched) {
            fetchReviews();
        }
    }, [userId, enabled, hasBeenFetched]);

    return {
        reviews,
        loading,
        error,
        refresh: fetchReviews
    };
};

export const useUserReviewStats = (userId, options = {}) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const enabled = options.enabled ?? true;

    const fetchStats = async () => {
        if (!userId) return;
        
        setLoading(true);
        setError(null);
        
        try {
            const response = await reviewService.getUserReviewStats(userId);
            setStats(response);
        } catch (err) {
            setError(err.message || 'Failed to fetch review stats');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (enabled) {
            fetchStats();
        }
    }, [userId, enabled]);

    return {
        stats,
        loading,
        error,
        refresh: fetchStats
    };
};
