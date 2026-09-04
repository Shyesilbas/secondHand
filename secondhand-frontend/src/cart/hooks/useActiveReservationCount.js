import { useQuery } from '@tanstack/react-query';
import apiClient from '../../common/services/api/interceptors.js';
import { API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';

export const useActiveReservationCount = (listingId, options = {}) => {
  const { enablePolling = false, pollInterval = 10 * 60 * 1000 } = options;

  const { data, isLoading, error } = useQuery({
    queryKey: ['listing', 'social-proof', listingId],
    queryFn: async () => {
      try {
        const response = await apiClient.get(API_ENDPOINTS.LISTINGS.SOCIAL_PROOF(listingId));
        const proof = response?.data || response;
        const inCart = typeof proof?.inCartCount === 'number' ? proof.inCartCount : 0;
        const viewers = typeof proof?.viewsLast24Hours === 'number' ? proof.viewsLast24Hours : 0;
        const favorites = typeof proof?.favoriteCount === 'number' ? proof.favoriteCount : 0;
        const urgencyType = inCart > 0 ? 'CART' : (viewers > 0 ? 'VIEWERS' : null);

        return {
          cartReservations: inCart,
          inCartCount: inCart,
          activeViewers: viewers,
          favoriteCount: favorites,
          count: Math.max(inCart, viewers),
          urgencyType
        };
      } catch {
        return { cartReservations: 0, inCartCount: 0, activeViewers: 0, favoriteCount: 0, count: 0, urgencyType: null };
      }
    },
    enabled: Boolean(listingId),
    refetchInterval: enablePolling ? pollInterval : false,
    staleTime: 30 * 1000, // 30 seconds cache
    refetchOnWindowFocus: true,
  });

  return {
    count: data?.count || 0,
    cartReservations: data?.cartReservations || 0,
    inCartCount: data?.inCartCount || 0,
    activeViewers: data?.activeViewers || 0,
    favoriteCount: data?.favoriteCount || 0,
    urgencyType: data?.urgencyType || null,
    isLoading,
    error
  };
};
