import { useState, useCallback, useMemo } from 'react';

export const useListingsFilters = (filters) => {
    const [showFilterSidebar, setShowFilterSidebar] = useState(false);

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

    const toggleFilterSidebar = useCallback(() => {
        setShowFilterSidebar(prev => !prev);
    }, []);

    const openFilterSidebar = useCallback(() => {
        setShowFilterSidebar(true);
    }, []);

    const closeFilterSidebar = useCallback(() => {
        setShowFilterSidebar(false);
    }, []);

    return {
        showFilterSidebar,
        hasActiveFilters,
        toggleFilterSidebar,
        openFilterSidebar,
        closeFilterSidebar
    };
};
