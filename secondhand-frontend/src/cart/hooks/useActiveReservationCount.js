import { useQuery } from '@tanstack/react-query';
import apiClient from '../../common/services/api/interceptors.js';
import { API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';

export const useActiveReservationCount = (listingId, options = {}) => {
  const { enablePolling = false, pollInterval = 10 * 60 * 1000 } = options;

  const { data, isLoading, error } = useQuery({
    queryKey: ['listing', 'active-interest', listingId],
    queryFn: async () => {
      try {
        const [cartRes, viewersRes] = await Promise.allSettled([
          apiClient.get(API_ENDPOINTS.CART.RESERVATIONS_COUNT(listingId)),
          apiClient.get(API_ENDPOINTS.LISTINGS.ACTIVE_VIEWERS(listingId))
        ]);

        const extractCount = (res) => {
          if (res?.status !== 'fulfilled') return 0;
          const val = res.value;
          if (typeof val === 'number') return val;
          if (typeof val?.data?.count === 'number') return val.data.count;
          if (typeof val?.count === 'number') return val.count;
          if (typeof val?.data === 'number') return val.data;
          return 0;
        };

        const cartCount = extractCount(cartRes);
        const viewersCount = extractCount(viewersRes);
        const urgencyType = cartCount > 0 ? 'CART' : (viewersCount > 0 ? 'VIEWERS' : null);

        return {
          cartReservations: cartCount,
          activeViewers: viewersCount,
          count: Math.max(cartCount, viewersCount),
          urgencyType
        };
      } catch {
        return { cartReservations: 0, activeViewers: 0, count: 0, urgencyType: null };
      }
    },
    enabled: Boolean(listingId),
    refetchInterval: enablePolling ? pollInterval : false,
    staleTime: 10 * 60 * 1000, // 10 minutes cache
    refetchOnWindowFocus: false,
  });

  return {
    count: data?.count || 0,
    cartReservations: data?.cartReservations || 0,
    activeViewers: data?.activeViewers || 0,
    urgencyType: data?.urgencyType || null,
    isLoading,
    error
  };
};
