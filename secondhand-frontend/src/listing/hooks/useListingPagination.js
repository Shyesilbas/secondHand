import { useCallback } from 'react';

/**
 * Derives pagination state from the API response and provides a page-change handler.
 */
export const useListingPagination = ({ data, filters, onPageChange }) => {
  const totalPages = data?.totalPages || 0;
  const totalElements = data?.totalElements || 0;
  const currentPage =
    Number(data?.number ?? data?.pageable?.pageNumber ?? data?.page ?? filters?.page ?? 0) || 0;

  const handlePageChange = useCallback(
    (page) => {
      onPageChange?.(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [onPageChange],
  );

  return { currentPage, totalPages, totalElements, handlePageChange };
};
