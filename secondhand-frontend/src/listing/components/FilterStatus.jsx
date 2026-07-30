import { useTranslation } from "react-i18next";
import { SlidersHorizontal, X, ArrowUpDown } from 'lucide-react';
import { useEnums } from '../../common/hooks/useEnums.js';
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
  ['purchaseDateFrom', 'purchaseDateTo']
];

const getMinYearDefault = (listingType) => {
  const type = String(listingType || '').toUpperCase();
  if (type === 'BOOKS') return 1450;
  if (type === 'ELECTRONICS') return 2000;
  return 1980;
};

const hasMeaningfulValue = (key, value, filters = {}) => {
  if (Array.isArray(value)) return value.length > 0;
  if (value === null || value === undefined || value === '' || value === false) return false;

  // Price checks: 0 or "0" is not an active price filter
  if (key === 'minPrice' || key === 'maxPrice') {
    const num = Number(value);
    return !isNaN(num) && num > 0;
  }

  // Year checks: default bounds are not active filters
  if (key === 'minYear') {
    const minDefault = getMinYearDefault(filters.listingType);
    const num = Number(value);
    return !isNaN(num) && num > minDefault;
  }
  if (key === 'maxYear') {
    const currentYear = new Date().getFullYear();
    const num = Number(value);
    return !isNaN(num) && num < currentYear;
  }

  // Area / Room checks: 0 is not an active filter
  if (key === 'minSquareMeters' || key === 'maxSquareMeters' || key === 'minRoomCount' || key === 'maxRoomCount') {
    const num = Number(value);
    return !isNaN(num) && num > 0;
  }

  return true;
};

const computeActiveFilterCount = (filters = {}) => GROUPED_FILTERS.reduce((count, group) => {
  const hasGroupValue = group.some(key => hasMeaningfulValue(key, filters[key], filters));
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
  const activeKeys = group.filter(key => hasMeaningfulValue(key, filters[key], filters));
  if (activeKeys.length === 0) return null;

  if (group.includes('minPrice') || group.includes('maxPrice')) {
    const min = Number(filters.minPrice) > 0 ? filters.minPrice : null;
    const max = Number(filters.maxPrice) > 0 ? filters.maxPrice : null;
    if (!min && !max) return null;
    if (min && max) return `Fiyat: ₺${min} - ₺${max}`;
    if (min) return `Min: ₺${min}`;
    return `Max: ₺${max}`;
  }

  if (group.includes('city') || group.includes('district')) {
    const city = filters.city;
    const district = filters.district;
    if (city && district) return `${city} / ${district}`;
    return city;
  }

  if (group.includes('minYear') || group.includes('maxYear')) {
    const minDefault = getMinYearDefault(filters.listingType);
    const maxDefault = new Date().getFullYear();
    const min = Number(filters.minYear) > minDefault ? filters.minYear : null;
    const max = Number(filters.maxYear) < maxDefault ? filters.maxYear : null;
    if (!min && !max) return null;
    if (min && max) return `Yıl: ${min} - ${max}`;
    if (min) return `Min Yıl: ${min}`;
    return `Max Yıl: ${max}`;
  }

  if (group.includes('minSquareMeters') || group.includes('maxSquareMeters')) {
    const min = Number(filters.minSquareMeters) > 0 ? filters.minSquareMeters : null;
    const max = Number(filters.maxSquareMeters) > 0 ? filters.maxSquareMeters : null;
    if (!min && !max) return null;
    if (min && max) return `Alan: ${min} - ${max} m²`;
    if (min) return `Min Alan: ${min} m²`;
    return `Max Alan: ${max} m²`;
  }

  if (group.includes('minRoomCount') || group.includes('maxRoomCount')) {
    const min = Number(filters.minRoomCount) > 0 ? filters.minRoomCount : null;
    const max = Number(filters.maxRoomCount) > 0 ? filters.maxRoomCount : null;
    if (!min && !max) return null;
    if (min && max) return `Oda: ${min} - ${max}`;
    if (min) return `Min Oda: ${min}`;
    return `Max Oda: ${max}`;
  }

  const keyLabels = {
    vehicleTypeIds: 'Vasıta Tipi',
    brandIds: 'Marka',
    vehicleModelIds: 'Model',
    brands: 'Marka',
    electronicBrandIds: 'Marka',
    fuelTypes: 'Yakıt',
    colors: 'Renk',
    gearTypes: 'Vites',
    seatCounts: 'Koltuk',
    electronicTypeIds: 'Tip',
    types: 'Tip',
    conditions: 'Durum',
    clothingGenders: 'Cinsiyet',
    clothingCategories: 'Kategori',
    genres: 'Tür',
    languages: 'Dil',
    formats: 'Format',
    bookTypeIds: 'Kitap Tipi',
    genreIds: 'Tür',
    languageIds: 'Dil',
    formatIds: 'Format',
    conditionIds: 'Durum',
    disciplineIds: 'Disiplin',
    equipmentTypeIds: 'Ekipman Tipi',
    realEstateTypeIds: 'Emlak Tipi',
    heatingTypeIds: 'Isınma',
    adTypeId: 'İlan Tipi',
    ownerTypeId: 'Kimden',
    maxMileage: 'Max KM',
    minBuildingAge: 'Bina Yaşı',
    maxBuildingAge: 'Bina Yaşı',
    minFloor: 'Kat',
    maxFloor: 'Kat',
    minPageCount: 'Sayfa',
    maxPageCount: 'Sayfa',
    purchaseDateFrom: 'Satın Alma',
    purchaseDateTo: 'Satın Alma'
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
  const { t } = useTranslation();
  const { enums } = useEnums();

  const resolvedCount = typeof getActiveFilterCount === 'function' ? getActiveFilterCount(filters) : computeActiveFilterCount(filters);
  const hasResults = Number(totalElements) > 0;
  const activeCount = resolvedCount;
  const hasActive = typeof hasActiveFilters === 'boolean' ? hasActiveFilters : activeCount > 0;
  const categoryLabel = filters.listingType ? getListingTypeLabel(filters.listingType) : null;
  const activeTags = GROUPED_FILTERS.map(group => mapGroupToTag(group, filters, enums)).filter(tag => tag !== null);

  const FilterBadge = () => hasActive && activeCount > 0 ? (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs">
        <SlidersHorizontal className="w-3 h-3 text-emerald-600" />
        {activeCount} {t("filter")}
      </span>

      {activeTags.map((tag, idx) => (
        <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200/80 shadow-xs">
          {tag}
        </span>
      ))}

      <button
        onClick={onResetFilters}
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-1 cursor-pointer"
      >
        <X className="w-3.5 h-3.5" />
        {t("clear_all")}
      </button>
    </div>
  ) : null;

  if (!hasResults) {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 py-1">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-300 inline-block" />
            <span className="text-sm font-extrabold text-slate-800">{t("no_listings_found")}</span>
            {categoryLabel && <span className="text-sm font-medium text-slate-500">({categoryLabel})</span>}
          </div>
          <FilterBadge />
        </div>
        <p className="text-xs text-slate-500 font-medium">{t("try_changing_filters_or_category_to_see_")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          <span className="text-sm font-black text-slate-900">
            {totalElements} {t("listing")}
          </span>
          {categoryLabel && <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">({categoryLabel})</span>}
        </div>
        <FilterBadge />
      </div>

      {/* Sort toggle */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex items-center gap-1 text-xs font-bold text-slate-500">
          <ArrowUpDown className="w-3.5 h-3.5" />
          <span>{t("sort")}:</span>
        </div>
        <div className="flex items-center bg-slate-100 rounded-xl p-1 gap-0.5 border border-slate-200/80">
          {[
            { key: LISTING_SORT_FIELDS.DATE, label: t("sort_date") },
            { key: LISTING_SORT_FIELDS.PRICE, label: t("sort_price") }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => updateFilters({
                sortBy: key,
                sortDirection: LISTING_DEFAULTS.SORT_DIRECTION
              })}
              className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all duration-200 cursor-pointer ${
                filters.sortBy === key ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-700'
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