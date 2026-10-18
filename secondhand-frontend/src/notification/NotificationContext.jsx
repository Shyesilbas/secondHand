import { createContext, useContext } from 'react';

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
