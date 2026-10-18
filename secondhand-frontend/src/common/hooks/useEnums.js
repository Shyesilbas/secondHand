import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { enumService } from '../services/enumService.js';

const DAY_MS = 24 * 60 * 60 * 1000;
const NO_ENUMS = {};

// The backend returns every enum in one flat object; React Query caches it app-wide.
export const useEnums = () => {
 const { data: enums = NO_ENUMS, isLoading, error } = useQuery({
 queryKey: ['enums'],
 queryFn: enumService.getAllEnums,
 staleTime: DAY_MS,
 gcTime: DAY_MS,
 refetchOnWindowFocus: false,
 });

 const getLabel = useCallback(
 (value) => enums.listingTypes?.find((t) => t.value === value)?.label || value,
 [enums.listingTypes]
 );

 return { enums, isLoading, error, getListingTypeLabel: getLabel };
};
