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

export const NotificationContext = createContext(defaultContext);

export const useNotification = () => useContext(NotificationContext);
