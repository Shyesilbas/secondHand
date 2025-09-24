import { useQuery, useQueryClient } from '@tanstack/react-query';
import { chatService } from '../services/chatService.js';
import { useAuth } from '../../auth/AuthContext.jsx';

export const UNREAD_COUNT_KEYS = {
    all: ['unreadCount'],
    total: (userId) => [...UNREAD_COUNT_KEYS.all, 'total', userId],
    room: (roomId, userId) => [...UNREAD_COUNT_KEYS.all, 'room', roomId, userId],
};

export const useTotalUnreadCount = (options = {}) => {
    const { user, isAuthenticated } = useAuth();
    const queryClient = useQueryClient();

    const {
        data: totalUnread = 0,
        isLoading,
        error,
        refetch
    } = useQuery({
        queryKey: UNREAD_COUNT_KEYS.total(user?.id),
        queryFn: () => chatService.getTotalUnreadMessageCount(user.id),
        enabled: !!(isAuthenticated && user?.id && (options.enabled ?? true)),         staleTime: 3 * 60 * 1000,         cacheTime: 10 * 60 * 1000,         refetchInterval: 3 * 60 * 1000,         refetchOnWindowFocus: false,         refetchOnMount: false,         refetchIntervalInBackground: false,         retry: 2,         retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    });

        const invalidateTotalUnread = () => {
        queryClient.invalidateQueries({ 
            queryKey: UNREAD_COUNT_KEYS.total(user?.id),
            refetchType: 'none'         });
    };

    const setTotalUnread = (count) => {
        queryClient.setQueryData(UNREAD_COUNT_KEYS.total(user?.id), count);
    };

    const decrementUnread = (amount = 1) => {
        queryClient.setQueryData(UNREAD_COUNT_KEYS.total(user?.id), (prev) => 
            Math.max(0, (prev || 0) - amount)
        );
    };

    const incrementUnread = (amount = 1) => {
        queryClient.setQueryData(UNREAD_COUNT_KEYS.total(user?.id), (prev) => 
            (prev || 0) + amount
        );
    };

    return {
        totalUnread,
        isLoading,
        error,
        refetch,
        invalidateTotalUnread,
        setTotalUnread,
        decrementUnread,
        incrementUnread
    };
};

export const useRoomUnreadCount = (roomId) => {
    const { user, isAuthenticated } = useAuth();

    const {
        data: unreadCount = 0,
        isLoading,
        error,
        refetch
    } = useQuery({
        queryKey: UNREAD_COUNT_KEYS.room(roomId, user?.id),
        queryFn: () => chatService.getChatRoomUnreadCount(roomId, user.id),
        enabled: !!(isAuthenticated && user?.id && roomId),
        staleTime: 2 * 60 * 1000,         cacheTime: 5 * 60 * 1000,         refetchInterval: 2 * 60 * 1000,         refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchIntervalInBackground: false,
    });

    return {
        unreadCount,
        isLoading,
        error,
        refetch
    };
};
