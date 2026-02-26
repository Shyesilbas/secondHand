import React, {createContext, useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import {
    clearTokens,
    getUser,
    hasValidTokens,
    isCookieBasedAuth,
    setTokens,
    setUser
} from '../common/services/storage/tokenStorage.js';
import {authService} from './services/authService.js';
import {UserDTO} from '../common/index.js';
import logger from '../common/utils/logger.js';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

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
                const isCookieAuth = isCookieBasedAuth();


                if (userData) {
                    setAuthState({ user: userData, isAuthenticated: true, isLoading: true });
                }

                if (isCookieAuth || hasValidTokens()) {
                    if (!userData) {
                        try {
                            const userProfile = await authService.getCurrentUser();
                            const newUserData = {
                                ...UserDTO,
                                ...userProfile
                            };
                            setUser(newUserData);
                            setAuthState({ user: newUserData, isAuthenticated: true, isLoading: false });
                        } catch (error) {
                            clearTokens();
                            setAuthState({ user: null, isAuthenticated: false, isLoading: false });
                        }
                    } else {
                        setAuthState(prev => ({ ...prev, isLoading: false }));
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

        setTokens(null, null);

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
        } catch (error) {
            const userData = {
                ...UserDTO,
                id: userId,
                email
            };
            setUser(userData);
            setAuthState({ user: userData, isAuthenticated: true, isLoading: false });
        }
    }, []);

    const loginWithTokens = useCallback(async (accessToken, refreshToken) => {
        setTokens(accessToken, refreshToken);

        try {
            const userProfile = await authService.getCurrentUser();
            const userData = {
                ...UserDTO,
                ...userProfile
            };
            setUser(userData);
            setAuthState({ user: userData, isAuthenticated: true, isLoading: false });
        } catch (error) {
            setAuthState(prev => ({ ...prev, isAuthenticated: true, isLoading: false }));
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            await authService.logout();
        } catch (error) {
        } finally {
            clearTokens();
            setAuthState({ user: null, isAuthenticated: false, isLoading: false });
            // Reset flags so auth can be re-initialized if needed
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

    const handleTokenRefresh = useCallback((newAccessToken, newRefreshToken) => {
        setTokens(newAccessToken, newRefreshToken);
    }, []);

    const handleTokenRefreshFailure = useCallback(() => {
        logout();
    }, [logout]);

    const value = useMemo(() => ({
        authState,
        login,
        loginWithTokens,
        logout,
        updateUser,
        handleTokenRefresh,
        handleTokenRefreshFailure,
    }), [authState, login, loginWithTokens, logout, updateUser, handleTokenRefresh, handleTokenRefreshFailure]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Convenience hook for components that only need auth state (user, isAuthenticated, isLoading)
export const useAuthState = () => {
    const { authState } = useAuth();
    return authState;
};