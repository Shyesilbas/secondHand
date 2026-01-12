import React from 'react';
import { ShoppingBag, Menu } from 'lucide-react';

const ListingsHeader = React.memo(({
    totalElements,
    selectedCategory,
    filters,
    getListingTypeLabel,
    hasActiveFilters,
    onToggleFilterSidebar
}) => {
    return (
        <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onToggleFilterSidebar}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 hover:text-gray-900 relative"
                        >
                            <Menu className="w-6 h-6" />
                            {hasActiveFilters && (
                                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-gray-900"></span>
                            )}
                        </button>
                        <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 shrink-0">
                            <ShoppingBag className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight leading-none">
                                Browse Listings
                            </h1>
                            <div className="flex items-center gap-2 mt-1.5">
                                <span className="text-sm font-medium text-indigo-600">
                                    {getListingTypeLabel(selectedCategory || filters?.listingType) || 'All Categories'}
                                </span>
                                <span className="text-gray-300">•</span>
                                <span className="text-gray-500 text-sm">
                                    {totalElements?.toLocaleString()} results
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default ListingsHeader;
