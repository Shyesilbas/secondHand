import React, { useEffect, useMemo, useState } from 'react';
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

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
        updateFilters({ listingType: category });
    };

    const handleResetFilters = () => {
        setSelectedCategory('VEHICLE');
        resetFilters();
    };



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
                onPageChange={updatePage}
                totalElements={totalElements}
                filters={filters}
                getListingTypeLabel={getListingTypeLabel}
                onResetFilters={resetFilters}
                updateFilters={updateFilters}
                titleSearchTerm={titleSearchTerm}
            />

            <FilterModal
                isOpen={showFilterModal}
                onClose={closeFilterModal}
                filters={filters}
                onFiltersChange={updateFilters}
                onReset={handleResetFilters}
                selectedCategory={selectedCategory}
                onCategoryChange={handleCategoryChange}
            />
        </div>
    );
};

export default ListingsPage;
