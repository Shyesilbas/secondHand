import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../services/notificationService.js';
import { useNotificationWebSocket } from './useNotificationWebSocket.js';
import { useAuth } from '../../auth/AuthContext.jsx';

export const useInAppNotifications = (onNewNotification) => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [unreadCount, setUnreadCount] = useState(0);

    const { data: notificationsData, isLoading, refetch } = useQuery({
        queryKey: ['notifications', user?.id],
        queryFn: () => notificationService.getNotifications(0, 20),
        enabled: !!user?.id,
        refetchInterval: 30000,
    });

    const { data: unreadCountData, refetch: refetchUnreadCount } = useQuery({
        queryKey: ['notifications', 'unread-count', user?.id],
        queryFn: () => notificationService.getUnreadCount(),
        enabled: !!user?.id,
        refetchInterval: 10000,
    });

    useEffect(() => {
        if (unreadCountData !== undefined) {
            setUnreadCount(unreadCountData);
        }
    }, [unreadCountData]);

    const markAsReadMutation = useMutation({
        mutationFn: (notificationId) => notificationService.markAsRead(notificationId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            refetchUnreadCount();
        },
    });

    const markAllAsReadMutation = useMutation({
        mutationFn: () => notificationService.markAllAsRead(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            refetchUnreadCount();
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
        setUnreadCount((prev) => prev + 1);
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

