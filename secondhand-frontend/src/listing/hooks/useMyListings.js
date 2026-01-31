import { useEffect, useState, useMemo } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { listingService } from '../services/listingService';
import { useAuth } from '../../auth/AuthContext.jsx';

export const useMyListings = (statusFilter = null, initialPage = 0, initialSize = 10, listingTypeFilter = null) => {
    const { user, isAuthenticated } = useAuth();
    const [page, setPage] = useState(initialPage);
    const [size, setSize] = useState(initialSize);

    useEffect(() => {
        setPage(0);
    }, [user?.id]);

    const { 
        data: paginatedData, 
        isLoading, 
        error, 
        refetch 
    } = useQuery({
        queryKey: ['myListings', user?.id, page, size, listingTypeFilter],
        queryFn: () => listingService.getMyListings(page, size, listingTypeFilter),
        enabled: !!(isAuthenticated && user?.id),
        placeholderData: keepPreviousData,
        staleTime: 1000 * 60,
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