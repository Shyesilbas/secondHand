import { useState, useMemo } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { listingService } from '../services/listingService';

export const useMyListings = (statusFilter = null, initialPage = 0, initialSize = 10) => {
    const [page, setPage] = useState(initialPage);
    const [size, setSize] = useState(initialSize);

    const { 
        data: paginatedData, 
        isLoading, 
        error, 
        refetch 
    } = useQuery({
        queryKey: ['myListings', page, size],
        queryFn: () => listingService.getMyListings(page, size),
        placeholderData: keepPreviousData,
        staleTime: 1000 * 60, // 1 minute
    });

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