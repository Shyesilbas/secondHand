import { useCallback, useMemo } from 'react';

/**
 * Manages pagination state and page change handlers
 */
export const useListingPagination = ({ data, filters, onPageChange }) => {
  const totalPages = data?.totalPages || 0;
  const totalElements = data?.totalElements || 0;
  const currentPage = Number(data?.number ?? data?.pageable?.pageNumber ?? data?.page ?? filters?.page ?? 0) || 0;

  const updatePage = useCallback((page) => {
    onPageChange?.(page);
  }, [onPageChange]);

  const handlePageChange = useCallback((page) => {
    updatePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [updatePage]);

  return {
    currentPage,
    totalPages,
    totalElements,
    updatePage,
    handlePageChange,
  };
};
