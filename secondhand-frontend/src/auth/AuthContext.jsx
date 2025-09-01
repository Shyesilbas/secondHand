import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    getUser,
    getToken,
    getRefreshToken,
    clearTokens,
    setUser,
    setTokens,
    hasValidTokens
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

export const AuthProvider = ({ children }) => {
    const [user, setUserState] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                if (!hasValidTokens()) {
                    setIsLoading(false);
                    return;
                }

                const token = getToken();
                const userData = getUser();

                if (token && userData) {
                    setUserState(userData);
                    setIsAuthenticated(true);

                    try {
                        await authService.validateToken();
                    } catch (error) {
                        // Token will be refreshed by interceptor
                    }
                } else if (token) {
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
                        await logout();
                    }
                }
            } catch (error) {
                await logout();
            } finally {
                setIsLoading(false);
            }
        };

        initializeAuth();
    }, []);

    const login = async (loginResponse) => {
        const { accessToken, refreshToken, userId, email } = loginResponse;

        setTokens(accessToken, refreshToken);

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
            // Set basic user data from login response
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
            const token = getToken();
            if (token) {
                await authService.logout();
            }
        } catch (error) {
            // Continue with local logout
        } finally {
            clearTokens();
            setUserState(null);
            setIsAuthenticated(false);
        }
    };

    const updateUser = (updatedUserData) => {
        const newUserData = { ...user, ...updatedUserData };
        setUser(newUserData);
        setUserState(newUserData);
    };

    const handleTokenRefresh = (newAccessToken, newRefreshToken) => {
        setTokens(newAccessToken, newRefreshToken);
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