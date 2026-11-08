import { get } from '../../common/services/api/request.js';
import { API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';

/**
 * React Query options for the attribute definitions of a property type (`/catalog/real-estate/attributes`),
 * scoped by the type's category. Shared by the listing form and the listing detail page.
 */
export const realEstateAttributeQuery = (typeId) => ({
	queryKey: ['catalog', 'real-estate', 'attributes', String(typeId ?? '')],
	queryFn: () => get(API_ENDPOINTS.CATALOG.REAL_ESTATE.ATTRIBUTES(typeId)),
	enabled: Boolean(typeId),
	staleTime: 5 * 60 * 1000,
	gcTime: 30 * 60 * 1000,
});
