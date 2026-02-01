import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { listingService } from '../services/listingService.js';
import { cleanObject } from '../../common/formatters.js';
import { getListingConfig } from '../config/listingConfig.js';
import { useAuth } from '../../auth/AuthContext.jsx';

const LISTING_ENGINE_QUERY_KEYS = {
  listings: ['listings'],
  filtered: (filters) => ['listings', 'filtered', filters],
  mine: (userId, page, size, listingType) => ['listings', 'mine', userId, page, size, listingType || null],
};

const buildDefaultsFromFilterConfig = (config) => {
  const fields = config?.getFields?.() || [];
  const defaults = {};

  fields.forEach((field) => {
    if (!field?.key) return;

    if (field.type === 'enum') {
      defaults[field.key] = field.multiple === false ? '' : [];
      return;
    }

    if (field.type === 'numericRange') {
      const minKey = `min${field.key.charAt(0).toUpperCase() + field.key.slice(1)}`;
      const maxKey = `max${field.key.charAt(0).toUpperCase() + field.key.slice(1)}`;
      defaults[minKey] = 0;
      defaults[maxKey] = 0;
      return;
    }

    if (field.type === 'dateRange') {
      const minDateKey = `min${field.key.charAt(0).toUpperCase() + field.key.slice(1)}`;
      const maxDateKey = `max${field.key.charAt(0).toUpperCase() + field.key.slice(1)}`;
      defaults[minDateKey] = null;
      defaults[maxDateKey] = null;
      return;
    }

    if (field.type === 'text') {
      defaults[field.key] = '';
    }
  });

  return defaults;
};

const getDefaultFiltersForType = (listingType, initialFilters) => {
  const type = String(listingType || '').toUpperCase();
  const cfg = getListingConfig(type);

  const base = {
    type,
    listingType: type,
    status: 'ACTIVE',
    city: '',
    district: '',
    minPrice: 0,
    maxPrice: 0,
    currency: '',
    sortBy: 'createdAt',
    sortDirection: 'DESC',
    page: 0,
    size: 10,
  };

  const dynamic = buildDefaultsFromFilterConfig(cfg?.filterConfig);
  const configDefaults = cfg?.defaultFilters || {};

  return { ...base, ...dynamic, ...configDefaults, ...(initialFilters || {}), listingType: type, type };
};

export const useListingEngine = ({ initialListingType = 'VEHICLE', mode: initialMode = 'browse' } = {}) => {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  const navState = useMemo(() => window.history.state && window.history.state.usr, []);
  const initialTypeFromNav = navState?.listingType || null;

  const engineModeFromNav = navState?.mode || null;
  const [mode, setMode] = useState(engineModeFromNav || initialMode || 'browse');

  const [selectedCategory, setSelectedCategory] = useState(
    mode === 'mine' ? (initialTypeFromNav || null) : (initialTypeFromNav || initialListingType || 'VEHICLE')
  );

  const [mineStatus, setMineStatus] = useState(null);

  const [filters, setFilters] = useState(() => {
    if (mode === 'mine') {
      return {
        page: 0,
        size: 10,
        listingType: initialTypeFromNav || null,
      };
    }
    const t = initialTypeFromNav || initialListingType || 'VEHICLE';
    return getDefaultFiltersForType(t, { listingType: t });
  });

  const [showFilterSidebar, setShowFilterSidebar] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [allPagesLoaded, setAllPagesLoaded] = useState(false);
  const [allListings, setAllListings] = useState([]);
  const [loadingAllPages, setLoadingAllPages] = useState(false);
  const [listingNoLoading, setListingNoLoading] = useState(false);
  const [listingNoError, setListingNoError] = useState('');
  const [listingNoResult, setListingNoResult] = useState(null);
  const listingNoRequestRef = useRef(0);

  useEffect(() => {
    if (initialTypeFromNav) {
      setSelectedCategory(initialTypeFromNav);
      setFilters((prev) => {
        if (mode === 'mine') return { ...prev, listingType: initialTypeFromNav, page: 0 };
        return { ...prev, listingType: initialTypeFromNav, type: initialTypeFromNav, page: 0 };
      });
    }
  }, [initialTypeFromNav, mode]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const category = params.get('category');
    if (category && category !== selectedCategory) {
      setSelectedCategory(category);
      setFilters((prev) => {
        if (mode === 'mine') return { ...prev, listingType: category, page: 0 };
        return { ...prev, listingType: category, type: category, page: 0 };
      });
    }
  }, [location.search, mode, selectedCategory]);

  const cleanedFilters = useMemo(() => cleanObject(filters), [filters]);

  const queryKey = useMemo(() => {
    if (mode === 'mine') {
      return LISTING_ENGINE_QUERY_KEYS.mine(user?.id, cleanedFilters?.page ?? 0, cleanedFilters?.size ?? 10, cleanedFilters?.listingType || null);
    }
    return LISTING_ENGINE_QUERY_KEYS.filtered({ ...cleanedFilters, userId: user?.id || null });
  }, [cleanedFilters, mode, user?.id]);

  const { data, isLoading, error: queryError, refetch } = useQuery({
    queryKey,
    queryFn: () => {
      if (mode === 'mine') {
        return listingService.getMyListings(cleanedFilters?.page ?? 0, cleanedFilters?.size ?? 10, cleanedFilters?.listingType || null);
      }
      return listingService.filterListings(cleanedFilters);
    },
    enabled: mode === 'mine' ? Boolean(isAuthenticated && user?.id) : !!cleanedFilters.listingType,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const rawListings = data?.content || [];
  const listings = useMemo(() => {
    if (mode !== 'mine') return rawListings;
    if (!mineStatus) return rawListings;
    return rawListings.filter((l) => l?.status === mineStatus);
  }, [mineStatus, mode, rawListings]);
  const totalPages = data?.totalPages || 0;
  const totalElements = data?.totalElements || 0;
  const currentPage = Number(data?.number ?? data?.pageable?.pageNumber ?? data?.page ?? filters?.page ?? 0) || 0;
  const error = queryError?.message || null;

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

  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 0 }));
    clearSearch();
  }, [clearSearch]);

  const updatePage = useCallback((page) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const resetFilters = useCallback(() => {
    if (mode === 'mine') {
      setSelectedCategory(null);
      setMineStatus(null);
      setFilters((prev) => ({ ...prev, page: 0, listingType: null }));
      clearSearch();
      return;
    }
    const listingType = selectedCategory || initialListingType || 'VEHICLE';
    setFilters(getDefaultFiltersForType(listingType, { listingType, type: listingType, page: 0 }));
    clearSearch();
  }, [clearSearch, initialListingType, mode, selectedCategory]);

  const onCategoryChange = useCallback((category) => {
    setSelectedCategory(category);
    if (mode === 'mine') {
      setFilters((prev) => ({ ...prev, listingType: category || null, page: 0 }));
      clearSearch();
      return;
    }
    const listingType = category || initialListingType || 'VEHICLE';
    setFilters(getDefaultFiltersForType(listingType, { listingType, type: listingType, page: 0 }));
    clearSearch();
  }, [clearSearch, initialListingType]);

  const hasActiveFilters = useMemo(() => {
    if (!filters) return false;
    if (mode === 'mine') {
      return Boolean(filters.listingType || mineStatus);
    }
    return Object.keys(filters).some((key) => {
      if (key === 'page' || key === 'size' || key === 'listingType' || key === 'type' || key === 'status' || key === 'sortBy' || key === 'sortDirection') {
        return false;
      }
      const value = filters[key];
      if (Array.isArray(value)) return value.length > 0;
      return value !== null && value !== undefined && value !== '' && value !== 0 && value !== false;
    });
  }, [filters]);

  const toggleFilterSidebar = useCallback(() => setShowFilterSidebar((v) => !v), []);
  const closeFilterSidebar = useCallback(() => setShowFilterSidebar(false), []);
  const openFilterSidebar = useCallback(() => setShowFilterSidebar(true), []);

  const refresh = useCallback(() => refetch(), [refetch]);

  const handlePageChange = useCallback((page) => {
    updatePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [updatePage]);

  useEffect(() => {
    setFilters((prev) => ({ ...prev, page: 0 }));
    clearSearch();
  }, [user?.id]);

  const lowStockListings = useMemo(() => {
    if (mode !== 'mine') return [];
    const source = allPagesLoaded ? allListings : rawListings;
    if (!Array.isArray(source)) return [];
    return source.filter((listing) => {
      if (!listing) return false;
      if (['VEHICLE', 'REAL_ESTATE'].includes(listing.type)) return false;
      if (listing.quantity == null) return false;
      const qty = Number(listing.quantity);
      if (!Number.isFinite(qty)) return false;
      return qty > 0 && qty < 10;
    });
  }, [allListings, allPagesLoaded, mode, rawListings]);

  const [lowStockOpen, setLowStockOpen] = useState(false);
  const openLowStock = useCallback(() => setLowStockOpen(true), []);
  const closeLowStock = useCallback(() => setLowStockOpen(false), []);
  const toggleLowStock = useCallback(() => setLowStockOpen((v) => !v), []);

  return {
    mode,
    listings,
    filteredListings,
    totalPages,
    totalElements,
    currentPage,
    isLoading,
    error,
    filters,
    selectedCategory,
    updateFilters,
    updatePage,
    resetFilters,
    refresh,
    onCategoryChange,
    showFilterSidebar,
    hasActiveFilters,
    toggleFilterSidebar,
    openFilterSidebar,
    closeFilterSidebar,
    search: {
      term: searchTerm,
      setTerm: setSearchTerm,
      mode: searchMode,
      listingNo: {
        loading: listingNoLoading,
        error: listingNoError,
      },
      title: {
        allPagesLoaded,
        loadingAllPages,
        loadAllPages,
      },
      clear: clearSearch,
    },
    mine: mode === 'mine'
      ? {
          status: mineStatus,
          setStatus: (v) => {
            setMineStatus(v || null);
            setFilters((prev) => ({ ...prev, page: 0 }));
            clearSearch();
          },
        }
      : null,
    alerts: mode === 'mine'
      ? {
          lowStock: {
            isOpen: lowStockOpen,
            open: openLowStock,
            close: closeLowStock,
            toggle: toggleLowStock,
            listings: lowStockListings,
            count: lowStockListings.length,
          },
        }
      : null,
    handlePageChange,
  };
};

