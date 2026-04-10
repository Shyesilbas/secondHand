import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { userBadgesService } from '../../user/services/userBadgesService.js';

const getStoredCartCount = () => {
  const raw = Number(localStorage.getItem('cartCount'));
  return Number.isFinite(raw) && raw >= 0 ? raw : 0;
};

export const useBadgeCounts = ({ enabled = true, userId } = {}) => {
  const [cartCount, setCartCount] = useState(getStoredCartCount);

  useEffect(() => {
    const onCartCountChanged = (event) => {
      const nextCount = Number(event?.detail);
      if (Number.isFinite(nextCount) && nextCount >= 0) {
        setCartCount(nextCount);
        return;
      }
      setCartCount(getStoredCartCount());
    };

    window.addEventListener('cartCountChanged', onCartCountChanged);
    return () => window.removeEventListener('cartCountChanged', onCartCountChanged);
  }, []);

  const query = useQuery({
    queryKey: ['badgeCounts', userId],
    enabled: !!enabled && !!userId,
    queryFn: async () => {
      const badges = await userBadgesService.getBadges();

      const emailCount = Number(badges.emailUnreadCount) || 0;
      const chatCount = Number(badges.chatUnreadCount) || 0;
      const orderCount = Number(badges.pendingOrderCount) || 0;

      return { emailCount, chatCount, orderCount };
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

  const data = query.data || { emailCount: 0, chatCount: 0, orderCount: 0 };

  return {
    emailCount: data.emailCount ?? 0,
    chatCount: data.chatCount ?? 0,
    cartCount,
    orderCount: data.orderCount ?? 0,
    isLoading: query.isLoading,
    error: query.error || null,
  };
};

