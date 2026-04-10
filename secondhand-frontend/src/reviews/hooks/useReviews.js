import { useState, useCallback, useMemo } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { reviewService } from '../services/reviewService.js';
import { REVIEW_DEFAULTS } from '../reviewConstants.js';

const REVIEW_KEYS = {
    received: (userId, size) => ['reviews', 'received', userId, size],
    written: (userId, size) => ['reviews', 'written', userId, size],
    stats: (userId) => ['reviewStats', userId],
};

const nextPageParamFromSpring = (lastPage) => {
    if (!lastPage) return undefined;
    const number = lastPage.number ?? 0;
    const totalPages = lastPage.totalPages ?? 0;
    if (totalPages === 0 || number >= totalPages - 1) return undefined;
    return number + 1;
};

export const useReviews = (userId, options = {}) => {
    const enabled = options.enabled ?? true;
    const initialSize = options.size ?? REVIEW_DEFAULTS.RECEIVED_SIZE;
    const [currentSize, setCurrentSize] = useState(initialSize);

    const {
        data,
        isLoading,
        isFetchingNextPage,
        error,
        refetch,
        fetchNextPage,
        hasNextPage,
    } = useInfiniteQuery({
        queryKey: REVIEW_KEYS.received(userId, currentSize),
        queryFn: ({ pageParam }) => reviewService.getReviewsReceivedByUser(userId, pageParam, currentSize),
        initialPageParam: REVIEW_DEFAULTS.RECEIVED_PAGE,
        getNextPageParam: (lastPage) => nextPageParamFromSpring(lastPage),
        enabled: !!(userId && enabled),
        staleTime: REVIEW_DEFAULTS.STALE_TIME_MS,
        gcTime: REVIEW_DEFAULTS.GC_TIME_MS,
        refetchOnWindowFocus: false,
    });

    const reviews = useMemo(
        () => data?.pages?.flatMap((p) => p?.content ?? []) ?? [],
        [data?.pages]
    );

    const lastPage = data?.pages?.length ? data.pages[data.pages.length - 1] : null;
    const pagination = {
        number: lastPage?.number ?? REVIEW_DEFAULTS.RECEIVED_PAGE,
        size: lastPage?.size ?? currentSize,
        totalPages: lastPage?.totalPages ?? 0,
        totalElements: lastPage?.totalElements ?? 0,
        first: lastPage?.first ?? true,
        last: lastPage?.last ?? true,
    };

    const loadMore = useCallback(() => {
        if (hasNextPage) fetchNextPage();
    }, [fetchNextPage, hasNextPage]);

    const handlePageSizeChange = useCallback((size) => {
        setCurrentSize(size);
    }, []);

    return {
        reviews,
        loading: isLoading || isFetchingNextPage,
        error: error?.message || null,
        pagination,
        refetch,
        hasMore: Boolean(hasNextPage),
        loadMore,
        handlePageSizeChange,
    };
};

export const useReviewsByUser = (userId, options = {}) => {
    const enabled = options.enabled ?? true;
    const pageSize = options.size ?? REVIEW_DEFAULTS.WRITTEN_SIZE;

    const {
        data,
        isLoading,
        isFetchingNextPage,
        error,
        refetch,
        fetchNextPage,
        hasNextPage,
    } = useInfiniteQuery({
        queryKey: REVIEW_KEYS.written(userId, pageSize),
        queryFn: ({ pageParam }) => reviewService.getReviewsByUser(userId, pageParam, pageSize),
        initialPageParam: REVIEW_DEFAULTS.WRITTEN_PAGE,
        getNextPageParam: (lastPage) => nextPageParamFromSpring(lastPage),
        enabled: !!(userId && enabled),
        staleTime: REVIEW_DEFAULTS.STALE_TIME_MS,
        gcTime: REVIEW_DEFAULTS.GC_TIME_MS,
        refetchOnWindowFocus: false,
    });

    const reviews = useMemo(
        () => data?.pages?.flatMap((p) => p?.content ?? []) ?? [],
        [data?.pages]
    );

    const loadMore = useCallback(() => {
        if (hasNextPage) fetchNextPage();
    }, [fetchNextPage, hasNextPage]);

    return {
        reviews,
        loading: isLoading || isFetchingNextPage,
        error: error?.message || null,
        refresh: refetch,
        refetch,
        hasMore: Boolean(hasNextPage),
        loadMore,
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
