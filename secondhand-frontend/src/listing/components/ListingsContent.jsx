import React from 'react';
import ListingGrid from './ListingGrid.jsx';
import Pagination from '../../common/components/ui/Pagination.jsx';
import FilterStatus from './FilterStatus.jsx';
import ListingsSkeleton from './ListingsSkeleton.jsx';
import { PackageSearch, SlidersHorizontal, RefreshCw } from 'lucide-react';

const ListingsContent = React.memo(({
    isLoading,
    filteredListings,
    error,
    totalPages,
    currentPage,
    onPageChange,
    totalElements,
    filters,
    getListingTypeLabel,
    onResetFilters,
    updateFilters,
    searchTerm,
    searchMode,
    onListingChanged,
}) => {
    const hasSearch = Boolean(searchTerm) && searchMode !== 'none';
    const categoryLabel = getListingTypeLabel?.(filters.listingType) || 'this category';

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[60vh]">
            {!isLoading && (!searchTerm || searchMode === 'none') && (
                <div className="mb-8">
                    <FilterStatus
                        totalElements={totalElements}
                        filters={filters}
                        getListingTypeLabel={getListingTypeLabel}
                        onResetFilters={onResetFilters}
                        updateFilters={updateFilters}
                    />
                </div>
            )}

            {isLoading ? (
                <ListingsSkeleton />
            ) : filteredListings && filteredListings.length === 0 ? (
                <div className="flex items-center justify-center min-h-[380px] py-8">
                    <div className="max-w-sm w-full text-center">
                        {/* Icon */}
                        <div className="relative inline-flex mb-6">
                            <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center">
                                <PackageSearch className="w-9 h-9 text-slate-400" />
                            </div>
                            {hasSearch && (
                                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center">
                                    <SlidersHorizontal className="w-3 h-3 text-white" />
                                </div>
                            )}
                        </div>

                        {/* Text */}
                        <h3 className="text-[16px] font-bold text-slate-800 mb-2">
                            {hasSearch ? 'No results found' : 'Nothing here yet'}
                        </h3>
                        <p className="text-[13px] text-slate-400 leading-relaxed mb-6 max-w-[260px] mx-auto">
                            {hasSearch
                                ? 'Try different keywords or remove some filters to see more results.'
                                : `No listings in ${categoryLabel} right now. Try a different category or check back soon.`}
                        </p>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                            {onResetFilters && (
                                <button
                                    onClick={onResetFilters}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-[12px] font-semibold hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200"
                                >
                                    <RefreshCw className="w-3.5 h-3.5" />
                                    Reset Filters
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <ListingGrid
                    listings={filteredListings}
                    isLoading={isLoading}
                    error={error}
                    onDeleted={onListingChanged}
                />
            )}
            
            {!isLoading && (!searchTerm || searchMode === 'none') && totalPages > 1 && (
                <div className="mt-10 flex justify-center">
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-1.5">
                        <Pagination
                            page={currentPage || 0}
                            totalPages={totalPages || 0}
                            onPageChange={onPageChange}
                        />
                    </div>
                </div>
            )}
        </div>
    );
});

export default ListingsContent;
