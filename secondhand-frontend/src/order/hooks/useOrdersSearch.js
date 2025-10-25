import { useState, useCallback } from 'react';
import { orderService } from '../services/orderService.js';

export const useOrdersSearch = (setSearchOrder, refresh) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState(null);
    const [isSearchMode, setIsSearchMode] = useState(false);

    const handleSearch = useCallback(async (e) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;

        setSearchLoading(true);
        setSearchError(null);

        try {
            const order = await orderService.getByOrderNumber(searchTerm.trim());
            if (order) {
                setSearchOrder(order);
                setIsSearchMode(true);
                setSearchTerm('');
            }
        } catch (error) {
            setSearchError('Order not found. Please check the order number.');
            console.error('Search error:', error);
        } finally {
            setSearchLoading(false);
        }
    }, [searchTerm, setSearchOrder]);

    const clearSearch = useCallback(() => {
        setSearchTerm('');
        setSearchError(null);
        setIsSearchMode(false);
        refresh();
    }, [refresh]);

    return {
        searchTerm,
        setSearchTerm,
        searchLoading,
        searchError,
        isSearchMode,
        handleSearch,
        clearSearch
    };
};
