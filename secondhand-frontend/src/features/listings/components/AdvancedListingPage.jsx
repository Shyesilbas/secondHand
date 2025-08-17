import React, { useState } from 'react';
import { useAdvancedListings } from '../hooks/useAdvancedListings';
import { useListingFilters } from '../hooks/useListingFilters';
import { useEnums } from '../../../hooks/useEnums';
import AdvancedFilters from './AdvancedFilters';
import FilterStatus from './FilterStatus';
import ListingCard from './ListingCard';
import Pagination from '../../../components/ui/Pagination';

const AdvancedListingPage = ({ listingType = 'VEHICLE' }) => {
    const [selectedCategory, setSelectedCategory] = useState(listingType);
    const { enums } = useEnums();
    
    // Use the advanced listings hook
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
        resetFilters,
        hasActiveFilters,
        getActiveFilterCount
    } = useAdvancedListings({}, selectedCategory);

    // Use the filter management hook for more granular control
    const {
        updateSingleFilter,
        updateArrayFilter,
        clearFilter
    } = useListingFilters({}, selectedCategory);

    const getListingTypeLabel = (type) => {
        const icons = {
            'VEHICLE': '🚗',
            'ELECTRONICS': '📱',
            'REAL_ESTATE': '🏠',
            'FASHION': '👕',
            'SPORTS': '⚽',
            'BOOKS': '📚',
            'OTHER': '📦'
        };
        return `${icons[type] || '📦'} ${type}`;
    };

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
        resetFilters();
    };

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-red-800">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-medium">Error loading listings</span>
                        </div>
                        <p className="text-red-700 mt-1">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Advanced Listings</h1>
                    <p className="text-slate-600">Find exactly what you're looking for with our advanced filtering system</p>
                </div>

                {/* Category Selector */}
                <div className="mb-6">
                    <div className="flex flex-wrap gap-2">
                        {enums?.listingTypes?.map((type) => (
                            <button
                                key={type.value}
                                onClick={() => handleCategoryChange(type.value)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                                    selectedCategory === type.value
                                        ? 'bg-slate-800 text-white border-slate-800'
                                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                }`}
                            >
                                <span className="text-lg">{type.icon || '📦'}</span>
                                <span className="font-medium">{type.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Filters Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sticky top-8">
                            <AdvancedFilters
                                filters={filters}
                                onFiltersChange={updateFilters}
                                onReset={resetFilters}
                                selectedCategory={selectedCategory}
                                updateSingleFilter={updateSingleFilter}
                                updateArrayFilter={updateArrayFilter}
                            />
                        </div>
                    </div>

                    {/* Listings Content */}
                    <div className="lg:col-span-3">
                        {/* Filter Status */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                            <FilterStatus
                                totalElements={totalElements}
                                filters={filters}
                                getListingTypeLabel={getListingTypeLabel}
                                onResetFilters={resetFilters}
                                hasActiveFilters={hasActiveFilters}
                                getActiveFilterCount={getActiveFilterCount}
                            />
                        </div>

                        {/* Loading State */}
                        {isLoading && (
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12">
                                <div className="flex items-center justify-center">
                                    <div className="flex items-center gap-3 text-slate-600">
                                        <svg className="animate-spin w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        <span className="text-lg">Loading listings...</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Listings Grid */}
                        {!isLoading && (
                            <>
                                {listings.length === 0 ? (
                                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12">
                                        <div className="text-center">
                                            <div className="text-6xl mb-4">🔍</div>
                                            <h3 className="text-xl font-semibold text-slate-800 mb-2">No listings found</h3>
                                            <p className="text-slate-600 mb-4">
                                                Try adjusting your filters or search criteria
                                            </p>
                                            <button
                                                onClick={resetFilters}
                                                className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
                                            >
                                                Clear all filters
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                        {listings.map((listing) => (
                                            <ListingCard
                                                key={listing.id}
                                                listing={listing}
                                                className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
                                            />
                                        ))}
                                    </div>
                                )}

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="mt-8">
                                        <Pagination
                                            currentPage={currentPage}
                                            totalPages={totalPages}
                                            onPageChange={updatePage}
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdvancedListingPage;
