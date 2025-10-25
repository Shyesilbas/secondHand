import React from 'react';
import ListingGrid from './ListingGrid.jsx';
import Pagination from '../../common/components/ui/Pagination.jsx';
import LoadingIndicator from '../../common/components/ui/LoadingIndicator.jsx';
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
    titleSearchTerm
}) => {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {!isLoading && !titleSearchTerm && (
                <div className="mb-6">
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
                <div className="mb-8">
                    <ListingsSkeleton />
                </div>
            ) : (
                <div className="mb-8">
                    <ListingGrid listings={filteredListings} isLoading={isLoading} error={error} />
                </div>
            )}
            
            {!isLoading && !titleSearchTerm && totalPages > 1 && (
                <div className="bg-white border border-gray-200 rounded">
                    <Pagination
                        page={currentPage || 0}
                        totalPages={totalPages || 0}
                        onPageChange={onPageChange}
                    />
                </div>
            )}
        </div>
    );
});

export default ListingsContent;
