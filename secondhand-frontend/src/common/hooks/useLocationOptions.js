import { useQuery } from '@tanstack/react-query';
import { get } from '../services/api/request.js';
import { API_ENDPOINTS } from '../constants/apiEndpoints.js';

const NONE = [];
const { CITIES, DISTRICTS, NEIGHBORHOODS } = API_ENDPOINTS.CATALOG.LOCATIONS;

// The location catalog is static, so it is cached for the whole session.
export const districtsQuery = (cityKey) => ({
 queryKey: ['locations', 'districts', cityKey],
 queryFn: () => get(DISTRICTS(cityKey)),
 staleTime: Infinity,
});

/** City, district and neighborhood options for the selected keys. */
export const useLocationOptions = (cityKey, districtKey) => {
 const cities = useQuery({ queryKey: ['locations', 'cities'], queryFn: () => get(CITIES), staleTime: Infinity });
 const districts = useQuery({ ...districtsQuery(cityKey), enabled: !!cityKey });
 const neighborhoods = useQuery({
 queryKey: ['locations', 'neighborhoods', districtKey],
 queryFn: () => get(NEIGHBORHOODS(districtKey)),
 enabled: !!districtKey,
 staleTime: Infinity,
 });
 return {
 cities: cities.data || NONE,
 districts: (cityKey && districts.data) || NONE,
 neighborhoods: (districtKey && neighborhoods.data) || NONE,
 loadingCities: cities.isLoading,
 loadingDistricts: !!cityKey && districts.isLoading,
 loadingNeighborhoods: !!districtKey && neighborhoods.isLoading,
 error: cities.error || districts.error || neighborhoods.error ? 'Location options could not be loaded. Please try again.' : null,
 };
};
