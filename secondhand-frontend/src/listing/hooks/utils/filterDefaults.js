import { getListingConfig } from '../../config/listingConfig.js';
import { getMinKey, getMaxKey } from '../../filters/filterRangeKeys.js';
import { LISTING_DEFAULTS } from '../../types/index.js';

/**
 * Builds default filter values from listing config fields
 */
export const buildDefaultsFromFilterConfig = (config) => {
  const fields = config?.getFields?.() || [];
  const defaults = {};

  fields.forEach((field) => {
    if (!field?.key) return;

    if (field.type === 'enum') {
      defaults[field.key] = field.multiple === false ? '' : [];
      return;
    }

    if (field.type === 'numericRange' || field.type === 'dateRange') {
      defaults[getMinKey(field.key)] = null;
      defaults[getMaxKey(field.key)] = null;
      return;
    }

    if (field.type === 'text') {
      defaults[field.key] = '';
    }
  });

  return defaults;
};

/**
 * Returns default filter object for a listing type
 */
export const getDefaultFiltersForType = (listingType, initialFilters) => {
  const type = String(listingType || '').toUpperCase();
  const cfg = getListingConfig(type);

  const base = {
    type,
    listingType: type,
    status: LISTING_DEFAULTS.STATUS,
    city: '',
    district: '',
    minPrice: LISTING_DEFAULTS.MIN_PRICE,
    maxPrice: LISTING_DEFAULTS.MAX_PRICE,
    currency: LISTING_DEFAULTS.CURRENCY,
    sortBy: LISTING_DEFAULTS.SORT_BY,
    sortDirection: LISTING_DEFAULTS.SORT_DIRECTION,
    page: LISTING_DEFAULTS.PAGE,
    size: LISTING_DEFAULTS.FILTER_PAGE_SIZE,
  };

  const dynamic = buildDefaultsFromFilterConfig(cfg?.filterConfig);
  const configDefaults = cfg?.defaultFilters || {};

  return { ...base, ...dynamic, ...configDefaults, ...(initialFilters || {}), listingType: type, type };
};
