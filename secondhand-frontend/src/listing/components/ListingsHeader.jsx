import React from 'react';
import { ShoppingBag, Filter } from 'lucide-react';

const ListingsHeader = React.memo(({
    totalElements,
    selectedCategory,
    filters,
    getListingTypeLabel,
    hasActiveFilters,
    onOpenFilterModal
}) => {
    return (
        <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4">
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

                    <div className="flex items-center gap-3">
                        <button
                            onClick={onOpenFilterModal}
                            className={`
                                inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm
                                ${hasActiveFilters 
                                    ? 'bg-gray-900 text-white hover:bg-black ring-2 ring-offset-2 ring-gray-900' 
                                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                                }
                            `}
                        >
                            <Filter className="w-4 h-4" />
                            <span>Filters</span>
                            {hasActiveFilters && (
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-gray-900 text-[10px] font-bold">
                                    !
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default ListingsHeader;
