import React, { createContext, useContext, useState, useCallback } from 'react';
import NotificationModal from '../components/notifications/NotificationModal';

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
            autoCloseDelay: 5000,
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
            title: title || 'Başarılı',
            message,
            autoCloseDelay: 4000,
            ...options
        });
    }, [addNotification]);

    const showError = useCallback((title, message, options = {}) => {
        return addNotification({
            type: 'error',
            title: title || 'Hata',
            message,
            autoClose: false, // Errors should be manually dismissed
            ...options
        });
    }, [addNotification]);

    const showWarning = useCallback((title, message, options = {}) => {
        return addNotification({
            type: 'warning',
            title: title || 'Uyarı',
            message,
            autoCloseDelay: 6000,
            ...options
        });
    }, [addNotification]);

    const showInfo = useCallback((title, message, options = {}) => {
        return addNotification({
            type: 'info',
            title: title || 'Bilgi',
            message,
            autoCloseDelay: 5000,
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
        const message = customMessage || errorData.message || 'Bilinmeyen bir hata oluştu';
        
        const defaultActions = actions.length > 0 ? actions : [
            {
                label: 'Tamam',
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
            confirmText = 'Evet',
            cancelText = 'Hayır',
            type = 'warning'
        } = options;

        return addNotification({
            type,
            title: title || 'Onay',
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
    if (!errorData || !errorData.type) return 'Hata';
    
    switch (errorData.type) {
        case 'authentication':
            return 'Giriş Hatası';
        case 'authorization':
            return 'Yetki Hatası';
        case 'validation':
            return 'Doğrulama Hatası';
        case 'network':
            return 'Bağlantı Hatası';
        case 'server':
            return 'Sunucu Hatası';
        default:
            return 'Hata';
    }
};