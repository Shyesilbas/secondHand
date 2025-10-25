import React from 'react';

const ListingsHeader = React.memo(({
    totalElements,
    selectedCategory,
    filters,
    getListingTypeLabel,
    hasActiveFilters,
    onOpenFilterModal
}) => {
    return (
        <div className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-gray-900 to-gray-700 rounded-xl flex items-center justify-center shadow-lg">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                                    Browse Listings
                                </h1>
                                <div className="flex items-center gap-3">
                                    <span className="text-gray-600 text-sm">
                                        {totalElements?.toLocaleString()} items available
                                    </span>
                                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                    <span className="text-gray-500 text-sm">
                                        {getListingTypeLabel(selectedCategory || filters?.listingType) || 'All Categories'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={onOpenFilterModal}
                            className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 rounded-lg shadow-sm"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                            </svg>
                            <span className="text-sm font-medium">Filters</span>
                            {hasActiveFilters && (
                                <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default ListingsHeader;
