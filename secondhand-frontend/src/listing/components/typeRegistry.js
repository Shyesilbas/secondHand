import { 
  listingTypeRegistry as newListingTypeRegistry,
  getListingConfig,
  isValidListingType
} from '../config/listingConfig.js';

export const listingTypeRegistry = newListingTypeRegistry;

export { getListingConfig, isValidListingType };

export const getTypeDetails = (type) => {
  console.warn('getTypeDetails is deprecated, use getListingConfig instead');
  return getListingConfig(type);
};

export const hasValidType = (type) => {
  console.warn('hasValidType is deprecated, use isValidListingType instead');
  return isValidListingType(type);
};


