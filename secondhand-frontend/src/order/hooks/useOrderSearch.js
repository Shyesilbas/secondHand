import { useCallback, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { orderService } from '../services/orderService.js';
import { ORDER_QUERY_KEYS } from '../orderConstants.js';
import { ORDER_MESSAGES } from '../constants/orderUiConstants.js';

/** Order-number search; the `q` URL param is the source of truth so a search survives reloads and links. */
export const useOrderSearch = () => {
 const [searchParams, setSearchParams] = useSearchParams();
 const q = (searchParams.get('q') || '').trim();
 const [searchTerm, setSearchTerm] = useState(q);

 const { data, isFetching, isError } = useQuery({
 queryKey: ORDER_QUERY_KEYS.byNumber(q),
 queryFn: () => orderService.getByOrderNumber(q),
 enabled: !!q,
 retry: false,
 });

 const setQuery = useCallback((value) => {
 setSearchParams((prev) => {
 const next = new URLSearchParams(prev);
 if (value) next.set('q', value);
 else next.delete('q');
 return next;
 });
 }, [setSearchParams]);

 const handleSearch = useCallback((e) => {
 e.preventDefault();
 setQuery(searchTerm.trim());
 }, [searchTerm, setQuery]);

 const clearSearch = useCallback(() => {
 setSearchTerm('');
 setQuery('');
 }, [setQuery]);

 const searchResult = q && data ? data : null;
 return {
 searchResult,
 searchTerm,
 setSearchTerm,
 searchLoading: isFetching,
 searchError: q && !isFetching && (isError || !data) ? ORDER_MESSAGES.ORDER_NOT_FOUND : null,
 isSearchMode: !!searchResult,
 handleSearch,
 clearSearch,
 };
};
