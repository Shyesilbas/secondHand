import { useQuery } from '@tanstack/react-query';
import { showcaseService } from '../services/showcaseService.js';

export const SHOWCASE_QUERY_KEYS = {
  all: ['showcases'],
  active: () => [...SHOWCASE_QUERY_KEYS.all, 'active'],
  mine: (userId) => [...SHOWCASE_QUERY_KEYS.all, 'mine', userId || 'anonymous'],
};

export const useShowcaseQueries = (options = {}) => {
  const { enabled = true } = options;

  const {
    data: showcases = [],
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: SHOWCASE_QUERY_KEYS.active(),
    queryFn: showcaseService.getActiveShowcases,
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
    retryDelay: 1000,
  });

  const isInShowcase = (listingId) => {
    if (!Array.isArray(showcases)) return false;
    return showcases.some((s) => (s?.listing?.id || s?.listingId) === listingId);
  };

  return {
    showcases,
    loading,
    error: error?.message,
    refetch,
    isInShowcase,
  };
};

