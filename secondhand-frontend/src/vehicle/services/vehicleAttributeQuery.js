import { get } from '../../common/services/api/request.js';
import { API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';

/**
 * React Query options for the attribute definitions of a vehicle type (`/catalog/vehicle/attributes`).
 * Used by the listing form and the listing detail page, so both share one cached request per type.
 */
export const vehicleAttributeQuery = (typeId) => ({
	queryKey: ['catalog', 'vehicle', 'attributes', String(typeId ?? '')],
	queryFn: () => get(API_ENDPOINTS.CATALOG.VEHICLE.ATTRIBUTES(typeId)),
	enabled: Boolean(typeId),
	staleTime: 5 * 60 * 1000,
	gcTime: 30 * 60 * 1000,
});
