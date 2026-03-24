import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reviewService } from '../services/reviewService.js';
import { REVIEW_DEFAULTS } from '../reviewConstants.js';

const REVIEW_KEYS = {
    received: (userId, page, size) => ['reviews', 'received', userId, page, size],
    written: (userId) => ['reviews', 'written', userId],
    stats: (userId) => ['reviewStats', userId],
};

export const useReviews = (userId, options = {}) => {
    const enabled = options.enabled ?? true;
    const initialPage = options.page ?? REVIEW_DEFAULTS.RECEIVED_PAGE;
    const initialSize = options.size ?? REVIEW_DEFAULTS.RECEIVED_SIZE;
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [currentSize, setCurrentSize] = useState(initialSize);

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: REVIEW_KEYS.received(userId, currentPage, currentSize),
        queryFn: () => reviewService.getReviewsReceivedByUser(userId, currentPage, currentSize),
        enabled: !!(userId && enabled),
        staleTime: REVIEW_DEFAULTS.STALE_TIME_MS,
        gcTime: REVIEW_DEFAULTS.GC_TIME_MS,
        refetchOnWindowFocus: false,
        placeholderData: (prev) => prev,
    });

    const reviews = data?.content ?? (Array.isArray(data) ? data : []);
    const pagination = {
        number: data?.number ?? currentPage,
        size: data?.size ?? currentSize,
        totalPages: data?.totalPages ?? 0,
        totalElements: data?.totalElements ?? 0,
        first: data?.first ?? (currentPage === REVIEW_DEFAULTS.RECEIVED_PAGE),
        last: data?.last ?? false,
    };

    const loadPage = useCallback((page) => setCurrentPage(page), []);
    const handlePageSizeChange = useCallback((size) => {
        setCurrentSize(size);
        setCurrentPage(REVIEW_DEFAULTS.RECEIVED_PAGE);
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
        queryFn: () => reviewService.getReviewsByUser(userId, REVIEW_DEFAULTS.WRITTEN_PAGE, REVIEW_DEFAULTS.WRITTEN_SIZE),
        enabled: !!(userId && enabled),
        staleTime: REVIEW_DEFAULTS.STALE_TIME_MS,
        gcTime: REVIEW_DEFAULTS.GC_TIME_MS,
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
        staleTime: REVIEW_DEFAULTS.STALE_TIME_MS,
        gcTime: REVIEW_DEFAULTS.GC_TIME_MS,
        refetchOnWindowFocus: false,
    });

    return {
        stats: data ?? null,
        loading: isLoading,
        error: error?.message || null,
        refresh: refetch,
    };
};
