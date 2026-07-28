import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
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
import { decodeJwtPayload } from '../common/utils/jwtDecode.js';

export const AuthProvider = ({ children }) => {
    const queryClient = useQueryClient();
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
                const isOauthSuccess = window.location.search.includes('oauth_success=true');
                const userData = getUser();

                if (userData || isOauthSuccess) {
                    if (isOauthSuccess) {
                        window.history.replaceState({}, document.title, window.location.pathname);
                    }
                    setAuthState({ user: userData, isAuthenticated: true, isLoading: true });
                    try {
                        const userProfile = await authService.getCurrentUser();
                        const newUserData = {
                            ...UserDTO,
                            ...userProfile,
                            plan: userData?.plan || 'FREE',
                            planExpiry: userData?.planExpiry || null
                        };
                        setUser(newUserData);
                        setAuthState({ user: newUserData, isAuthenticated: true, isLoading: false });
                    } catch (error) {
                        const isNetworkError = error?.errorCode === 'NETWORK_ERROR' || !error?.response;
                        if (isNetworkError) {
                            logger.warn('Backend offline or network error during auth initialization. Preserving session.');
                            setAuthState({ user: userData, isAuthenticated: true, isLoading: false });
                        } else {
                            clearUser();
                            setAuthState({ user: null, isAuthenticated: false, isLoading: false });
                        }
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
        const { userId, email, accessToken } = loginResponse;

        let plan = 'FREE';
        let planExpiry = null;
        if (accessToken) {
            const decoded = decodeJwtPayload(accessToken);
            if (decoded) {
                plan = decoded.plan || 'FREE';
                planExpiry = decoded.planExpiry || null;
            }
        }

        try {
            const userProfile = await authService.getCurrentUser();

            const userData = {
                ...UserDTO,
                id: userId,
                email,
                ...userProfile,
                plan,
                planExpiry
            };

            setUser(userData);
            setAuthState({ user: userData, isAuthenticated: true, isLoading: false });
        } catch {
            const userData = {
                ...UserDTO,
                id: userId,
                email,
                plan,
                planExpiry
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

    const handleTokenRefreshSuccess = useCallback((newAccessToken) => {
        if (!newAccessToken) return;
        try {
            const decoded = decodeJwtPayload(newAccessToken);
            if (decoded) {
                const plan = decoded.plan || 'FREE';
                const planExpiry = decoded.planExpiry || null;
                setAuthState(prev => {
                    if (!prev.user) return prev;
                    const newUserData = { ...prev.user, plan, planExpiry };
                    setUser(newUserData);
                    return { ...prev, user: newUserData };
                });
                queryClient.invalidateQueries({ queryKey: ['membership'] });
            }
        } catch (error) {
            logger.error('Failed to decode refreshed token:', error);
        }
    }, [queryClient]);

    const value = useMemo(() => ({
        authState,
        login,
        logout,
        updateUser,
        handleTokenRefreshFailure,
        handleTokenRefreshSuccess,
    }), [authState, login, logout, updateUser, handleTokenRefreshFailure, handleTokenRefreshSuccess]);

    useEffect(() => {
        setAuthContextRef({ handleTokenRefreshFailure, handleTokenRefreshSuccess });
    }, [handleTokenRefreshFailure, handleTokenRefreshSuccess]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
