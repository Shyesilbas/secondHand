import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { orderService } from '../services/orderService.js';
import { useAuth } from '../../auth/AuthContext.jsx';

const PENDING_ORDERS_KEY = ['pendingCompletionOrders'];

export const usePendingCompletionOrders = (options = {}) => {
  const { user } = useAuth();
  const location = useLocation();
  const enabled = options.enabled !== false && !!user;

  const isRelevantPage = location.pathname.includes('/orders') || 
                         location.pathname.includes('/dashboard') ||
                         location.pathname === '/';

  const refetchInterval = isRelevantPage ? 2 * 60 * 1000 : 5 * 60 * 1000;

  const { data, isLoading } = useQuery({
    queryKey: [...PENDING_ORDERS_KEY, user?.id],
    queryFn: () => orderService.getPendingCompletionStatus(),
    enabled,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchInterval,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
  });

  return {
    hasPendingOrders: data?.hasPendingOrders ?? false,
    pendingCount: data?.pendingCount ?? 0,
    loading: isLoading,
  };
};
