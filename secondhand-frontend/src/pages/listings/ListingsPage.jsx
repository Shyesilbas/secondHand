import React, { useEffect, useMemo, useState } from 'react';
import { useAdvancedListings } from '../../features/listings/hooks/useAdvancedListings';
import ListingGrid from '../../features/listings/components/ListingGrid';
import AdvancedFilters from '../../features/listings/components/AdvancedFilters';
import Pagination from '../../components/ui/Pagination';
import SidebarLayout from '../../components/layout/SidebarLayout';
import { useEnums } from '../../hooks/useEnums';
import { useNotification } from '../../context/NotificationContext';
import CategorySelector from '../../features/listings/components/CategorySelector';
import ListingSearch from '../../features/listings/components/ListingSearch';
import SearchResult from '../../features/listings/components/SearchResult';
import FilterStatus from '../../features/listings/components/FilterStatus';

const ListingsPage = () => {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [searchResult, setSearchResult] = useState(null);
    const [showSearchResult, setShowSearchResult] = useState(false);

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
    } = useAdvancedListings(initialListingType ? { listingType: initialListingType } : { listingType: 'VEHICLE' });

    const { getListingTypeLabel } = useEnums();
    const notification = useNotification();

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

    const handleSearchResult = (result) => {
        setSearchResult(result);
        setShowSearchResult(true);
    };

    const handleClearSearch = () => {
        setShowSearchResult(false);
        setSearchResult(null);
    };

    // ✅ Sidebar Content
    const sidebarContent = (
        <div className="space-y-6">
            <div>
                <h3 className="text-md font-semibold text-gray-900 mb-4">Categories</h3>
                <CategorySelector
                    selectedCategory={selectedCategory}
                    onCategoryChange={handleCategoryChange}
                />
            </div>
            <div>
                <h3 className="text-md font-semibold text-gray-900 mb-4">Advanced Filters</h3>
                <AdvancedFilters
                    filters={filters}
                    onFiltersChange={updateFilters}
                    onReset={handleResetFilters}
                    selectedCategory={selectedCategory}
                />
            </div>
        </div>
    );

    const mainContent = (
        <div className="p-6">
            {/* Header and Search */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Listings</h1>
                <p className="text-slate-600 mt-2">
                    Search by listing number or use advanced filters to find products easily.
                </p>

                <ListingSearch
                    onSearchResult={handleSearchResult}
                    onClearSearch={showSearchResult ? handleClearSearch : null}
                />
            </div>

            {/* Search Result */}
            {showSearchResult && searchResult ? (
                <SearchResult searchResult={searchResult} />
            ) : !isLoading && !showSearchResult && (
                <div className="mb-6">
                    <FilterStatus
                        totalElements={totalElements}
                        filters={filters}
                        getListingTypeLabel={getListingTypeLabel}
                        onResetFilters={resetFilters}
                    />
                </div>
            )}

            {/* Listings Grid */}
            {!showSearchResult && (
                <>
                    <div className="mb-8">
                        <ListingGrid listings={listings} isLoading={isLoading} error={error} />
                    </div>
                    {!isLoading && totalPages > 1 && (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
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
    );

    return (
        <SidebarLayout
            sidebarContent={sidebarContent}
            mainContent={mainContent}
            sidebarTitle="Filters & Categories"
            sidebarWidth="w-80"
        />
    );
};

export default ListingsPage;
