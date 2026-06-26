import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../services/notificationService.js';
import { useNotificationWebSocket } from './useNotificationWebSocket.js';
import { useAuthState } from '../../auth/AuthContext.jsx';
import { useBadgeCounts } from '../../common/hooks/useBadgeCounts.js';

export const useInAppNotifications = (onNewNotification) => {
    const { user } = useAuthState();
    const queryClient = useQueryClient();
    const { notificationCount: unreadCount } = useBadgeCounts({ userId: user?.id });

    const { data: notificationsData, isLoading, refetch } = useQuery({
        queryKey: ['notifications', user?.id],
        queryFn: () => notificationService.getNotifications(0, 20),
        enabled: !!user?.id,
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        refetchInterval: false,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    });

    const markAsReadMutation = useMutation({
        mutationFn: (notificationId) => notificationService.markAsRead(notificationId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.setQueryData(['badgeCounts', user?.id], (old) => {
                if (!old) return old;
                return {
                    ...old,
                    notificationCount: Math.max(0, (old.notificationCount || 0) - 1)
                };
            });
        },
    });

    const markAllAsReadMutation = useMutation({
        mutationFn: () => notificationService.markAllAsRead(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.setQueryData(['badgeCounts', user?.id], (old) => {
                if (!old) return old;
                return {
                    ...old,
                    notificationCount: 0
                };
            });
        },
    });

    const handleNotificationReceived = useCallback((notification) => {
        queryClient.setQueryData(['notifications', user?.id], (oldData) => {
            if (!oldData) {
                return {
                    content: [notification],
                    totalElements: 1,
                    totalPages: 1,
                    number: 0,
                    size: 20,
                };
            }
            return {
                ...oldData,
                content: [notification, ...(oldData.content || [])],
                totalElements: (oldData.totalElements || 0) + 1,
            };
        });
        
        queryClient.setQueryData(['badgeCounts', user?.id], (old) => {
            if (!old) return old;
            return {
                ...old,
                notificationCount: (old.notificationCount || 0) + 1
            };
        });

        onNewNotification?.(notification);
    }, [user?.id, queryClient, onNewNotification]);

    useNotificationWebSocket(handleNotificationReceived);

    const markAsRead = useCallback((notificationId) => {
        markAsReadMutation.mutate(notificationId);
    }, [markAsReadMutation]);

    const markAllAsRead = useCallback(() => {
        markAllAsReadMutation.mutate();
    }, [markAllAsReadMutation]);

    const loadMore = useCallback((page) => {
        return notificationService.getNotifications(page, 20);
    }, []);

    return {
        notifications: notificationsData?.content || [],
        totalElements: notificationsData?.totalElements || 0,
        totalPages: notificationsData?.totalPages || 0,
        isLoading,
        unreadCount,
        markAsRead,
        markAllAsRead,
        refetch,
        loadMore,
    };
};

