/**
 * @deprecated This file is being phased out in favor of the centralized listing configuration.
 * Please use the exports from '../config/listingConfig.js' instead.
 * 
 * This file remains for backward compatibility but will be removed in a future version.
 */
import { 
  listingTypeRegistry as newListingTypeRegistry,
  getListingConfig,
  isValidListingType
} from '../config/listingConfig.js';

// Export the new registry for backward compatibility
export const listingTypeRegistry = newListingTypeRegistry;

// Additional helper exports for migration
export { getListingConfig, isValidListingType };

// Legacy support - these will be removed in future versions
export const getTypeDetails = (type) => {
  console.warn('getTypeDetails is deprecated, use getListingConfig instead');
  return getListingConfig(type);
};

export const hasValidType = (type) => {
  console.warn('hasValidType is deprecated, use isValidListingType instead');
  return isValidListingType(type);
};


