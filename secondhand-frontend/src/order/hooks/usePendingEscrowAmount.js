import { useQuery } from '@tanstack/react-query';
import { orderService } from '../services/orderService.js';
import { useAuth } from '../../auth/AuthContext.jsx';

const ESCROW_KEYS = {
  all: ['escrow'],
  pending: (userId) => [...ESCROW_KEYS.all, 'pending', userId],
};

export const usePendingEscrowAmount = (options = {}) => {
  const { user } = useAuth();
  const enabled = options.enabled !== false && !!user;

  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ESCROW_KEYS.pending(user?.id),
    queryFn: async () => {
      const response = await orderService.getPendingEscrowAmount();
      return response.amount || 0;
    },
    enabled,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchInterval: 30 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  return {
    pendingEscrowAmount: data ?? 0,
    isLoading,
    error: error?.message || null,
    refetch,
  };
};

