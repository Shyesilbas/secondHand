import React, {createContext, useCallback, useContext, useState} from 'react';
import NotificationModal from './NotificationModal.jsx';

const NotificationContext = createContext();

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    const addNotification = useCallback((notification) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newNotification = {
            id,
            isOpen: true,
            autoClose: true,
            autoCloseDelay: 9000,
            showCloseButton: true,
            size: 'md',
            ...notification
        };
        setNotifications(prev => [...prev, newNotification]);
        return id;
    }, []);

    const removeNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
    }, []);

    const removeAllNotifications = useCallback(() => {
        setNotifications([]);
    }, []);

    const showSuccess = useCallback((title, message, options = {}) => {
        return addNotification({ type: 'success', title: title || 'Success', message, autoCloseDelay: 2000, ...options });
    }, [addNotification]);

    const showError = useCallback((title, message, options = {}) => {
        return addNotification({ type: 'error', title: title || 'Error', message, autoClose: false, ...options });
    }, [addNotification]);

    const showWarning = useCallback((title, message, options = {}) => {
        return addNotification({ type: 'warning', title: title || 'Warning', message, autoCloseDelay: 2000, ...options });
    }, [addNotification]);

    const showInfo = useCallback((title, message, options = {}) => {
        return addNotification({ type: 'info', title: title || 'Information', message, autoCloseDelay: 2000, ...options });
    }, [addNotification]);

    const showNotification = useCallback((notification) => {
        const type = notification.type || 'info';
        switch(type) {
            case 'success':
                return showSuccess(notification.title, notification.message, notification);
            case 'error':
                return showError(notification.title, notification.message, notification);
            case 'warning':
                return showWarning(notification.title, notification.message, notification);
            case 'info':
            default:
                return showInfo(notification.title, notification.message, notification);
        }
    }, [showSuccess, showError, showWarning, showInfo]);

    const showConfirmation = useCallback((title, message, onConfirm) => {
        const id = addNotification({
            type: 'info',
            title,
            message,
            autoClose: false,
            actions: [
                {
                    label: 'Cancel',
                    primary: false,
                },
                {
                    label: 'Confirm',
                    primary: true,
                    onClick: () => {
                        onConfirm?.();
                        removeNotification(id);
                    }
                }
            ]
        });
    }, [addNotification, removeNotification]);


    const value = {
        notifications,
        addNotification,
        removeNotification,
        removeAllNotifications,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        showNotification,
        showConfirmation
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
            {notifications.map(notification => (
                <NotificationModal
                    key={notification.id}
                    {...notification}
                    onClose={() => removeNotification(notification.id)}
                />
            ))}
        </NotificationContext.Provider>
    );
};
