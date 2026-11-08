import { get } from '../../common/services/api/request.js';
import { API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';

/**
 * React Query options for the condition attribute definitions of an electronic type
 * (`/catalog/electronics/attributes`). Shared by the listing form and the listing detail page.
 */
export const electronicAttributeQuery = (typeId) => ({
	queryKey: ['catalog', 'electronics', 'attributes', String(typeId ?? '')],
	queryFn: () => get(API_ENDPOINTS.CATALOG.ELECTRONICS.ATTRIBUTES(typeId)),
	enabled: Boolean(typeId),
	staleTime: 5 * 60 * 1000,
	gcTime: 30 * 60 * 1000,
});
