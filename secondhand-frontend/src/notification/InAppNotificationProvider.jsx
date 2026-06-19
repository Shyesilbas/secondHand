import React, { useState, useCallback } from 'react';
import { useInAppNotifications } from './hooks/useInAppNotifications.js';
import { InAppNotificationContext } from './InAppNotificationContext.jsx';

export const InAppNotificationProvider = ({ children }) => {
    const [newNotifications, setNewNotifications] = useState([]);

    const handleNewNotification = useCallback((notification) => {
        setNewNotifications((prev) => [notification, ...prev]);
    }, []);

    const {
        notifications,
        totalElements,
        totalPages,
        isLoading,
        unreadCount,
        markAsRead,
        markAllAsRead,
        refetch,
        loadMore,
    } = useInAppNotifications(handleNewNotification);

    const clearNewNotifications = useCallback(() => {
        setNewNotifications([]);
    }, []);

    const value = {
        notifications,
        newNotifications,
        totalElements,
        totalPages,
        isLoading,
        unreadCount,
        markAsRead,
        markAllAsRead,
        refetch,
        loadMore,
        clearNewNotifications,
    };

    return (
        <InAppNotificationContext.Provider value={value}>
            {children}
        </InAppNotificationContext.Provider>
    );
};
