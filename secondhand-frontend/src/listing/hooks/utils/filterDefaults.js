import { getListingConfig } from '../../config/listingConfig.js';

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

    if (field.type === 'numericRange') {
      const minKey = `min${field.key.charAt(0).toUpperCase() + field.key.slice(1)}`;
      const maxKey = `max${field.key.charAt(0).toUpperCase() + field.key.slice(1)}`;
      defaults[minKey] = null;
      defaults[maxKey] = null;
      return;
    }

    if (field.type === 'dateRange') {
      const minDateKey = `min${field.key.charAt(0).toUpperCase() + field.key.slice(1)}`;
      const maxDateKey = `max${field.key.charAt(0).toUpperCase() + field.key.slice(1)}`;
      defaults[minDateKey] = null;
      defaults[maxDateKey] = null;
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
    status: 'ACTIVE',
    city: '',
    district: '',
    minPrice: 0,
    maxPrice: 0,
    currency: '',
    sortBy: 'createdAt',
    sortDirection: 'DESC',
    page: 0,
    size: 10,
  };

  const dynamic = buildDefaultsFromFilterConfig(cfg?.filterConfig);
  const configDefaults = cfg?.defaultFilters || {};

  return { ...base, ...dynamic, ...configDefaults, ...(initialFilters || {}), listingType: type, type };
};
