import { useQuery } from '@tanstack/react-query';
import { emailService } from '../../emails/services/emailService.js';
import { chatService } from '../../chat/services/chatService.js';
import { cartService } from '../../cart/services/cartService.js';
import { orderService } from '../../order/services/orderService.js';

const normalizeChatCount = (raw) => {
  if (typeof raw === 'number') return raw;
  if (typeof raw === 'string' && raw.trim() !== '') return Number(raw) || 0;
  return raw?.count ?? 0;
};

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
      const [emailCountRaw, chatCountRaw, cartItemsRaw, pendingRaw] = await Promise.all([
        emailService.getUnreadCount(),
        chatService.getTotalUnreadMessageCount(),
        cartService.getCartItems(),
        orderService.getPendingCompletionStatus(),
      ]);

      const emailCount = Number(emailCountRaw) || 0;
      const chatCount = normalizeChatCount(chatCountRaw);
      const cartCount = countCartItems(normalizeCartItems(cartItemsRaw));
      const orderCount = pendingRaw?.pendingCount ?? 0;

      return { emailCount, chatCount, cartCount, orderCount };
    },
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchInterval: 60 * 1000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
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

