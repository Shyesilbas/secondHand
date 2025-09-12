import { useState, useEffect } from 'react';
import { reviewService } from '../services/reviewService.js';

export const useReviews = (userId) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    const fetchReviews = async (pageNum = 0, reset = false) => {
        if (!userId) return;
        
        setLoading(true);
        setError(null);
        
        try {
            const response = await reviewService.getReviewsForUser(userId, pageNum, 10);
            
            if (reset) {
                setReviews(response.content || []);
            } else {
                setReviews(prev => [...prev, ...(response.content || [])]);
            }
            
            setHasMore(!response.last);
            setPage(pageNum);
        } catch (err) {
            setError(err.message || 'Failed to fetch reviews');
        } finally {
            setLoading(false);
        }
    };

    const loadMore = () => {
        if (!loading && hasMore) {
            fetchReviews(page + 1, false);
        }
    };

    const refresh = () => {
        fetchReviews(0, true);
    };

    useEffect(() => {
        fetchReviews(0, true);
    }, [userId]);

    return {
        reviews,
        loading,
        error,
        hasMore,
        loadMore,
        refresh
    };
};

export const useReviewsByUser = (userId) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchReviews = async () => {
        if (!userId) return;
        
        setLoading(true);
        setError(null);
        
        try {
            const response = await reviewService.getReviewsByUser(userId, 0, 100);
            setReviews(response.content || []);
        } catch (err) {
            setError(err.message || 'Failed to fetch reviews');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [userId]);

    return {
        reviews,
        loading,
        error,
        refresh: fetchReviews
    };
};

export const useUserReviewStats = (userId) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

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
        fetchStats();
    }, [userId]);

    return {
        stats,
        loading,
        error,
        refresh: fetchStats
    };
};
