import React from 'react';
import ListingGrid from './ListingGrid.jsx';
import Pagination from '../../common/components/ui/Pagination.jsx';
import FilterStatus from './FilterStatus.jsx';
import ListingsSkeleton from './ListingsSkeleton.jsx';
import {Image as PhotoIcon} from 'lucide-react';

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
                <div className="flex items-center justify-center min-h-[320px]">
                    <div className="max-w-xl w-full bg-white border border-slate-200 rounded-3xl shadow-sm px-8 py-10 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                            <PhotoIcon className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">
                            {hasSearch ? 'No results for your search' : 'No listings found'}
                        </h3>
                        <p className="text-sm text-slate-500 mb-6">
                            {hasSearch
                                ? 'Try changing your keywords or adjusting filters to discover more listings.'
                                : `There are no listings in ${categoryLabel} right now. Try a different category or check back soon.`}
                        </p>
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
                <div className="mt-12 flex justify-center">
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-2">
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
