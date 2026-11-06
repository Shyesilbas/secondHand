import { useQuery } from '@tanstack/react-query';
import { useAuthState } from '../../auth/AuthContext.jsx';
import { orderService } from '../services/orderService.js';
import { ORDER_QUERY_KEYS } from '../orderConstants.js';
import { ORDER_TIME, SELLER_TO_SHIP_STATUSES } from '../constants/orderUiConstants.js';

/**
 * Number of sold orders waiting for the seller to ship.
 * Shares the I_SOLD page's status-count cache key, so its invalidations refresh this too.
 */
export const useSellerToShipCount = () => {
  const { user } = useAuthState();
  const { data } = useQuery({
    queryKey: ORDER_QUERY_KEYS.sellerStatusCounts(user?.id, 'ALL'),
    queryFn: () => orderService.sellerOrderStatusCounts('ALL'),
    enabled: !!user?.id,
    staleTime: ORDER_TIME.ORDERS_LIST_STALE_MS,
    refetchOnWindowFocus: true,
  });

  return (data || [])
    .filter(({ status }) => SELLER_TO_SHIP_STATUSES.includes(status))
    .reduce((sum, { count }) => sum + (Number(count) || 0), 0);
};
