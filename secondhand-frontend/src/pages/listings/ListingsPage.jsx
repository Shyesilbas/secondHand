import React, { useState } from 'react';
import { useAdvancedListings } from '../../features/listings/hooks/useAdvancedListings';
import ListingGrid from '../../features/listings/components/ListingGrid';
import AdvancedFilters from '../../features/listings/components/AdvancedFilters';
import CategorySelector from '../../features/listings/components/CategorySelector';
import Pagination from '../../components/ui/Pagination';
import SidebarLayout from '../../components/layout/SidebarLayout';
import { useEnums } from '../../hooks/useEnums';
import { listingService } from '../../features/listings/services/listingService';
import { useToast } from '../../context/ToastContext';

const ListingsPage = () => {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResult, setSearchResult] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [showSearchResult, setShowSearchResult] = useState(false);
    
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
    } = useAdvancedListings();
    
    const { getListingTypeLabel } = useEnums();
    const { showError, showSuccess } = useToast();

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
        // Update filters to match the selected category
        updateFilters({ listingType: category });
    };

    const handleResetFilters = () => {
        setSelectedCategory(null);
        resetFilters();
        setShowSearchResult(false);
        setSearchResult(null);
        setSearchQuery('');
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        
        if (!searchQuery.trim()) {
            showError('Please enter a listing number');
            return;
        }

        setIsSearching(true);
        try {
            const result = await listingService.getListingByNo(searchQuery.trim());
            setSearchResult(result);
            setShowSearchResult(true);
            showSuccess('Listing found!');
        } catch (error) {
            console.error('Search error:', error);
            if (error.response?.status === 404) {
                showError('No listing found with this number');
            } else {
                showError('Search failed. Please try again.');
            }
            setSearchResult(null);
            setShowSearchResult(false);
        } finally {
            setIsSearching(false);
        }
    };

    const clearSearch = () => {
        setShowSearchResult(false);
        setSearchResult(null);
        setSearchQuery('');
    };

    // Sidebar Content
    const sidebarContent = (
        <div className="space-y-6">
            {/* Category Selector */}
            <div>
                <h3 className="text-md font-semibold text-gray-900 mb-4">Categories</h3>
                <CategorySelector 
                    selectedCategory={selectedCategory}
                    onCategoryChange={handleCategoryChange}
                />
            </div>

            {/* Advanced Filters */}
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

    // Main Content
    const mainContent = (
        <div className="p-6">
            {/* Header and Search */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">
                    Listings
                </h1>
                <p className="text-slate-600 mt-2">
                    Search by listing number or use advanced filters to find products easily.
                </p>
                
                {/* Search Bar */}
                <div className="mt-6">
                    <form onSubmit={handleSearch} className="flex gap-4 max-w-md">
                        <div className="flex-1">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
                                placeholder="Enter listing number (e.g., ABC123DE)"
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                                maxLength={8}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isSearching}
                            className="px-6 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isSearching ? 'Searching...' : 'Search'}
                        </button>
                        {showSearchResult && (
                            <button
                                type="button"
                                onClick={clearSearch}
                                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                            >
                                Clear
                            </button>
                        )}
                    </form>
                </div>
            </div>

            {/* Search Result or Results Summary */}
            {showSearchResult && searchResult ? (
                <div className="mb-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <h3 className="text-lg font-semibold text-blue-900 mb-2">Search Result</h3>
                        <p className="text-blue-700">Found listing: <span className="font-mono font-bold">{searchResult.listingNo}</span></p>
                    </div>
                    <ListingGrid
                        listings={[searchResult]}
                        isLoading={false}
                        error={null}
                    />
                </div>
            ) : !isLoading && !showSearchResult && (
                <div className="mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <p className="text-slate-600">
                                <span className="font-medium">{totalElements}</span> ilan bulundu
                                {filters.listingType && (
                                    <span className="text-slate-500 ml-2">
                                        • {getListingTypeLabel(filters.listingType)} kategorisinde
                                    </span>
                                )}
                            </p>
                            
                            {/* Active Filters Indicator */}
                            {(filters.minPrice || filters.maxPrice || filters.city || 
                              (filters.brands && filters.brands.length > 0) ||
                              (filters.fuelTypes && filters.fuelTypes.length > 0)) && (
                                <div className="flex items-center gap-2">
                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                        Filtre aktif
                                    </span>
                                    <button
                                        onClick={resetFilters}
                                        className="text-xs text-slate-500 hover:text-slate-700 underline"
                                    >
                                        Temizle
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Sort Info */}
                        <div className="text-sm text-slate-500">
                            {filters.sortBy === 'price' ? 'Fiyata göre' :
                             filters.sortBy === 'year' ? 'Yıla göre' :
                             filters.sortBy === 'mileage' ? 'Kilometreye göre' : 'Tarihe göre'} sıralı
                        </div>
                    </div>
                </div>
            )}

            {/* Listings Grid - Only show if not showing search result */}
            {!showSearchResult && (
                <>
                    <div className="mb-8">
                        <ListingGrid
                            listings={listings}
                            isLoading={isLoading}
                            error={error}
                        />
                    </div>

                    {/* Pagination */}
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