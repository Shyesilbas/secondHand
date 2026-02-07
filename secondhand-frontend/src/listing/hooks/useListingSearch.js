import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { listingService } from '../services/listingService.js';

/**
 * Handles title-based search (client-side) and listingNo search (API call)
 */
export const useListingSearch = ({ listings, mode, filters, selectedCategory }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [allPagesLoaded, setAllPagesLoaded] = useState(false);
  const [allListings, setAllListings] = useState([]);
  const [loadingAllPages, setLoadingAllPages] = useState(false);
  const [listingNoLoading, setListingNoLoading] = useState(false);
  const [listingNoError, setListingNoError] = useState('');
  const [listingNoResult, setListingNoResult] = useState(null);
  const listingNoRequestRef = useRef(0);

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
    if (searchMode === 'none') return listings || [];

    const searchLower = searchTrimmed.toLowerCase();
    const listingsToSearch = allPagesLoaded ? allListings : listings || [];

    return listingsToSearch.filter((listing) => {
      const titleMatch = listing.title?.toLowerCase().includes(searchLower);
      const listingNoMatch = listing.listingNo?.toLowerCase().includes(searchLower);
      return titleMatch || listingNoMatch;
    });
  }, [allListings, allPagesLoaded, listingNoResult, listings, searchMode, searchTrimmed]);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setAllPagesLoaded(false);
    setAllListings([]);
    setListingNoLoading(false);
    setListingNoError('');
    setListingNoResult(null);
  }, []);

  const loadAllPages = useCallback(async () => {
    if (searchMode !== 'title' || !searchTrimmed) return;
    setLoadingAllPages(true);
    try {
      const allListingsData = [];
      let page = 0;
      let total = 1;

      while (page < total) {
        const response =
          mode === 'mine'
            ? await listingService.getMyListings(page, 50, selectedCategory || filters.listingType || null)
            : await listingService.filterListings({
                ...filters,
                listingType: selectedCategory || filters.listingType,
                type: selectedCategory || filters.type,
                page,
                size: 24,
              });

        const content = response.content || [];
        total = response.totalPages || 0;
        if (content.length) {
          allListingsData.push(...content);
        }
        page += 1;

        if (!content.length) break;
      }

      setAllListings(allListingsData);
      setAllPagesLoaded(true);
    } finally {
      setLoadingAllPages(false);
    }
  }, [filters, mode, searchMode, searchTrimmed, selectedCategory]);

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
      allPagesLoaded,
      loadingAllPages,
      loadAllPages,
    },
  };
};
