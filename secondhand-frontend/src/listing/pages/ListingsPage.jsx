import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAdvancedListingsQuery } from '../hooks/useAdvancedListingsQuery.js';
import { useEnums } from '../../common/hooks/useEnums.js';
import FilterSidebar from '../components/FilterSidebar.jsx';
import ListingsHeader from '../components/ListingsHeader.jsx';
import ListingsSearch from '../components/ListingsSearch.jsx';
import ListingsContent from '../components/ListingsContent.jsx';
import { useListingsSearch } from '../hooks/useListingsSearch.js';
import { useListingsFilters } from '../hooks/useListingsFilters.js';

const ListingsPage = () => {
    const [selectedCategory, setSelectedCategory] = useState(null);

    const location = useLocation();
    const navState = useMemo(() => window.history.state && window.history.state.usr, []);
    const initialListingType = navState?.listingType || null;
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
    } = useAdvancedListingsQuery(initialListingType ? { listingType: initialListingType } : { listingType: 'VEHICLE' });

    const { getListingTypeLabel } = useEnums();
    const { showFilterSidebar, hasActiveFilters, toggleFilterSidebar, closeFilterSidebar } = useListingsFilters(filters);
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

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const category = params.get('category');
        if (category && category !== selectedCategory) {
            setSelectedCategory(category);
            updateFilters({ listingType: category, page: 0 });
        }
    }, [location.search, selectedCategory, updateFilters]);

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
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [updatePage]);

    const handleFiltersChange = useCallback((newFilters) => {
        updateFilters(newFilters);
    }, [updateFilters]);


    return (
        <div className="min-h-screen bg-background-secondary/50 relative">
            <FilterSidebar
                isOpen={showFilterSidebar}
                onClose={closeFilterSidebar}
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onReset={handleResetFilters}
                selectedCategory={selectedCategory}
                onCategoryChange={handleCategoryChange}
            />

            <div className={`flex flex-col min-w-0 transition-all duration-300 ${showFilterSidebar ? 'lg:ml-80' : ''}`}>
                <ListingsHeader
                    totalElements={totalElements}
                    selectedCategory={selectedCategory}
                    filters={filters}
                    getListingTypeLabel={getListingTypeLabel}
                    hasActiveFilters={hasActiveFilters}
                    onToggleFilterSidebar={toggleFilterSidebar}
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
            </div>
        </div>
    );
};

export default ListingsPage;
