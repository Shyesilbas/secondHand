import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    getUser,
    getToken,
    getRefreshToken,
    clearTokens,
    setUser,
    setTokens,
    hasValidTokens,
    isCookieBasedAuth
} from '../common/services/storage/tokenStorage.js';
import { authService } from './services/authService.js';
import { UserDTO } from '../common/index.js';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Global flag to prevent multiple initializations
let isAuthInitializing = false;
let isAuthInitialized = false;

export const AuthProvider = ({ children }) => {
    const [user, setUserState] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        if (isAuthInitialized || isAuthInitializing) return;
        
        const initializeAuth = async () => {
            isAuthInitializing = true;
            try {
                const userData = getUser();
                const isCookieAuth = isCookieBasedAuth();

                console.debug('Auth initialization - isCookieAuth:', isCookieAuth, 'hasUserData:', !!userData);

                                if (userData) {
                    setUserState(userData);
                    setIsAuthenticated(true);
                }

                                if (isCookieAuth || hasValidTokens()) {
                    try {
                        console.debug('Attempting session validation via getCurrentUser...');
                        const userProfile = await authService.getCurrentUser();
                        console.debug('Session is valid, user profile fetched');
                        const newUserData = {
                            ...UserDTO,
                            ...userProfile
                        };
                        setUser(newUserData);
                        setUserState(newUserData);
                        setIsAuthenticated(true);
                    } catch (error) {
                        console.debug('Session validation failed:', error.message);
                        setUserState(null);
                        setIsAuthenticated(false);
                        clearTokens();
                    }
                } else {
                                        console.debug('No valid authentication found');
                    setUserState(null);
                    setIsAuthenticated(false);
                }
            } catch (error) {
                console.error('Auth initialization error:', error);
                setUserState(null);
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
                isAuthInitialized = true;
                isAuthInitializing = false;
            }
        };

        initializeAuth();
    }, []);

    const login = async (loginResponse) => {
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
            setUserState(userData);
            setIsAuthenticated(true);
        } catch (error) {
                        const userData = {
                ...UserDTO,
                id: userId,
                email
            };
            setUser(userData);
            setUserState(userData);
            setIsAuthenticated(true);
        }
    };

    const loginWithTokens = async (accessToken, refreshToken) => {
        setTokens(accessToken, refreshToken);

        try {
            const userProfile = await authService.getCurrentUser();
            const userData = {
                ...UserDTO,
                ...userProfile
            };
            setUser(userData);
            setUserState(userData);
            setIsAuthenticated(true);
        } catch (error) {
            setIsAuthenticated(true);
        }
    };

    const logout = async () => {
        try {
                        await authService.logout();
        } catch (error) {
                        console.debug('Server logout failed, continuing with local logout');
        } finally {
            clearTokens();
            setUserState(null);
            setIsAuthenticated(false);
            // Reset global flags so auth can be re-initialized if needed
            isAuthInitialized = false;
            isAuthInitializing = false;
        }
    };

    const updateUser = (updatedUserData) => {
        const newUserData = { ...user, ...updatedUserData };
        setUser(newUserData);
        setUserState(newUserData);
    };

    const handleTokenRefresh = (newAccessToken, newRefreshToken) => {
                        setTokens(newAccessToken, newRefreshToken);
        console.debug('Token refresh handled via server cookies');
    };

    const handleTokenRefreshFailure = () => {
        logout();
    };

    const value = {
        user,
        isAuthenticated,
        isLoading,
        login,
        loginWithTokens,
        logout,
        updateUser,
        handleTokenRefresh,
        handleTokenRefreshFailure,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};