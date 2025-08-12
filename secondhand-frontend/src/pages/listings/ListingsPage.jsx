import React, { useState } from 'react';
import { useAdvancedListings } from '../../features/listings/hooks/useAdvancedListings';
import ListingGrid from '../../features/listings/components/ListingGrid';
import AdvancedFilters from '../../features/listings/components/AdvancedFilters';
import CategorySelector from '../../features/listings/components/CategorySelector';
import Pagination from '../../components/ui/Pagination';
import { useEnums } from '../../hooks/useEnums';

const ListingsPage = () => {
    const [selectedCategory, setSelectedCategory] = useState(null);
    
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

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
        // Update filters to match the selected category
        updateFilters({ listingType: category });
    };

    const handleResetFilters = () => {
        setSelectedCategory(null);
        resetFilters();
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">
                    Listings
                </h1>
                <p className="text-slate-600 mt-2">
                    Gelişmiş filtreler ile aradığınız ürünü kolayca bulun.
                </p>
            </div>

            {/* Category Selector */}
            <div className="mb-6">
                <CategorySelector 
                    selectedCategory={selectedCategory}
                    onCategoryChange={handleCategoryChange}
                />
            </div>

            {/* Advanced Filters */}
            <div className="mb-8">
                <AdvancedFilters
                    filters={filters}
                    onFiltersChange={updateFilters}
                    onReset={handleResetFilters}
                    selectedCategory={selectedCategory}
                />
            </div>

            {/* Results Summary */}
            {!isLoading && (
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

            {/* Listings Grid */}
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
        </div>
    );
};

export default ListingsPage;