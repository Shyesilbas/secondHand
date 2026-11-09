import { get } from '../../common/services/api/request.js';
import { API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';

/**
 * React Query options for the condition attribute definitions of a clothing type
 * (`/catalog/clothing/attributes`, scoped by the type's group). Shared by the listing form and the detail page.
 */
export const clothingAttributeQuery = (typeId) => ({
	queryKey: ['catalog', 'clothing', 'attributes', String(typeId ?? '')],
	queryFn: () => get(API_ENDPOINTS.CATALOG.CLOTHING.ATTRIBUTES(typeId)),
	enabled: Boolean(typeId),
	staleTime: 5 * 60 * 1000,
	gcTime: 30 * 60 * 1000,
});
