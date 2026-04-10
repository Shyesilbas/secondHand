import { SlidersHorizontal, X, ArrowUpDown } from 'lucide-react';
import { LISTING_DEFAULTS, LISTING_SORT_FIELDS } from '../types/index.js';

const GROUPED_FILTERS = [
    ['minPrice', 'maxPrice'],
    ['city', 'district'],
    ['vehicleTypeIds'],
    ['brandIds'],
    ['vehicleModelIds'],
    ['brands'],
    ['electronicBrandIds'],
    ['fuelTypes'],
    ['colors'],
    ['gearTypes'],
    ['seatCounts'],
    ['electronicTypeIds'],
    ['types'],
    ['conditions'],
    ['clothingGenders'],
    ['clothingCategories'],
    ['genres'],
    ['languages'],
    ['formats'],
    ['bookTypeIds'],
    ['genreIds'],
    ['languageIds'],
    ['formatIds'],
    ['conditionIds'],
    ['disciplineIds'],
    ['equipmentTypeIds'],
    ['realEstateTypeIds'],
    ['heatingTypeIds'],
    ['adTypeId'],
    ['ownerTypeId'],
    ['minYear', 'maxYear'],
    ['maxMileage'],
    ['minSquareMeters', 'maxSquareMeters'],
    ['minRoomCount', 'maxRoomCount'],
    ['minBuildingAge', 'maxBuildingAge'],
    ['minFloor', 'maxFloor'],
    ['minPageCount', 'maxPageCount'],
    ['purchaseDateFrom', 'purchaseDateTo'],
];

const hasMeaningfulValue = (value) => {
    if (Array.isArray(value)) return value.length > 0;
    return value !== null && value !== undefined && value !== '' && value !== false;
};

const computeActiveFilterCount = (filters = {}) =>
    GROUPED_FILTERS.reduce((count, group) => {
        const hasGroupValue = group.some((key) => hasMeaningfulValue(filters[key]));
        return hasGroupValue ? count + 1 : count;
    }, 0);

const FilterStatus = ({ 
  totalElements, 
  filters, 
  getListingTypeLabel, 
  onResetFilters,
  hasActiveFilters,
  getActiveFilterCount,
  updateFilters
}) => {
    const resolvedCount = typeof getActiveFilterCount === 'function'
        ? getActiveFilterCount(filters)
        : computeActiveFilterCount(filters);

    const hasResults = Number(totalElements) > 0;

    const activeCount = resolvedCount;
    const hasActive = typeof hasActiveFilters === 'boolean' ? hasActiveFilters : activeCount > 0;
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
