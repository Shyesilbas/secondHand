import React, { useEffect, useMemo, useState } from 'react';
import { useAdvancedListingsQuery } from '../hooks/useAdvancedListingsQuery.js';
import ListingGrid from '../components/ListingGrid.jsx';
import Pagination from '../../common/components/ui/Pagination.jsx';
import { useEnums } from '../../common/hooks/useEnums.js';
import { useNotification } from '../../notification/NotificationContext.jsx';
import SearchResult from '..//components/SearchResult.jsx';
import FilterStatus from '../components/FilterStatus.jsx';
import FilterModal from '../components/FilterModal.jsx';
import LoadingIndicator from '../../common/components/ui/LoadingIndicator.jsx';
import { listingService } from '../services/listingService.js';

const ListingsPage = () => {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [searchResult, setSearchResult] = useState(null);
    const [showSearchResult, setShowSearchResult] = useState(false);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState(null);
    const [isSearchMode, setIsSearchMode] = useState(false);

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


    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;

        setSearchLoading(true);
        setSearchError(null);

        try {
            const listing = await listingService.getListingByNo(searchTerm.trim());
            if (listing) {
                setSearchResult(listing);
                setShowSearchResult(true);
                setIsSearchMode(true);
                setSearchTerm('');
            }
        } catch (error) {
            setSearchError('Listing not found. Please check the listing number.');
            console.error('Search error:', error);
        } finally {
            setSearchLoading(false);
        }
    };

    const clearSearch = () => {
        setSearchTerm('');
        setSearchError(null);
        setIsSearchMode(false);
        setShowSearchResult(false);
        setSearchResult(null);
    };

    const hasActiveFilters = () => {
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
    };

    const mainContent = (
        <div className="min-h-screen bg-white">
            {/* Clean Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        {/* Title Section */}
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                </div>
                                <div>
                                    <h1 className="text-3xl font-semibold text-gray-900">
                                        Browse Listings
                                    </h1>
                                    <span className="text-gray-500 text-sm">
                                        {totalElements} items available
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Filter Button */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleOpenFilterModal}
                                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                                </svg>
                                <span className="text-sm font-medium">Filters</span>
                                {hasActiveFilters() && (
                                    <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Search Section */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900">Search by Listing Number</h3>
                    </div>
                    
                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Enter listing number (e.g., ABC12345)"
                                className="w-full px-4 py-2 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                                disabled={searchLoading}
                            />
                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                        
                        <div className="flex gap-2">
                            <button
                                type="submit"
                                disabled={searchLoading || !searchTerm.trim()}
                                className="px-4 py-2 bg-gray-900 text-white hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                            >
                                {searchLoading ? 'Searching...' : 'Search'}
                            </button>
                            
                            {isSearchMode && (
                                <button
                                    type="button"
                                    onClick={clearSearch}
                                    className="px-4 py-2 text-gray-700 border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                >
                                    Show All
                                </button>
                            )}
                        </div>
                    </form>
                    
                    {searchError && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
                            <p className="text-sm text-red-800">{searchError}</p>
                        </div>
                    )}
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
                        {isLoading ? (
                            <div className="flex justify-center items-center py-12">
                                <LoadingIndicator />
                            </div>
                        ) : (
                            <div className="mb-8">
                                <ListingGrid listings={listings} isLoading={isLoading} error={error} />
                            </div>
                        )}
                        {!isLoading && !isSearchMode && totalPages > 1 && (
                            <div className="bg-white border border-gray-200 rounded">
                                <Pagination
                                    page={currentPage || 0}
                                    totalPages={totalPages || 0}
                                    onPageChange={updatePage}
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
