import { useQuery, useQueryClient } from '@tanstack/react-query';
import { orderService } from '../services/orderService.js';
import { ORDER_QUERY_KEYS } from '../orderConstants.js';

export const useOrderDetails = (orderId, isSellerView = false, options = {}) => {
  const queryClient = useQueryClient();

  const queryKey = ORDER_QUERY_KEYS.detail(orderId, isSellerView);

  const queryFn = async () => {
    if (!orderId) return null;
    return isSellerView
      ? await orderService.getSellerOrderById(orderId)
      : await orderService.getById(orderId);
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn,
    enabled: !!orderId && options.enabled !== false,
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // 5 minutes
    ...options,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey });
  };

  return {
    order: data,
    isLoading,
    error: error?.message || null,
    refetch,
    invalidate,
  };
};
