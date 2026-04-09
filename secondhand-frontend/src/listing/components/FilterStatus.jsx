import { SlidersHorizontal, X, ArrowUpDown } from 'lucide-react';
import { LISTING_DEFAULTS, LISTING_SORT_FIELDS } from '../types/index.js';

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
            case LISTING_SORT_FIELDS.PRICE: return 'Price';
            case LISTING_SORT_FIELDS.YEAR: return 'Year';
            case LISTING_SORT_FIELDS.MILEAGE: return 'Mileage';
            case LISTING_SORT_FIELDS.BRAND: return 'Brand';
            case LISTING_SORT_FIELDS.TYPE: return 'Type';
            default: return 'Date';
        }
    };

        const checkActiveFilters = hasActiveFilters || (() => {
        return filters.minPrice || filters.maxPrice || filters.city || filters.district ||
            (filters.vehicleTypeIds && filters.vehicleTypeIds.length > 0) ||
            (filters.brandIds && filters.brandIds.length > 0) ||
            (filters.vehicleModelIds && filters.vehicleModelIds.length > 0) ||
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
            (filters.bookTypeIds && filters.bookTypeIds.length > 0) ||
            (filters.genreIds && filters.genreIds.length > 0) ||
            (filters.languageIds && filters.languageIds.length > 0) ||
            (filters.formatIds && filters.formatIds.length > 0) ||
            (filters.conditionIds && filters.conditionIds.length > 0) ||
            (filters.disciplineIds && filters.disciplineIds.length > 0) ||
            (filters.equipmentTypeIds && filters.equipmentTypeIds.length > 0) ||
            (filters.conditionIds && filters.conditionIds.length > 0) ||
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
        if (filters.vehicleTypeIds && filters.vehicleTypeIds.length > 0) count++;
        if (filters.brandIds && filters.brandIds.length > 0) count++;
        if (filters.vehicleModelIds && filters.vehicleModelIds.length > 0) count++;
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
        if (filters.bookTypeIds && filters.bookTypeIds.length > 0) count++;
        if (filters.genreIds && filters.genreIds.length > 0) count++;
        if (filters.languageIds && filters.languageIds.length > 0) count++;
        if (filters.formatIds && filters.formatIds.length > 0) count++;
        if (filters.conditionIds && filters.conditionIds.length > 0) count++;
        if (filters.disciplineIds && filters.disciplineIds.length > 0) count++;
        if (filters.equipmentTypeIds && filters.equipmentTypeIds.length > 0) count++;
        if (filters.conditionIds && filters.conditionIds.length > 0) count++;
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

    const hasResults = Number(totalElements) > 0;

    const activeCount = countActiveFilters();
    const hasActive = checkActiveFilters();
    const categoryLabel = filters.listingType ? getListingTypeLabel(filters.listingType) : null;

    const FilterBadge = () => (
        hasActive && activeCount > 0 ? (
            <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                    <SlidersHorizontal className="w-3 h-3" />
                    {activeCount} filter{activeCount !== 1 ? 's' : ''}
                </span>
                <button
                    onClick={onResetFilters}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                >
                    <X className="w-3 h-3" />
                    Clear all
                </button>
            </div>
        ) : null
    );

    if (!hasResults) {
        return (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 py-1">
                <div className="flex flex-wrap items-center gap-2.5">
                    <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 inline-block" />
                        <span className="text-[13px] font-semibold text-slate-700">No listings found</span>
                        {categoryLabel && (
                            <span className="text-[13px] text-slate-400">in <span className="font-medium text-slate-600">{categoryLabel}</span></span>
                        )}
                    </div>
                    <FilterBadge />
                </div>
                <p className="text-[12px] text-slate-400">
                    Try changing filters or category to see more listings.
                </p>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2.5">
                <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                    <span className="text-[13px] font-semibold text-slate-700">
                        {totalElements} listing{totalElements !== 1 ? 's' : ''}
                    </span>
                    {categoryLabel && (
                        <span className="text-[13px] text-slate-400">in <span className="font-medium text-slate-600">{categoryLabel}</span></span>
                    )}
                </div>
                <FilterBadge />
            </div>

            {/* Sort toggle */}
            <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <ArrowUpDown className="w-3 h-3" />
                    <span>Sort:</span>
                </div>
                <div className="flex items-center bg-slate-100 rounded-xl p-1 gap-0.5">
                    {[
                        { key: LISTING_SORT_FIELDS.DATE, label: 'Date' },
                        { key: LISTING_SORT_FIELDS.PRICE, label: 'Price' },
                    ].map(({ key, label }) => (
                        <button
                            key={key}
                            onClick={() => updateFilters({ sortBy: key, sortDirection: LISTING_DEFAULTS.SORT_DIRECTION })}
                            className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all duration-200 ${
                                filters.sortBy === key
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FilterStatus;
