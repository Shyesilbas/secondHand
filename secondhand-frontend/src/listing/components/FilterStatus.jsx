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
 ['audiences'],
 ['sizeSystem'],
 ['sizes'],
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
 ['minPurchaseYear', 'maxPurchaseYear']
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
 audiences: 'clothingAudiences',
 sizeSystem: 'sizeSystems',
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
 audiences: 'Kimin için',
 sizeSystem: 'Beden sistemi',
 sizes: 'Beden',
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
 minPurchaseYear: 'Satın Alma',
 maxPurchaseYear: 'Satın Alma'
 };

 const key = activeKeys[0];
 const rawVal = filters[key];
 const resolvedVal = resolveFilterValue(key, rawVal, enums);
 const val = typeof resolvedVal === 'string' && resolvedVal.length > 40 ? `${resolvedVal.substring(0, 40)}...` : resolvedVal;
 const label = keyLabels[key] || key;
 return `${label}: ${val}`;
};

// Active filter chips and the sort control. The result count and category live in the page header,
// so this row only renders when there is something to show.
const FilterStatus = ({
  totalElements,
  filters,
  onResetFilters,
  hasActiveFilters,
  getActiveFilterCount,
  updateFilters,
  sortable = true,
  trailing = null
}) => {
  const { t } = useTranslation();
  const { enums } = useEnums();

  const activeCount = typeof getActiveFilterCount === 'function' ? getActiveFilterCount(filters) : computeActiveFilterCount(filters);
  const hasResults = Number(totalElements) > 0;
  const hasActive = (typeof hasActiveFilters === 'boolean' ? hasActiveFilters : activeCount > 0) && activeCount > 0;
  const activeTags = GROUPED_FILTERS.map(group => mapGroupToTag(group, filters, enums)).filter(tag => tag !== null);
  const showSort = sortable && hasResults;
  if (!hasActive && !showSort && !trailing) return null;

  const currentSortBy = filters.sortBy || LISTING_DEFAULTS.SORT_BY;
  const currentDirection = filters.sortDirection || LISTING_DEFAULTS.SORT_DIRECTION;
  const sortOptions = [
    { key: LISTING_SORT_FIELDS.DATE, direction: LISTING_DEFAULTS.SORT_DIRECTION, label: t("sort_newest", "En yeni") },
    { key: LISTING_SORT_FIELDS.PRICE, direction: 'ASC', label: t("sort_price_asc", "En ucuz") },
    { key: LISTING_SORT_FIELDS.PRICE, direction: 'DESC', label: t("sort_price_desc", "En pahalı") }
  ];

  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {hasActive ? (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1.5 rounded-sm border border-accent-teal bg-accent-teal-50 px-2.5 py-1 text-sm font-medium text-accent-teal-800">
            <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
            {activeCount} {t("filter", "filtre")}
          </span>
          {activeTags.map((tag, i) => (
            <span key={i} className="inline-flex items-center rounded-sm border border-border-light bg-background-primary px-2.5 py-1 text-sm text-text-secondary">
              {tag}
            </span>
          ))}
          <button
            type="button"
            onClick={onResetFilters}
            className="ml-1 inline-flex items-center gap-1 rounded-sm px-2 py-1 text-sm font-medium text-text-tertiary transition-colors duration-150 hover:bg-background-tertiary hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
          >
            <X className="h-3.5 w-3.5" strokeWidth={1.5} aria-hidden />
            {t("clear_all", "Temizle")}
          </button>
        </div>
      ) : <span aria-hidden />}

      {(showSort || trailing) && (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          {showSort && (
            <div className="flex shrink-0 items-center gap-2">
              <span className="flex items-center gap-1.5 text-sm text-text-tertiary">
                <ArrowUpDown className="h-4 w-4" strokeWidth={1.5} aria-hidden />
                {t("sort", "Sırala")}
              </span>
              <div className="flex items-center gap-0.5 rounded border border-border bg-background-secondary p-0.5">
                {sortOptions.map(({ key, direction, label }) => {
                  const active = currentSortBy === key && currentDirection === direction;
                  return (
                    <button
                      key={`${key}-${direction}`}
                      type="button"
                      aria-pressed={active}
                      onClick={() => updateFilters({ sortBy: key, sortDirection: direction })}
                      className={`rounded-sm px-2.5 py-1 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus ${
                        active ? 'bg-background-primary text-text-primary shadow-sm' : 'text-text-tertiary hover:text-text-primary'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {trailing}
        </div>
      )}
    </div>
  );
};

export default FilterStatus;
