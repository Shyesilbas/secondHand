import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAdvancedListingsQuery } from '../hooks/useAdvancedListingsQuery.js';
import { useEnums } from '../../common/hooks/useEnums.js';
import FilterModal from '../components/FilterModal.jsx';
import ListingsHeader from '../components/ListingsHeader.jsx';
import ListingsSearch from '../components/ListingsSearch.jsx';
import ListingsContent from '../components/ListingsContent.jsx';
import { useListingsSearch } from '../hooks/useListingsSearch.js';
import { useListingsFilters } from '../hooks/useListingsFilters.js';

const ListingsPage = () => {
    const [selectedCategory, setSelectedCategory] = useState(null);

    const location = useLocation();
    const navState = useMemo(() => window.history.state && window.history.state.usr, []);
    const initialListingType = useMemo(() => {
        const fromState = navState?.listingType;
        if (fromState) return fromState;
        const params = new URLSearchParams(location.search);
        const fromQuery = params.get('category');
        return fromQuery || null;
    }, [location.search, navState]);
    const {
        listings,
        totalPages,
        totalElements,
        currentPage,
        isLoading,
        error,
        filters,
        updateFilters,
        updatePage,
        resetFilters
    } = useAdvancedListingsQuery(initialListingType ? { listingType: initialListingType } : { listingType: null });

    const { getListingTypeLabel } = useEnums();
    const { showFilterModal, hasActiveFilters, openFilterModal, closeFilterModal } = useListingsFilters(filters);
    const { 
        titleSearchTerm, 
        setTitleSearchTerm, 
        filteredListings, 
        allPagesLoaded, 
        loadingAllPages, 
        loadAllPages 
    } = useListingsSearch(listings, filters, selectedCategory);

    useEffect(() => {
        if (initialListingType) {
            setSelectedCategory(initialListingType);
        }
    }, [initialListingType]);

    const handleCategoryChange = useCallback((category) => {
        setSelectedCategory(category);
        updateFilters({ listingType: category });
    }, [updateFilters]);

    const handleResetFilters = useCallback(() => {
        setSelectedCategory('VEHICLE');
        resetFilters();
    }, [resetFilters]);

    const handlePageChange = useCallback((page) => {
        updatePage(page);
    }, [updatePage]);

    const handleFiltersChange = useCallback((newFilters) => {
        console.log('📋 ListingsPage - handleFiltersChange:', newFilters);
        updateFilters(newFilters);
    }, [updateFilters]);

    return (
        <div className="min-h-screen bg-gray-50">
            <ListingsHeader
                totalElements={totalElements}
                selectedCategory={selectedCategory}
                filters={filters}
                getListingTypeLabel={getListingTypeLabel}
                hasActiveFilters={hasActiveFilters}
                onOpenFilterModal={openFilterModal}
            />

            <ListingsSearch
                titleSearchTerm={titleSearchTerm}
                setTitleSearchTerm={setTitleSearchTerm}
                filteredListings={filteredListings}
                allPagesLoaded={allPagesLoaded}
                loadingAllPages={loadingAllPages}
                loadAllPages={loadAllPages}
            />

            <ListingsContent
                isLoading={isLoading}
                filteredListings={filteredListings}
                error={error}
                totalPages={totalPages}
                currentPage={currentPage}
                onPageChange={handlePageChange}
                totalElements={totalElements}
                filters={filters}
                getListingTypeLabel={getListingTypeLabel}
                onResetFilters={resetFilters}
                updateFilters={handleFiltersChange}
                titleSearchTerm={titleSearchTerm}
            />

            <FilterModal
                isOpen={showFilterModal}
                onClose={closeFilterModal}
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onReset={handleResetFilters}
                selectedCategory={selectedCategory}
                onCategoryChange={handleCategoryChange}
            />
        </div>
    );
};

export default ListingsPage;
