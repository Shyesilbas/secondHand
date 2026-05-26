import {LISTING_TYPES} from '../types/index.js';
import { isPrefilterValueFilled } from '../utils/prefilterSelection.js';

import {vehicleConfig} from './vehicleConfig.js';
import {electronicsConfig} from './electronicsConfig.js';
import {realEstateConfig} from './realEstateConfig.js';
import {clothingConfig} from './clothingConfig.js';
import {booksConfig} from './booksConfig.js';
import {sportsConfig} from './sportsConfig.js';

export const listingTypeConfig = {
  [LISTING_TYPES.VEHICLE]: vehicleConfig,
  [LISTING_TYPES.ELECTRONICS]: electronicsConfig,
  [LISTING_TYPES.REAL_ESTATE]: realEstateConfig,
  [LISTING_TYPES.CLOTHING]: clothingConfig,
  [LISTING_TYPES.BOOKS]: booksConfig,
  [LISTING_TYPES.SPORTS]: sportsConfig,
};

export const getListingConfig = (listingType) => {
  return listingTypeConfig[listingType] || null;
};

export const getPrefilterSelectors = (listingType) => {
  const config = listingTypeConfig[listingType];
  if (!config?.createFlow) return [];
  const { subtypeSelector, preFormSelectors = [] } = config.createFlow;
  const prefilterPreForm = preFormSelectors.filter((s) => s.prefilter !== false);
  const subtype = subtypeSelector ? [{ ...subtypeSelector, label: subtypeSelector.title }] : [];
  return [...subtype, ...prefilterPreForm.map((s) => ({ ...s, label: s.title }))];
};

/** Create-listing wizard steps (all preFormSelectors; independent of browse prefilter subset) */
export const getCreateFlowSelectorSteps = (listingType) => {
  const config = listingTypeConfig[listingType];
  if (!config?.createFlow) return [];
  const { subtypeSelector, preFormSelectors = [] } = config.createFlow;
  const list = [];
  if ((subtypeSelector?.enumKey || subtypeSelector?.options) && subtypeSelector?.initialDataKey) {
    list.push({ ...subtypeSelector, kind: 'grid' });
  }
  preFormSelectors.forEach((s) => {
    if ((s?.enumKey || s?.options) && s?.initialDataKey) list.push(s);
  });
  return list;
};

export const getAllListingTypes = () => {
  return Object.keys(listingTypeConfig);
};

export const getListingTypeOptions = () => {
  return Object.entries(listingTypeConfig).map(([value, config]) => ({
    value,
    label: config.label,
    icon: config.icon,
    description: config.description
  }));
};

export const isValidListingType = (listingType) => {
  return listingType && listingTypeConfig.hasOwnProperty(listingType);
};

export const listingTypeRegistry = Object.fromEntries(
  Object.entries(listingTypeConfig).map(([type, config]) => [
    type,
    {
      detailsComponent: config.detailsComponent,
      editComponent: config.createComponent,
      compactBadges: config.compactBadges
    }
  ])
);

export const createFormRegistry = Object.fromEntries(
  Object.entries(listingTypeConfig).map(([type, config]) => [
    type,
    config.createComponent
  ])
);

export const isCreateSelectionComplete = (listingType, selection, enums = null) => {
  if (!listingType || !createFormRegistry[listingType]) return false;
  const steps = getCreateFlowSelectorSteps(listingType);
  if (!steps.length) return true;

  const ctx = { formData: selection, selection, enums: enums || {} };
  const visibleSteps = steps.filter((s) => {
    if (typeof s.visibleWhen === 'function') return Boolean(s.visibleWhen(ctx));
    return true;
  });

  return visibleSteps.every(
    (s) => s.optional || isPrefilterValueFilled(selection?.[s.initialDataKey]),
  );
};

export default listingTypeConfig;
