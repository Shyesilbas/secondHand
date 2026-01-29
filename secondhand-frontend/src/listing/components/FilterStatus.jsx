import React from 'react';

const FilterStatus = ({ 
  totalElements, 
  filters, 
  getListingTypeLabel, 
  onResetFilters,
  hasActiveFilters,
  getActiveFilterCount,
  updateFilters
}) => {
    const getSortLabel = (sortBy) => {
        switch (sortBy) {
            case 'price': return 'Sorted by price';
            case 'year': return 'Sorted by year';
            case 'mileage': return 'Sorted by mileage';
            case 'brand': return 'Sorted by brand';
            case 'type': return 'Sorted by type';
            default: return 'Sorted by date';
        }
    };

        const checkActiveFilters = hasActiveFilters || (() => {
        return filters.minPrice || filters.maxPrice || filters.city || filters.district ||
            (filters.brandIds && filters.brandIds.length > 0) ||
            (filters.brands && filters.brands.length > 0) ||
            (filters.electronicBrandIds && filters.electronicBrandIds.length > 0) ||
            (filters.fuelTypes && filters.fuelTypes.length > 0) ||
            (filters.colors && filters.colors.length > 0) ||
            (filters.gearTypes && filters.gearTypes.length > 0) ||
            (filters.seatCounts && filters.seatCounts.length > 0) ||
            (filters.electronicTypeIds && filters.electronicTypeIds.length > 0) ||
            (filters.types && filters.types.length > 0) ||
            (filters.conditions && filters.conditions.length > 0) ||
            (filters.clothingGenders && filters.clothingGenders.length > 0) ||
            (filters.clothingCategories && filters.clothingCategories.length > 0) ||
            (filters.genres && filters.genres.length > 0) ||
            (filters.languages && filters.languages.length > 0) ||
            (filters.formats && filters.formats.length > 0) ||
            (filters.disciplines && filters.disciplines.length > 0) ||
            (filters.equipmentTypes && filters.equipmentTypes.length > 0) ||
            (filters.realEstateTypeIds && filters.realEstateTypeIds.length > 0) ||
            (filters.heatingTypeIds && filters.heatingTypeIds.length > 0) ||
            filters.adTypeId || filters.ownerTypeId ||
            filters.minYear || filters.maxYear || filters.maxMileage ||
            filters.minSquareMeters || filters.maxSquareMeters ||
            filters.minRoomCount || filters.maxRoomCount ||
            filters.minBuildingAge || filters.maxBuildingAge ||
            filters.minFloor || filters.maxFloor ||
            filters.minPageCount || filters.maxPageCount ||
            filters.purchaseDateFrom || filters.purchaseDateTo;
    });

    const countActiveFilters = getActiveFilterCount || (() => {
        let count = 0;
        if (filters.minPrice || filters.maxPrice) count++;
        if (filters.city || filters.district) count++;
        if (filters.brandIds && filters.brandIds.length > 0) count++;
        if (filters.brands && filters.brands.length > 0) count++;
        if (filters.electronicBrandIds && filters.electronicBrandIds.length > 0) count++;
        if (filters.fuelTypes && filters.fuelTypes.length > 0) count++;
        if (filters.colors && filters.colors.length > 0) count++;
        if (filters.gearTypes && filters.gearTypes.length > 0) count++;
        if (filters.seatCounts && filters.seatCounts.length > 0) count++;
        if (filters.electronicTypeIds && filters.electronicTypeIds.length > 0) count++;
        if (filters.types && filters.types.length > 0) count++;
        if (filters.conditions && filters.conditions.length > 0) count++;
        if (filters.clothingGenders && filters.clothingGenders.length > 0) count++;
        if (filters.clothingCategories && filters.clothingCategories.length > 0) count++;
        if (filters.genres && filters.genres.length > 0) count++;
        if (filters.languages && filters.languages.length > 0) count++;
        if (filters.formats && filters.formats.length > 0) count++;
        if (filters.disciplines && filters.disciplines.length > 0) count++;
        if (filters.equipmentTypes && filters.equipmentTypes.length > 0) count++;
        if (filters.realEstateTypeIds && filters.realEstateTypeIds.length > 0) count++;
        if (filters.heatingTypeIds && filters.heatingTypeIds.length > 0) count++;
        if (filters.adTypeId) count++;
        if (filters.ownerTypeId) count++;
        if (filters.minYear || filters.maxYear) count++;
        if (filters.maxMileage) count++;
        if (filters.minSquareMeters || filters.maxSquareMeters) count++;
        if (filters.minRoomCount || filters.maxRoomCount) count++;
        if (filters.minBuildingAge || filters.maxBuildingAge) count++;
        if (filters.minFloor || filters.maxFloor) count++;
        if (filters.minPageCount || filters.maxPageCount) count++;
        if (filters.purchaseDateFrom || filters.purchaseDateTo) count++;
        
        return count;
    });

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
                {(() => {
                    const activeCount = countActiveFilters();
                    const hasActive = checkActiveFilters();
                    
                    // Only show if there are actually active filters (count > 0)
                    if (hasActive && activeCount > 0) {
                        return (
                            <div className="flex items-center gap-2">
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                    {activeCount} filter{activeCount !== 1 ? 's' : ''} active
                                </span>
                                <button
                                    onClick={onResetFilters}
                                    className="text-xs text-slate-500 hover:text-slate-700 underline transition-colors"
                                >
                                    Clear all
                                </button>
                            </div>
                        );
                    }
                    return null;
                })()}
            </div>
            <div className="flex items-center gap-3">
                <span className="text-sm text-slate-500">
                    {getSortLabel(filters.sortBy)}
                </span>
                <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                    <button
                        onClick={() => updateFilters({ sortBy: 'createdAt', sortDirection: 'DESC' })}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition-all duration-200 relative ${
                            filters.sortBy === 'createdAt' 
                                ? 'text-white bg-gray-900' 
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                        }`}
                    >
                        Date
                        {filters.sortBy === 'createdAt' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black rounded-full"></div>
                        )}
                    </button>
                    <button
                        onClick={() => updateFilters({ sortBy: 'price', sortDirection: 'DESC' })}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition-all duration-200 relative ${
                            filters.sortBy === 'price' 
                                ? 'text-white bg-gray-900' 
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                        }`}
                    >
                        Price
                        {filters.sortBy === 'price' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black rounded-full"></div>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FilterStatus;
