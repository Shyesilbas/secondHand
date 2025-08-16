import React from 'react';

const FilterStatus = ({ totalElements, filters, getListingTypeLabel, onResetFilters }) => {
    const hasActiveFilters = filters.minPrice || filters.maxPrice || filters.city ||
        (filters.brands && filters.brands.length > 0) ||
        (filters.fuelTypes && filters.fuelTypes.length > 0);

    const getSortLabel = (sortBy) => {
        switch (sortBy) {
            case 'price': return 'Sorted by price';
            case 'year': return 'Sorted by year';
            case 'mileage': return 'Sorted by mileage';
            default: return 'Sorted by date';
        }
    };

    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <p className="text-slate-600">
                    <span className="font-medium">{totalElements}</span> listings found
                    {filters.listingType && (
                        <span className="text-slate-500 ml-2">
                            • in {getListingTypeLabel(filters.listingType)} category
                        </span>
                    )}
                </p>
                {hasActiveFilters && (
                    <div className="flex items-center gap-2">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            Filter active
                        </span>
                        <button
                            onClick={onResetFilters}
                            className="text-xs text-slate-500 hover:text-slate-700 underline"
                        >
                            Clear
                        </button>
                    </div>
                )}
            </div>
            <div className="text-sm text-slate-500">
                {getSortLabel(filters.sortBy)}
            </div>
        </div>
    );
};

export default FilterStatus;
