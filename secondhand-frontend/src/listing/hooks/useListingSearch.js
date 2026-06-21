import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { listingService } from '../services/listingService.js';
import { LISTING_DEFAULTS } from '../types/index.js';

/**
 * Handles title-based search (client-side) and listingNo search (API call)
 */
export const useListingSearch = ({ listings, mode, urlSearchQuery = '', updateFilters }) => {
  const [searchTerm, setSearchTerm] = useState(() => String(urlSearchQuery || '').trim());
  const [listingNoLoading, setListingNoLoading] = useState(false);
  const [listingNoError, setListingNoError] = useState('');
  const [listingNoResult, setListingNoResult] = useState(null);
  const listingNoRequestRef = useRef(0);

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

  // Sync title search term to parent filters state with debounce
  useEffect(() => {
    if (searchMode !== 'title') {
      updateFilters?.({ title: null });
      return;
    }

    const handler = setTimeout(() => {
      updateFilters?.({ title: searchTrimmed || null });
    }, 400);

    return () => clearTimeout(handler);
  }, [searchTrimmed, searchMode, updateFilters]);

  // ListingNo API call effect
  useEffect(() => {
    if (searchMode !== 'listingNo') {
      setListingNoLoading(false);
      setListingNoError('');
      setListingNoResult(null);
      return;
    }

    const requestId = listingNoRequestRef.current + 1;
    listingNoRequestRef.current = requestId;

    setListingNoLoading(true);
    setListingNoError('');
    setListingNoResult(null);

    listingService
      .getListingByNo(searchUpper)
      .then((res) => {
        if (listingNoRequestRef.current !== requestId) return;
        setListingNoResult(res || null);
      })
      .catch((err) => {
        if (listingNoRequestRef.current !== requestId) return;
        setListingNoResult(null);
        const status = err?.response?.status;
        if (status === 404) setListingNoError('No listing found with this number');
        else setListingNoError('Search failed. Please try again.');
      })
      .finally(() => {
        if (listingNoRequestRef.current !== requestId) return;
        setListingNoLoading(false);
      });
  }, [searchMode, searchUpper]);

  const filteredListings = useMemo(() => {
    if (searchMode === 'listingNo') {
      return listingNoResult ? [listingNoResult] : [];
    }
    return listings || [];
  }, [listingNoResult, listings, searchMode]);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setListingNoLoading(false);
    setListingNoError('');
    setListingNoResult(null);
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
    title: {
      allPagesLoaded: true,
      loadingAllPages: false,
      loadAllPages: () => {},
    },
  };
};
