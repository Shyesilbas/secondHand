import { useState, useCallback, useMemo } from 'react';

export const useListingsFilters = (filters) => {
    const [showFilterModal, setShowFilterModal] = useState(false);

    const hasActiveFilters = useMemo(() => {
        if (!filters) return false;
        
        const defaultFilters = {
            listingType: 'VEHICLE',
            page: 0,
            size: 20
        };
        
        return Object.keys(filters).some(key => {
            if (key === 'page' || key === 'size') return false;
            return filters[key] !== defaultFilters[key] && filters[key] !== null && filters[key] !== undefined && filters[key] !== '';
        });
    }, [filters]);

    const openFilterModal = useCallback(() => {
        setShowFilterModal(true);
    }, []);

    const closeFilterModal = useCallback(() => {
        setShowFilterModal(false);
    }, []);

    return {
        showFilterModal,
        hasActiveFilters,
        openFilterModal,
        closeFilterModal
    };
};
