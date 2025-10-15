import { useEffect, useMemo, useState } from 'react';
import { listingService } from '../services/listingService';
import useApi from '../../common/hooks/useApi.js';

export const useMyListings = (statusFilter = null, initialPage = 0, initialSize = 10) => {
    const [page, setPage] = useState(initialPage);
    const [size, setSize] = useState(initialSize);
    const { data: paginatedData, isLoading, error, callApi } = useApi({
        content: [],
        totalPages: 0,
        totalElements: 0,
        number: 0,
        size: initialSize
    });

    const fetchListings = async (pageNum = page, pageSize = size) => {
        await callApi(() => listingService.getMyListings(pageNum, pageSize));
    };

    useEffect(() => {
        fetchListings();
    }, [page, size]);

    const filteredListings = useMemo(() => {
        if (!paginatedData?.content) return [];
        if (!statusFilter) return paginatedData.content;
        return paginatedData.content.filter(listing => listing.status === statusFilter);
    }, [paginatedData?.content, statusFilter]);

    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    const handleSizeChange = (newSize) => {
        setSize(newSize);
        setPage(0); // Reset to first page when size changes
    };

    const refetch = () => fetchListings();

    return {
        listings: filteredListings,
        totalPages: paginatedData?.totalPages || 0,
        totalElements: paginatedData?.totalElements || 0,
        currentPage: paginatedData?.number || 0,
        pageSize: size,
        isLoading,
        error,
        refetch,
        handlePageChange,
        handleSizeChange,
    };
};