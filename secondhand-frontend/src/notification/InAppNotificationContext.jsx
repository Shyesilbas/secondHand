import React, { createContext, useContext, useState, useCallback } from 'react';
import { useInAppNotifications } from './hooks/useInAppNotifications.js';

const InAppNotificationContext = createContext();

export const useInAppNotificationsContext = () => {
    const context = useContext(InAppNotificationContext);
    if (!context) {
        throw new Error('useInAppNotificationsContext must be used within InAppNotificationProvider');
    }
    return context;
};

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

