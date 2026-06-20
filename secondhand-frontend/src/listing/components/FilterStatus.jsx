import { useTranslation } from "react-i18next";
import { SlidersHorizontal, X, ArrowUpDown } from 'lucide-react';
import { useEnums } from '../../common/hooks/useEnums.js';
import { LISTING_DEFAULTS, LISTING_SORT_FIELDS } from '../types/index.js';
const GROUPED_FILTERS = [['minPrice', 'maxPrice'], ['city', 'district'], ['vehicleTypeIds'], ['brandIds'], ['vehicleModelIds'], ['brands'], ['electronicBrandIds'], ['fuelTypes'], ['colors'], ['gearTypes'], ['seatCounts'], ['electronicTypeIds'], ['types'], ['conditions'], ['clothingGenders'], ['clothingCategories'], ['genres'], ['languages'], ['formats'], ['bookTypeIds'], ['genreIds'], ['languageIds'], ['formatIds'], ['conditionIds'], ['disciplineIds'], ['equipmentTypeIds'], ['realEstateTypeIds'], ['heatingTypeIds'], ['adTypeId'], ['ownerTypeId'], ['minYear', 'maxYear'], ['maxMileage'], ['minSquareMeters', 'maxSquareMeters'], ['minRoomCount', 'maxRoomCount'], ['minBuildingAge', 'maxBuildingAge'], ['minFloor', 'maxFloor'], ['minPageCount', 'maxPageCount'], ['purchaseDateFrom', 'purchaseDateTo']];
const hasMeaningfulValue = value => {
  if (Array.isArray(value)) return value.length > 0;
  return value !== null && value !== undefined && value !== '' && value !== false;
};
const computeActiveFilterCount = (filters = {}) => GROUPED_FILTERS.reduce((count, group) => {
  const hasGroupValue = group.some(key => hasMeaningfulValue(filters[key]));
  return hasGroupValue ? count + 1 : count;
}, 0);
const getEnumItemText = item => {
  if (!item) return '';
  if (typeof item !== 'object') return String(item);
  return item.label || item.name || item.displayName || item.value || item.id || '';
};
const getEnumItemId = item => {
  if (!item) return '';
  if (typeof item !== 'object') return String(item);
  return item.id || item.value || item.key || item.code || '';
};
const resolveEnumValue = (value, options = []) => {
  const stringValue = String(value);
  const found = options.find(item => String(getEnumItemId(item)) === stringValue);
  return getEnumItemText(found) || stringValue;
};
const resolveFilterValue = (key, rawVal, enums = {}) => {
  const enumKeys = {
    vehicleTypeIds: 'vehicleTypes',
    brandIds: 'carBrands',
    vehicleModelIds: 'vehicleModels',
    brands: 'clothingBrands',
    electronicBrandIds: 'electronicBrands',
    electronicTypeIds: 'electronicTypes',
    bookTypeIds: 'bookTypes',
    genreIds: 'bookGenres',
    languageIds: 'bookLanguages',
    formatIds: 'bookFormats',
    conditionIds: 'bookConditions',
    disciplineIds: 'sportDisciplines',
    equipmentTypeIds: 'sportEquipmentTypes',
    realEstateTypeIds: 'realEstateTypes',
    heatingTypeIds: 'heatingTypes',
    adTypeId: 'realEstateAdTypes',
    ownerTypeId: 'ownerTypes'
  };
  const values = Array.isArray(rawVal) ? rawVal : [rawVal];
  const options = enums[enumKeys[key]] || [];
  const resolved = values.map(value => resolveEnumValue(value, options));
  return resolved.join(', ');
};
const mapGroupToTag = (group, filters, enums) => {
  const activeKeys = group.filter(key => hasMeaningfulValue(filters[key]));
  if (activeKeys.length === 0) return null;
  if (group.includes('minPrice') || group.includes('maxPrice')) {
    const min = filters.minPrice;
    const max = filters.maxPrice;
    if (min && max) return `Price: ${min}-${max} TL`;
    if (min) return `Min ${min} TL`;
    return `Max ${max} TL`;
  }
  if (group.includes('city') || group.includes('district')) {
    const city = filters.city;
    const district = filters.district;
    if (city && district) return `${city}/${district}`;
    return city;
  }
  if (group.includes('minYear') || group.includes('maxYear')) {
    const min = filters.minYear;
    const max = filters.maxYear;
    if (min && max) return `Year: ${min}-${max}`;
    if (min) return `Min Year: ${min}`;
    return `Max Year: ${max}`;
  }
  if (group.includes('minSquareMeters') || group.includes('maxSquareMeters')) {
    const min = filters.minSquareMeters;
    const max = filters.maxSquareMeters;
    if (min && max) return `Area: ${min}-${max} m²`;
    if (min) return `Min Area: ${min} m²`;
    return `Max Area: ${max} m²`;
  }
  if (group.includes('minRoomCount') || group.includes('maxRoomCount')) {
    const min = filters.minRoomCount;
    const max = filters.maxRoomCount;
    if (min && max) return `Rooms: ${min}-${max}`;
    if (min) return `Min Rooms: ${min}`;
    return `Max Rooms: ${max}`;
  }
  const keyLabels = {
    vehicleTypeIds: 'Vehicle Type',
    brandIds: 'Brand',
    vehicleModelIds: 'Model',
    brands: 'Brand',
    electronicBrandIds: 'Brand',
    fuelTypes: 'Fuel',
    colors: 'Color',
    gearTypes: 'Gear',
    seatCounts: 'Seats',
    electronicTypeIds: 'Type',
    types: 'Type',
    conditions: 'Condition',
    clothingGenders: 'Gender',
    clothingCategories: 'Clothing Category',
    genres: 'Genre',
    languages: 'Language',
    formats: 'Format',
    bookTypeIds: 'Book Type',
    genreIds: 'Genre',
    languageIds: 'Language',
    formatIds: 'Format',
    conditionIds: 'Condition',
    disciplineIds: 'Discipline',
    equipmentTypeIds: 'Equipment Type',
    realEstateTypeIds: 'Real Estate Type',
    heatingTypeIds: 'Heating',
    adTypeId: 'Ad Type',
    ownerTypeId: 'Owner Type',
    maxMileage: 'Max Mileage',
    minBuildingAge: 'Age',
    maxBuildingAge: 'Age',
    minFloor: 'Floor',
    maxFloor: 'Floor',
    minPageCount: 'Pages',
    maxPageCount: 'Pages',
    purchaseDateFrom: 'Purchase Date',
    purchaseDateTo: 'Purchase Date'
  };
  const key = activeKeys[0];
  const rawVal = filters[key];
  const resolvedVal = resolveFilterValue(key, rawVal, enums);
  const val = typeof resolvedVal === 'string' && resolvedVal.length > 40 ? `${resolvedVal.substring(0, 40)}...` : resolvedVal;
  const label = keyLabels[key] || key;
  return `${label}: ${val}`;
};
const FilterStatus = ({
  totalElements,
  filters,
  getListingTypeLabel,
  onResetFilters,
  hasActiveFilters,
  getActiveFilterCount,
  updateFilters
}) => {
  const {
    t
  } = useTranslation();
  const {
    enums
  } = useEnums();
  const resolvedCount = typeof getActiveFilterCount === 'function' ? getActiveFilterCount(filters) : computeActiveFilterCount(filters);
  const hasResults = Number(totalElements) > 0;
  const activeCount = resolvedCount;
  const hasActive = typeof hasActiveFilters === 'boolean' ? hasActiveFilters : activeCount > 0;
  const categoryLabel = filters.listingType ? getListingTypeLabel(filters.listingType) : null;
  const activeTags = GROUPED_FILTERS.map(group => mapGroupToTag(group, filters, enums)).filter(tag => tag !== null);
  const FilterBadge = () => hasActive && activeCount > 0 ? <div className="flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-caption font-semibold bg-indigo-50 text-primary border border-primary shadow-sm">
                    <SlidersHorizontal className="w-3 h-3" />
                    {activeCount}{t("filter")}{activeCount !== 1 ? 's' : ''}
                </span>

                {activeTags.map((tag, idx) => <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-caption font-medium bg-slate-50 text-slate-600 border border-border-light shadow-sm transition-all duration-200">
                        {tag}
                    </span>)}

                <button onClick={onResetFilters} className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-caption font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-1">
                    <X className="w-3 h-3" />{t("clear_all")}</button>
            </div> : null;
  if (!hasResults) {
    return <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 py-1">
                <div className="flex flex-wrap items-center gap-2.5">
                    <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 inline-block" />
                        <span className="text-sm font-semibold text-slate-700">{t("no_listings_found")}</span>
                        {categoryLabel && <span className="text-sm text-slate-400">{t("in")}<span className="font-medium text-slate-600">{categoryLabel}</span></span>}
                    </div>
                    <FilterBadge />
                </div>
                <p className="text-body text-slate-400">{t("try_changing_filters_or_category_to_see_")}</p>
            </div>;
  }
  return <div className="flex items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2.5">
                <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-status-success-bg inline-block" />
                    <span className="text-sm font-semibold text-slate-700">
                        {totalElements}{t("listing")}{totalElements !== 1 ? 's' : ''}
                    </span>
                    {categoryLabel && <span className="text-sm text-slate-400">{t("in")}<span className="font-medium text-slate-600">{categoryLabel}</span></span>}
                </div>
                <FilterBadge />
            </div>

            {/* Sort toggle */}
            <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-1 text-caption text-slate-400">
                    <ArrowUpDown className="w-3 h-3" />
                    <span>{t("sort")}</span>
                </div>
                <div className="flex items-center bg-slate-100 rounded-xl p-1 gap-0.5">
                    {[{
          key: LISTING_SORT_FIELDS.DATE,
          label: 'Date'
        }, {
          key: LISTING_SORT_FIELDS.PRICE,
          label: 'Price'
        }].map(({
          key,
          label
        }) => <button key={key} onClick={() => updateFilters({
          sortBy: key,
          sortDirection: LISTING_DEFAULTS.SORT_DIRECTION
        })} className={`px-3 py-1 rounded-lg text-caption font-semibold transition-all duration-200 ${filters.sortBy === key ? 'bg-background-primary text-text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                            {label}
                        </button>)}
                </div>
            </div>
        </div>;
};
export default FilterStatus;