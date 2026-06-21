import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    getUser,
    setUser,
    clearUser
} from '../common/services/storage/tokenStorage.js';
import { authService } from './services/authService.js';
import { UserDTO } from '../user/users.js';
import logger from '../common/utils/logger.js';
import { AuthContext } from './AuthContext.jsx';
import { setAuthContextRef } from '../common/services/api/interceptors.js';

export const AuthProvider = ({ children }) => {
    const [authState, setAuthState] = useState({
        user: null,
        isAuthenticated: false,
        isLoading: true
    });
    const isAuthInitializing = useRef(false);
    const isAuthInitialized = useRef(false);

    useEffect(() => {
        if (isAuthInitialized.current || isAuthInitializing.current) return;

        const initializeAuth = async () => {
            isAuthInitializing.current = true;
            try {
                const userData = getUser();

                if (userData) {
                    setAuthState({ user: userData, isAuthenticated: true, isLoading: true });
                    try {
                        const userProfile = await authService.getCurrentUser();
                        const newUserData = {
                            ...UserDTO,
                            ...userProfile
                        };
                        setUser(newUserData);
                        setAuthState({ user: newUserData, isAuthenticated: true, isLoading: false });
                    } catch {
                        clearUser();
                        setAuthState({ user: null, isAuthenticated: false, isLoading: false });
                    }
                } else {
                    setAuthState({ user: null, isAuthenticated: false, isLoading: false });
                }
            } catch (error) {
                logger.error('Auth initialization error:', error);
                setAuthState({ user: null, isAuthenticated: false, isLoading: false });
            } finally {
                isAuthInitialized.current = true;
                isAuthInitializing.current = false;
            }
        };

        initializeAuth();
    }, []);

    const login = useCallback(async (loginResponse) => {
        const { userId, email } = loginResponse;

        try {
            const userProfile = await authService.getCurrentUser();

            const userData = {
                ...UserDTO,
                id: userId,
                email,
                ...userProfile
            };

            setUser(userData);
            setAuthState({ user: userData, isAuthenticated: true, isLoading: false });
        } catch {
            const userData = {
                ...UserDTO,
                id: userId,
                email
            };
            setUser(userData);
            setAuthState({ user: userData, isAuthenticated: true, isLoading: false });
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            await authService.logout();
        } catch {
            // Ignore error since backend logout might fail if token is already expired
        } finally {
            clearUser();
            setAuthState({ user: null, isAuthenticated: false, isLoading: false });
            isAuthInitialized.current = false;
            isAuthInitializing.current = false;
        }
    }, []);

    const updateUser = useCallback((updatedUserData) => {
        setAuthState(prev => {
            const newUserData = { ...prev.user, ...updatedUserData };
            setUser(newUserData);
            return { ...prev, user: newUserData };
        });
    }, []);

    const handleTokenRefreshFailure = useCallback(() => {
        clearUser();
        setAuthState({ user: null, isAuthenticated: false, isLoading: false });
        isAuthInitialized.current = false;
        isAuthInitializing.current = false;
    }, []);

    const value = useMemo(() => ({
        authState,
        login,
        logout,
        updateUser,
        handleTokenRefreshFailure,
    }), [authState, login, logout, updateUser, handleTokenRefreshFailure]);

    useEffect(() => {
        setAuthContextRef({ handleTokenRefreshFailure });
    }, [handleTokenRefreshFailure]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
