import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext.jsx';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { ROUTES } from '../constants/routes.js';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const notification = useNotification();
    const notificationShown = useRef(false);

    useEffect(() => {
        if (!isLoading && !isAuthenticated && !notificationShown.current) {
            notificationShown.current = true;
            notification.addNotification({
                type: 'info',
                title: 'Authentication Required',
                message: 'Please Log In',
                autoClose: false,
                showCloseButton: false,
                actions: [
                    {
                        label: 'Cancel',
                        primary: false,
                        onClick: () => {
                            navigate(ROUTES.HOME, { replace: true });
                        }
                    },
                    {
                        label: 'OK',
                        primary: true,
                        onClick: () => {
                            navigate(ROUTES.LOGIN, { 
                                state: { from: location },
                                replace: true 
                            });
                        }
                    }
                ]
            });
        }
        
        if (isAuthenticated) {
            notificationShown.current = false;
        }
    }, [isAuthenticated, isLoading, location, navigate, notification]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return children;
};

export default ProtectedRoute;