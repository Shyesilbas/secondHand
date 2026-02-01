import React from 'react';
import ListingGrid from './ListingGrid.jsx';
import Pagination from '../../common/components/ui/Pagination.jsx';
import FilterStatus from './FilterStatus.jsx';
import ListingsSkeleton from './ListingsSkeleton.jsx';

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
