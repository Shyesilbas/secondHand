import React, { useEffect, useMemo, useState } from 'react';
import { useAdvancedListingsQuery } from '../hooks/useAdvancedListingsQuery.js';
import ListingGrid from '../components/ListingGrid.jsx';
import Pagination from '../../common/components/ui/Pagination.jsx';
import { useEnums } from '../../common/hooks/useEnums.js';
import { useNotification } from '../../notification/NotificationContext.jsx';
import ListingSearch from '../components/ListingSearch.jsx';
import SearchResult from '..//components/SearchResult.jsx';
import FilterStatus from '../components/FilterStatus.jsx';
import FilterModal from '../components/FilterModal.jsx';

const ListingsPage = () => {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [searchResult, setSearchResult] = useState(null);
    const [showSearchResult, setShowSearchResult] = useState(false);
    const [showFilterModal, setShowFilterModal] = useState(false);

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
        setShowSearchResult(false);
        setSearchResult(null);
    };

    const handleOpenFilterModal = () => {
        setShowFilterModal(true);
    };

    const handleCloseFilterModal = () => {
        setShowFilterModal(false);
    };

    const handleSearchResult = (result) => {
        setSearchResult(result);
        setShowSearchResult(true);
    };

    const handleClearSearch = () => {
        setShowSearchResult(false);
        setSearchResult(null);
    };

    const mainContent = (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Browse Listings</h1>
                            <p className="text-gray-600 mt-1">
                                Find the perfect item from our marketplace
                            </p>
                        </div>
                        <button
                            onClick={handleOpenFilterModal}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                            </svg>
                            Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Search */}
                <div className="mb-8">
                    <ListingSearch
                        onSearchResult={handleSearchResult}
                        onClearSearch={showSearchResult ? handleClearSearch : null}
                    />
                </div>

                {/* Search Result */}
                {showSearchResult && searchResult ? (
                    <SearchResult searchResult={searchResult} />
                ) : !isLoading && !showSearchResult && (
                    <>
                        <div className="mb-6">
                            <FilterStatus
                                totalElements={totalElements}
                                filters={filters}
                                getListingTypeLabel={getListingTypeLabel}
                                onResetFilters={resetFilters}
                                updateFilters={updateFilters}
                            />
                        </div>
                    </>
                )}

                {/* Listings Grid */}
                {!showSearchResult && (
                    <>
                        <div className="mb-8">
                            <ListingGrid listings={listings} isLoading={isLoading} error={error} />
                        </div>
                        {!isLoading && totalPages > 1 && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    totalElements={totalElements}
                                    onPageChange={updatePage}
                                    itemsPerPage={filters.size}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );

    return (
        <>
            {mainContent}
            <FilterModal
                isOpen={showFilterModal}
                onClose={handleCloseFilterModal}
                filters={filters}
                onFiltersChange={updateFilters}
                onReset={handleResetFilters}
                selectedCategory={selectedCategory}
                onCategoryChange={handleCategoryChange}
            />
        </>
    );
};

export default ListingsPage;
