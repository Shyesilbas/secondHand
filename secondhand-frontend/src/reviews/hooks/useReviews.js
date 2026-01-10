import { useState, useEffect, useCallback } from 'react';
import { reviewService } from '../services/reviewService.js';

export const useReviews = (userId, options = {}) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        number: 0,
        size: 10,
        totalPages: 0,
        totalElements: 0,
        first: true,
        last: false
    });
    const enabled = options.enabled ?? true;
    const initialPage = options.page ?? 0;
    const initialSize = options.size ?? 10;

    const fetchReviews = useCallback(async (page = initialPage, size = initialSize) => {
        if (!userId || !enabled) return;
        
        setLoading(true);
        setError(null);
        
        try {
            const response = await reviewService.getReviewsReceivedByUser(userId, page, size);
            const data = response.data || response;
            
            if (data && data.content && Array.isArray(data.content)) {
                setReviews(data.content);
                setPagination({
                    number: data.pageable?.pageNumber || data.number || page,
                    size: data.pageable?.pageSize || data.size || size,
                    totalPages: data.totalPages || 0,
                    totalElements: data.totalElements || 0,
                    first: data.first !== undefined ? data.first : (page === 0),
                    last: data.last !== undefined ? data.last : false
                });
            } else if (data && Array.isArray(data)) {
                // Fallback for non-paginated response (shouldn't happen with new backend)
                setReviews(data);
                setPagination({
                    number: 0,
                    size: data.length,
                    totalPages: 1,
                    totalElements: data.length,
                    first: true,
                    last: true
                });
            } else {
                setReviews([]);
                setPagination({
                    number: 0,
                    size: size,
                    totalPages: 0,
                    totalElements: 0,
                    first: true,
                    last: true
                });
            }
        } catch (err) {
            console.error('Reviews fetch error:', err);
            setError(err.message || 'Failed to fetch reviews');
            setReviews([]);
        } finally {
            setLoading(false);
        }
    }, [userId, enabled, initialPage, initialSize]);

    const loadPage = useCallback((page) => {
        fetchReviews(page, pagination.size);
    }, [fetchReviews, pagination.size]);

    const handlePageSizeChange = useCallback((size) => {
        fetchReviews(0, size);
    }, [fetchReviews]);

    useEffect(() => {
        if (enabled) {
            fetchReviews(initialPage, initialSize);
        }
    }, [userId, enabled, fetchReviews, initialPage, initialSize]);

    return {
        reviews,
        loading,
        error,
        pagination,
        refetch: () => fetchReviews(pagination.number, pagination.size),
        loadPage,
        handlePageSizeChange
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
            const response = await reviewService.getReviewsByUser(userId, 0, 20);
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
