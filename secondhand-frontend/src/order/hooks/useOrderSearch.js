import { useCallback, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Order-number search input state. The `q` URL param is the source of truth so a search survives
 * reloads and links; the list query sends it to the backend as the exact `orderNumber` filter.
 */
export const useOrderSearch = () => {
 const [searchParams, setSearchParams] = useSearchParams();
 const q = (searchParams.get('q') || '').trim();
 const [searchTerm, setSearchTerm] = useState(q);

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

 return {
 orderNumber: q,
 searchTerm,
 setSearchTerm,
 isSearchMode: Boolean(q),
 handleSearch,
 clearSearch,
 };
};
