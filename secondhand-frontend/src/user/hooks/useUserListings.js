import { useState, useEffect, useCallback } from 'react';
import { listingService } from '../../listing/services/listingService.js';

export const useUserListings = (userId, options = {}) => {
    const [listings, setListings] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
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

    const fetchUserListings = useCallback(async (page = initialPage, size = initialSize) => {
        if (!userId || !enabled) return;

        setIsLoading(true);
        setError(null);
        try {
            const response = await listingService.getListingByUserId(userId, page, size);
            const data = response.data || response;

            if (data && data.content && Array.isArray(data.content)) {
                setListings(data.content);
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
                setListings(data);
                setPagination({
                    number: 0,
                    size: data.length,
                    totalPages: 1,
                    totalElements: data.length,
                    first: true,
                    last: true
                });
            } else {
                setListings([]);
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
            console.error('User listings fetch error:', err);
            console.error('Error details:', err.response?.data);
            setError(err.message || 'Failed to fetch listings');
            setListings([]);
        } finally {
            setIsLoading(false);
        }
    }, [userId, enabled, initialPage, initialSize]);

    const loadPage = useCallback((page) => {
        fetchUserListings(page, pagination.size);
    }, [fetchUserListings, pagination.size]);

    const handlePageSizeChange = useCallback((size) => {
        fetchUserListings(0, size);
    }, [fetchUserListings]);

    useEffect(() => {
        if (enabled) {
            fetchUserListings(initialPage, initialSize);
        }
    }, [userId, enabled, fetchUserListings, initialPage, initialSize]);

    return {
        listings,
        isLoading,
        error,
        pagination,
        refetch: () => fetchUserListings(pagination.number, pagination.size),
        loadPage,
        handlePageSizeChange
    };
};
