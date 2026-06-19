import React, { createContext, useContext } from 'react';

export const InAppNotificationContext = createContext();

export const useInAppNotificationsContext = () => {
    const context = useContext(InAppNotificationContext);
    if (!context) {
        throw new Error('useInAppNotificationsContext must be used within InAppNotificationProvider');
    }
    return context;
};


