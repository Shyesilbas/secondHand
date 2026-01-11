import { useState, useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { orderService } from '../services/orderService.js';
import { useAuth } from '../../auth/AuthContext.jsx';

const ORDERS_KEYS = {
  all: ['orders'],
  myOrders: (page, size, sort, direction) => [...ORDERS_KEYS.all, 'my', { page, size, sort, direction }],
};

export const useOrders = (initialPage = 0, initialSize = 10, sortField = null, sortDirection = 'desc') => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [page, setPage] = useState(initialPage);
  const [size] = useState(initialSize);
  const [sort, setSort] = useState(sortField);
  const [direction, setDirection] = useState(sortDirection);
  const [searchResult, setSearchResult] = useState(null);

  const {
    data,
    isLoading: loading,
    error: queryError,
    refetch
  } = useQuery({
    queryKey: ORDERS_KEYS.myOrders(page, size, sort, direction),
    queryFn: async () => {
      const response = await orderService.myOrders(page, size, sort, direction);
      return response.data || response;
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  const orders = useMemo(() => data?.content || [], [data]);
  
  const pagination = useMemo(() => ({
    number: data?.pageable?.pageNumber ?? data?.number ?? page,
    size: data?.pageable?.pageSize ?? data?.size ?? size,
    totalPages: data?.totalPages ?? 0,
    totalElements: data?.totalElements ?? 0,
    first: data?.first ?? true,
    last: data?.last ?? false,
  }), [data, page, size]);

  const error = queryError?.message || null;

  const loadPage = useCallback((newPage) => {
    setPage(newPage);
  }, []);

  const fetchOrders = useCallback((newPage, newSize, newSort, newDirection) => {
    setPage(newPage);
    if (newSort !== undefined) setSort(newSort);
    if (newDirection !== undefined) setDirection(newDirection);
  }, []);

  const refresh = useCallback(() => {
    setSearchResult(null);
    queryClient.invalidateQueries({ queryKey: ORDERS_KEYS.all });
    refetch();
  }, [queryClient, refetch]);

  const setSearchOrder = useCallback((order) => {
    setSearchResult(order);
  }, []);

  const displayOrders = searchResult ? [searchResult] : orders;

  return {
    orders: displayOrders,
    loading,
    error,
    pagination,
    fetchOrders,
    loadPage,
    refresh,
    setSearchOrder
  };
};
