import React, {createContext, useCallback, useContext, useState} from 'react';
import NotificationModal from './NotificationModal.jsx';
import Toast from './components/Toast.jsx';

const noop = () => {};
const defaultContext = {
    addNotification: noop,
    removeNotification: noop,
    removeAllNotifications: noop,
    showSuccess: noop,
    showError: noop,
    showWarning: noop,
    showInfo: noop,
    showNotification: noop,
    showConfirmation: noop,
    showDetailedError: noop,
};

const NotificationContext = createContext(defaultContext);

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [toasts, setToasts] = useState([]);

    const addNotification = useCallback((notification) => {
        const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substr(2, 9);
        if (notification.toast) {
            const toast = { id, ...notification };
            setToasts(prev => [...prev, toast]);
            return id;
        }
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
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const removeAllNotifications = useCallback(() => {
        setNotifications([]);
    }, []);

    const showSuccess = useCallback((title, message, options = {}) => {
        return addNotification({ type: 'success', title: title || 'Success', message, autoCloseDelay: 2000, ...options });
    }, [addNotification]);

    const showError = useCallback((title, message, options = {}) => {
        const { errorCode, validationErrors, details, ...restOptions } = options;
        
        // Validation errors varsa mesaja ekle
        let fullMessage = message;
        if (validationErrors && Object.keys(validationErrors).length > 0) {
            const validationText = Object.entries(validationErrors)
                .map(([field, msg]) => `• ${field}: ${msg}`)
                .join('\n');
            fullMessage = `${message}\n\n${validationText}`;
        }
        
        // Error code varsa title'a ekle
        const fullTitle = errorCode ? `${title} (${errorCode})` : title;
        
        return addNotification({ 
            type: 'error', 
            title: fullTitle || 'Error', 
            message: fullMessage, 
            autoClose: false,
            showDetails: !!details,
            errorDetails: details,
            ...restOptions 
        });
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


    const showDetailedError = useCallback((parsedError, options = {}) => {
        return showError(
            options.customTitle || 'Error',
            parsedError.message,
            {
                errorCode: parsedError.errorCode,
                validationErrors: parsedError.validationErrors,
                details: options.showDetails ? {
                    status: parsedError.statusCode,
                    timestamp: parsedError.timestamp,
                    path: parsedError.path
                } : null,
                ...options
            }
        );
    }, [showError]);

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
        showConfirmation,
        showDetailedError
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
            <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2">
                {toasts.map(toast => (
                    <Toast
                        key={toast.id}
                        title={toast.title}
                        message={toast.message}
                        autoClose={toast.autoClose ?? true}
                        autoCloseDelay={toast.autoCloseDelay ?? 2500}
                        onClose={() => removeNotification(toast.id)}
                    />
                ))}
            </div>
        </NotificationContext.Provider>
    );
};
