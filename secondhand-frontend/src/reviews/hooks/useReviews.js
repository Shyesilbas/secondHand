import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reviewService } from '../services/reviewService.js';

const REVIEW_KEYS = {
    received: (userId, page, size) => ['reviews', 'received', userId, page, size],
    written: (userId) => ['reviews', 'written', userId],
    stats: (userId) => ['reviewStats', userId],
};

export const useReviews = (userId, options = {}) => {
    const enabled = options.enabled ?? true;
    const initialPage = options.page ?? 0;
    const initialSize = options.size ?? 10;
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [currentSize, setCurrentSize] = useState(initialSize);

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: REVIEW_KEYS.received(userId, currentPage, currentSize),
        queryFn: () => reviewService.getReviewsReceivedByUser(userId, currentPage, currentSize),
        enabled: !!(userId && enabled),
        staleTime: 5 * 60 * 1000,
        gcTime: 15 * 60 * 1000,
        refetchOnWindowFocus: false,
        placeholderData: (prev) => prev,
    });

    const reviews = data?.content ?? (Array.isArray(data) ? data : []);
    const pagination = {
        number: data?.number ?? currentPage,
        size: data?.size ?? currentSize,
        totalPages: data?.totalPages ?? 0,
        totalElements: data?.totalElements ?? 0,
        first: data?.first ?? (currentPage === 0),
        last: data?.last ?? false,
    };

    const loadPage = useCallback((page) => setCurrentPage(page), []);
    const handlePageSizeChange = useCallback((size) => {
        setCurrentSize(size);
        setCurrentPage(0);
    }, []);

    return {
        reviews,
        loading: isLoading,
        error: error?.message || null,
        pagination,
        refetch,
        loadPage,
        handlePageSizeChange,
    };
};

export const useReviewsByUser = (userId, options = {}) => {
    const enabled = options.enabled ?? true;

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: REVIEW_KEYS.written(userId),
        queryFn: () => reviewService.getReviewsByUser(userId, 0, 20),
        enabled: !!(userId && enabled),
        staleTime: 5 * 60 * 1000,
        gcTime: 15 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    return {
        reviews: data?.content ?? [],
        loading: isLoading,
        error: error?.message || null,
        refresh: refetch,
    };
};

export const useUserReviewStats = (userId, options = {}) => {
    const enabled = options.enabled ?? true;

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: REVIEW_KEYS.stats(userId),
        queryFn: () => reviewService.getUserReviewStats(userId),
        enabled: !!(userId && enabled),
        staleTime: 5 * 60 * 1000,
        gcTime: 15 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    return {
        stats: data ?? null,
        loading: isLoading,
        error: error?.message || null,
        refresh: refetch,
    };
};
