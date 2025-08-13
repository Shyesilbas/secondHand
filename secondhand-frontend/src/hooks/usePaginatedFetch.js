import { useCallback, useEffect, useRef, useState } from 'react';
import useApi from './useApi';

/**
 * Generic paginated fetch hook
 * @param {Function} fetchPageFn - function(page, size) => Promise<{ content: any[], totalPages: number }>
 * @param {Object} options
 * @param {number} options.initialPage
 * @param {number} options.pageSize
 * @param {boolean} options.immediate
 * @param {Array} options.deps - extra dependencies to trigger refetch
 */
export const usePaginatedFetch = (
  fetchPageFn,
  { initialPage = 0, pageSize = 10, immediate = true, deps = [] } = {}
) => {
  const [items, setItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(0);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(Date.now());

  const mountedRef = useRef(true);

  // Initialize useApi without an initial API function, it will be passed to callApi
  const { isLoading, error, callApi, setError } = useApi(null);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchPage = useCallback(async (page = 0) => {
    // Use callApi from useApi to handle loading and error states
    try {
      const response = await callApi(fetchPageFn, page, pageSize);
      const content = Array.isArray(response) ? response : (response?.content || []);
      const tp = Number.isFinite(response?.totalPages) ? response.totalPages : 1;
      if (mountedRef.current) {
        setItems(content);
        setTotalPages(tp);
        setLastUpdatedAt(Date.now());
      }
    } catch (err) {
      // Error is already handled by useApi and propagated, just set items to empty
      if (mountedRef.current) {
        setItems([]);
      }
    }
  }, [callApi, fetchPageFn, pageSize, setError]);

  const refetch = useCallback(() => fetchPage(currentPage), [fetchPage, currentPage]);

  useEffect(() => {
    if (immediate) {
      fetchPage(currentPage);
    }
    // The eslint-disable-next-line is removed as dependencies are correctly handled by useCallback and useApi
  }, [currentPage, pageSize, immediate, fetchPage, ...deps]);

  const goToPreviousPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(0, prev - 1));
  }, []);

  const goToNextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
  }, [totalPages]);

  return {
    items,
    isLoading,
    error,
    currentPage,
    totalPages,
    pageSize,
    setCurrentPage,
    goToPreviousPage,
    goToNextPage,
    refetch,
    lastUpdatedAt,
  };
};

export default usePaginatedFetch;

