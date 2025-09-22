import { useQuery, useQueryClient } from '@tanstack/react-query';
import { chatService } from '../services/chatService.js';
import { useAuth } from '../../auth/AuthContext.jsx';

// Query keys for unread counts
export const UNREAD_COUNT_KEYS = {
    all: ['unreadCount'],
    total: (userId) => [...UNREAD_COUNT_KEYS.all, 'total', userId],
    room: (roomId, userId) => [...UNREAD_COUNT_KEYS.all, 'room', roomId, userId],
};

/**
 * Hook for total unread message count across all chat rooms
 * Optimized for header and navigation components
 */
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
        enabled: !!(isAuthenticated && user?.id && (options.enabled ?? true)), // Only fetch if authenticated and enabled
        staleTime: 3 * 60 * 1000, // Data is fresh for 3 minutes
        cacheTime: 10 * 60 * 1000, // Cache for 10 minutes
        refetchInterval: 3 * 60 * 1000, // Poll every 3 minutes (conservative)
        refetchOnWindowFocus: false, // Don't refetch when window gains focus
        refetchOnMount: false, // Don't refetch on every mount
        refetchIntervalInBackground: false, // Don't poll in background
        retry: 2, // Retry failed requests 2 times
        retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    });

    // Helper functions for cache management
    const invalidateTotalUnread = () => {
        queryClient.invalidateQueries({ 
            queryKey: UNREAD_COUNT_KEYS.total(user?.id),
            refetchType: 'none' // Just mark as stale, don't refetch immediately
        });
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

/**
 * Hook for specific chat room unread count
 * Used in chat components
 */
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
        staleTime: 2 * 60 * 1000, // Data is fresh for 2 minutes
        cacheTime: 5 * 60 * 1000, // Cache for 5 minutes
        refetchInterval: 2 * 60 * 1000, // Poll every 2 minutes
        refetchOnWindowFocus: false,
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
