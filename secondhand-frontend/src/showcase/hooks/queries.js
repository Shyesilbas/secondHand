import { useQuery } from '@tanstack/react-query';
import { showcaseService } from '../services/showcaseService.js';

export const SHOWCASE_QUERY_KEYS = {
  all: ['showcases'],
  active: (page = 0, size = 12) => [...SHOWCASE_QUERY_KEYS.all, 'active', page, size],
  mine: (userId) => [...SHOWCASE_QUERY_KEYS.all, 'mine', userId || 'anonymous'],
};

export const useShowcaseQueries = (options = {}) => {
  const { enabled = true, page = 0, size = 12 } = options;

  const {
    data: showcasePage,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: SHOWCASE_QUERY_KEYS.active(page, size),
    queryFn: () => showcaseService.getActiveShowcases({ page, size }),
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
    retryDelay: 1000,
  });

  const showcases = Array.isArray(showcasePage?.content) ? showcasePage.content : [];

  const isInShowcase = (listingId) => {
    if (!Array.isArray(showcases)) return false;
    return showcases.some((s) => (s?.listing?.id || s?.listingId) === listingId);
  };

  return {
    showcases,
    showcasePage,
    loading,
    error: error?.message,
    refetch,
    isInShowcase,
  };
};

