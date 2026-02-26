import {LISTING_TYPES} from '../types/index.js';

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

export default listingTypeConfig;
