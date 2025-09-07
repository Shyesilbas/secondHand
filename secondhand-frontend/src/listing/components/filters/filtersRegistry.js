/**
 * @deprecated This file is being phased out in favor of the centralized listing configuration.
 * Please use the exports from '../../config/listingConfig.js' instead.
 * 
 * This file remains for backward compatibility but will be removed in a future version.
 */
import { filtersRegistry as newFiltersRegistry } from '../../config/listingConfig.js';

// Export the new registry for backward compatibility
export const filtersRegistry = newFiltersRegistry;

export default filtersRegistry;


