import { useCallback, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { listingService } from '../services/listingService.js';
import { useAuth } from '../../auth/AuthContext.jsx';
import { useListingFilters } from './useListingFilters.js';
import { useListingPagination } from './useListingPagination.js';
import { useListingSearch } from './useListingSearch.js';

const LISTING_ENGINE_QUERY_KEYS = {
  listings: ['listings'],
  filtered: (filters) => ['listings', 'filtered', filters],
  mine: (userId, page, size, listingType) => ['listings', 'mine', userId, page, size, listingType || null],
};

/**
 * Orchestrates listing filters, pagination, and search sub-hooks
 */
export const useListingEngine = ({ initialListingType = 'VEHICLE', mode: initialMode = 'browse' } = {}) => {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  const navState = useMemo(() => window.history.state && window.history.state.usr, []);
  const engineModeFromNav = navState?.mode || null;
  const [mode, setMode] = useState(engineModeFromNav || initialMode || 'browse');

  // Initialize filters sub-hook (onFiltersChange will be set after search hook initialization)
  const filterHook = useListingFilters({
    initialListingType,
    mode,
    location,
    navState,
    user,
    onFiltersChange: undefined,
  });

  // React Query data fetching
  const queryKey = useMemo(() => {
    if (mode === 'mine') {
      return LISTING_ENGINE_QUERY_KEYS.mine(
        user?.id,
        filterHook.cleanedFilters?.page ?? 0,
        filterHook.cleanedFilters?.size ?? 10,
        filterHook.cleanedFilters?.listingType || null
      );
    }
    return LISTING_ENGINE_QUERY_KEYS.filtered({ ...filterHook.cleanedFilters, userId: user?.id || null });
  }, [filterHook.cleanedFilters, mode, user?.id]);

  const canFetch = mode === 'mine'
    ? Boolean(isAuthenticated && user?.id)
    : !!filterHook.cleanedFilters.listingType;

  const { data, isLoading, error: queryError, refetch } = useQuery({
    queryKey,
    queryFn: () => {
      if (mode === 'mine') {
        return listingService.getMyListings(
          filterHook.cleanedFilters?.page ?? 0,
          filterHook.cleanedFilters?.size ?? 10,
          filterHook.cleanedFilters?.listingType || null
        );
      }
      return listingService.filterListings(filterHook.cleanedFilters);
    },
    enabled: canFetch,
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
    if (!filterHook.mineStatus) return rawListings;
    return rawListings.filter((l) => l?.status === filterHook.mineStatus);
  }, [filterHook.mineStatus, mode, rawListings]);
  const error = queryError?.message || null;

  // Initialize pagination sub-hook
  const paginationHook = useListingPagination({
    data,
    filters: filterHook.filters,
    onPageChange: (page) => {
      filterHook.updateFilters({ page });
    },
  });

  // Initialize search sub-hook
  const searchHook = useListingSearch({
    listings,
    mode,
    filters: filterHook.filters,
    selectedCategory: filterHook.selectedCategory,
  });

  // Wire up filter changes to clear search
  const wrappedUpdateFilters = useCallback((newFilters) => {
    filterHook.updateFilters(newFilters);
    searchHook.clearSearch();
  }, [filterHook, searchHook]);

  const wrappedResetFilters = useCallback(() => {
    filterHook.resetFilters();
    searchHook.clearSearch();
  }, [filterHook, searchHook]);

  const wrappedOnCategoryChange = useCallback((category) => {
    filterHook.onCategoryChange(category);
    searchHook.clearSearch();
  }, [filterHook, searchHook]);

  const wrappedSetMineStatus = useCallback((status) => {
    filterHook.setMineStatus(status);
    searchHook.clearSearch();
  }, [filterHook, searchHook]);

  const refresh = useCallback(() => refetch(), [refetch]);

  // Mine-mode specific: low stock alerts
  const lowStockListings = useMemo(() => {
    if (mode !== 'mine') return [];
    const source = searchHook.title.allPagesLoaded ? searchHook.filteredListings : rawListings;
    if (!Array.isArray(source)) return [];
    return source.filter((listing) => {
      if (!listing) return false;
      if (['VEHICLE', 'REAL_ESTATE'].includes(listing.type)) return false;
      if (listing.quantity == null) return false;
      const qty = Number(listing.quantity);
      if (!Number.isFinite(qty)) return false;
      return qty > 0 && qty < 10;
    });
  }, [mode, rawListings, searchHook.filteredListings, searchHook.title.allPagesLoaded]);

  const [lowStockOpen, setLowStockOpen] = useState(false);
  const openLowStock = useCallback(() => setLowStockOpen(true), []);
  const closeLowStock = useCallback(() => setLowStockOpen(false), []);
  const toggleLowStock = useCallback(() => setLowStockOpen((v) => !v), []);

  // Return unified interface (backward compatible)
  return {
    mode,
    listings,
    filteredListings: searchHook.filteredListings,
    totalPages: paginationHook.totalPages,
    totalElements: paginationHook.totalElements,
    currentPage: paginationHook.currentPage,
    isLoading,
    error,
    filters: filterHook.filters,
    selectedCategory: filterHook.selectedCategory,
    updateFilters: wrappedUpdateFilters,
    updatePage: paginationHook.updatePage,
    resetFilters: wrappedResetFilters,
    refresh,
    onCategoryChange: wrappedOnCategoryChange,
    showFilterSidebar: filterHook.showFilterSidebar,
    hasActiveFilters: filterHook.hasActiveFilters,
    toggleFilterSidebar: filterHook.toggleFilterSidebar,
    openFilterSidebar: filterHook.openFilterSidebar,
    closeFilterSidebar: filterHook.closeFilterSidebar,
    search: {
      term: searchHook.searchTerm,
      setTerm: searchHook.setSearchTerm,
      mode: searchHook.searchMode,
      listingNo: searchHook.listingNo,
      title: searchHook.title,
      clear: searchHook.clearSearch,
    },
    mine: mode === 'mine'
      ? {
          status: filterHook.mineStatus,
          setStatus: wrappedSetMineStatus,
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
    handlePageChange: paginationHook.handlePageChange,
  };
};

