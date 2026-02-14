import { useQuery } from '@tanstack/react-query';
import { userBadgesService } from '../../user/services/userBadgesService.js';
import { cartService } from '../../cart/services/cartService.js';

// Cart endpoint remains separate as it returns items, not just count
const normalizeCartItems = (raw) => {
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.content)) return raw.content;
  return [];
};

const countCartItems = (items) => {
  if (!Array.isArray(items)) return 0;
  return items.reduce((total, item) => total + (item?.quantity || 1), 0);
};

export const useBadgeCounts = ({ enabled = true, userId } = {}) => {
  const query = useQuery({
    queryKey: ['badgeCounts', userId],
    enabled: !!enabled && !!userId,
    queryFn: async () => {
      // OPTIMIZATION: Use aggregated endpoint (4 requests → 2 requests)
      const [badges, cartItemsRaw] = await Promise.all([
        userBadgesService.getBadges(), // Single endpoint for 3 counts
        cartService.getCartItems(),     // Separate as it returns items
      ]);

      const emailCount = Number(badges.notificationCount) || 0;
      const chatCount = Number(badges.chatUnreadCount) || 0;
      const cartCount = countCartItems(normalizeCartItems(cartItemsRaw));
      const orderCount = Number(badges.pendingOrderCount) || 0;

      return { emailCount, chatCount, cartCount, orderCount };
    },
    staleTime: 2 * 60 * 1000, // 2 min - reduce refetches
    gcTime: 10 * 60 * 1000,
    refetchInterval: false, // No polling - rely on focus/mount
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true, // Re-enabled for better UX
    refetchOnMount: true,
    retry: 1,
    retryDelay: 1000,
  });

  const data = query.data || { emailCount: 0, chatCount: 0, cartCount: 0, orderCount: 0 };

  return {
    emailCount: data.emailCount ?? 0,
    chatCount: data.chatCount ?? 0,
    cartCount: data.cartCount ?? 0,
    orderCount: data.orderCount ?? 0,
    isLoading: query.isLoading,
    error: query.error || null,
  };
};

