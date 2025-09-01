import React, { createContext, useContext, useState, useCallback } from 'react';
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
            autoCloseDelay: 2000,
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

    // Convenience methods for different notification types
    const showSuccess = useCallback((title, message, options = {}) => {
        return addNotification({
            type: 'success',
            title: title || 'Success',
            message,
            autoCloseDelay: 2000,
            ...options
        });
    }, [addNotification]);

    const showError = useCallback((title, message, options = {}) => {
        return addNotification({
            type: 'error',
            title: title || 'Error',
            message,
            autoClose: false, // Errors should be manually dismissed
            ...options
        });
    }, [addNotification]);

    const showWarning = useCallback((title, message, options = {}) => {
        return addNotification({
            type: 'warning',
            title: title || 'Warning',
            message,
            autoCloseDelay: 2000,
            ...options
        });
    }, [addNotification]);

    const showInfo = useCallback((title, message, options = {}) => {
        return addNotification({
            type: 'info',
            title: title || 'Information',
            message,
            autoCloseDelay: 2000,
            ...options
        });
    }, [addNotification]);

    // Enhanced error handler with detailed error information
    const showDetailedError = useCallback((errorData, options = {}) => {
        const {
            customTitle,
            customMessage,
            showDetails = true,
            actions = []
        } = options;

        const title = customTitle || getErrorTitle(errorData);
        const message = customMessage || errorData.message || 'Unknown error occurred. Please try again later.';
        
        const defaultActions = actions.length > 0 ? actions : [
            {
                label: 'Okay',
                onClick: () => {},
                primary: true
            }
        ];

        return addNotification({
            type: 'error',
            title,
            message,
            details: showDetails ? {
                statusCode: errorData.statusCode,
                originalMessage: errorData.originalMessage,
                timestamp: errorData.timestamp,
                type: errorData.type
            } : null,
            actions: defaultActions,
            autoClose: false,
            size: showDetails ? 'lg' : 'md'
        });
    }, [addNotification]);

    // Confirmation dialog
    const showConfirmation = useCallback((title, message, onConfirm, onCancel, options = {}) => {
        const {
            confirmText = 'Yes',
            cancelText = 'No',
            type = 'warning'
        } = options;

        return addNotification({
            type,
            title: title || 'Approve',
            message,
            autoClose: false,
            actions: [
                {
                    label: cancelText,
                    onClick: onCancel,
                    primary: false
                },
                {
                    label: confirmText,
                    onClick: onConfirm,
                    primary: true
                }
            ],
            ...options
        });
    }, [addNotification]);

    const value = {
        notifications,
        addNotification,
        removeNotification,
        removeAllNotifications,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        showDetailedError,
        showConfirmation
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
            {/* Render all active notifications */}
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

// Helper function to get error title based on error type
const getErrorTitle = (errorData) => {
    if (!errorData || !errorData.type) return 'Error';
    
    switch (errorData.type) {
        case 'authentication':
            return 'Authentication Error';
        case 'authorization':
            return 'Authorization Error';
        case 'validation':
            return 'Validation Error';
        case 'network':
            return 'Network Error';
        case 'server':
            return 'Server Error';
        default:
            return 'Error';
    }
};