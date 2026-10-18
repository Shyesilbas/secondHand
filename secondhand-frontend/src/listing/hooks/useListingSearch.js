import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDebouncedValue } from '../../common/hooks/useDebouncedValue.js';
import { listingService } from '../services/listingService.js';

/**
 * Handles title-based search (client-side) and listingNo search (API call)
 */
export const useListingSearch = ({ listings, mode, urlSearchQuery = '', updateFilters }) => {
 const [searchTerm, setSearchTerm] = useState(() => String(urlSearchQuery || '').trim());

 useEffect(() => {
 const q = String(urlSearchQuery || '').trim();
 if (q) setSearchTerm(q);
 }, [urlSearchQuery]);

 const searchTrimmed = useMemo(() => String(searchTerm || '').trim(), [searchTerm]);
 const searchUpper = useMemo(() => searchTrimmed.toUpperCase(), [searchTrimmed]);
 
 const isListingNoSearch = useMemo(() => {
 if (mode === 'mine') return false;
 return /^[A-Z0-9]{8}$/.test(searchTrimmed) && searchTrimmed === searchUpper;
 }, [mode, searchTrimmed, searchUpper]);

 const searchMode = useMemo(() => {
 if (!searchTrimmed) return 'none';
 if (mode === 'mine') return 'title';
 return isListingNoSearch ? 'listingNo' : 'title';
 }, [isListingNoSearch, mode, searchTrimmed]);

 // Title search filters on the server; push the debounced term into the parent filters.
 const debouncedTitle = useDebouncedValue(searchMode === 'title' ? searchTrimmed : '', 400);
 useEffect(() => {
 updateFilters?.({ title: debouncedTitle || null });
 }, [debouncedTitle, updateFilters]);

 const { data: listingNoData, isFetching: listingNoLoading, error: listingNoQueryError } = useQuery({
 queryKey: ['listings', 'byNo', searchUpper],
 queryFn: () => listingService.getListingByNo(searchUpper),
 enabled: searchMode === 'listingNo',
 retry: false,
 });
 const listingNoResult = searchMode === 'listingNo' ? listingNoData || null : null;
 const listingNoError = searchMode !== 'listingNo' || !listingNoQueryError ? ''
 : listingNoQueryError?.response?.status === 404 ? 'No listing found with this number' : 'Search failed. Please try again.';

 const filteredListings = useMemo(() => {
 if (searchMode === 'listingNo') {
 return listingNoResult ? [listingNoResult] : [];
 }
 return listings || [];
 }, [listingNoResult, listings, searchMode]);

 const clearSearch = useCallback(() => {
 setSearchTerm('');
 updateFilters?.({ title: null });
 }, [updateFilters]);

 return {
 searchTerm,
 setSearchTerm,
 searchMode,
 filteredListings,
 clearSearch,
 listingNo: {
 loading: listingNoLoading,
 error: listingNoError,
 },
 };
};
