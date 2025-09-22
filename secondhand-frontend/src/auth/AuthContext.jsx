import React, { createContext, useContext, useState, useEffect } from 'react';
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

export const AuthProvider = ({ children }) => {
    const [user, setUserState] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const userData = getUser();
                const isCookieAuth = isCookieBasedAuth();

                console.debug('Auth initialization - isCookieAuth:', isCookieAuth, 'hasUserData:', !!userData);

                // If we have cached user data, use it temporarily
                if (userData) {
                    setUserState(userData);
                    setIsAuthenticated(true);
                }

                // For cookie-based auth, try to validate session with server
                if (isCookieAuth) {
                    try {
                        console.debug('Attempting cookie-based validation...');
                        // First try to validate current session
                        const validationResult = await authService.validateToken();
                        
                        if (validationResult.valid) {
                            console.debug('Session is valid');
                            // If no cached user data, fetch current user
                            if (!userData) {
                                const userProfile = await authService.getCurrentUser();
                                const newUserData = {
                                    ...UserDTO,
                                    ...userProfile
                                };
                                setUser(newUserData);
                                setUserState(newUserData);
                                setIsAuthenticated(true);
                            }
                        } else {
                            console.debug('Session validation failed:', validationResult);
                            throw new Error('Session invalid');
                        }
                    } catch (error) {
                        console.debug('Cookie-based validation failed:', error.message);
                        // Clear any cached user data
                        setUserState(null);
                        setIsAuthenticated(false);
                        clearTokens();
                    }
                } else if (hasValidTokens()) {
                    // Token-based auth fallback
                    try {
                        await authService.validateToken();
                        if (!userData) {
                            const userProfile = await authService.getCurrentUser();
                            const newUserData = {
                                ...UserDTO,
                                ...userProfile
                            };
                            setUser(newUserData);
                            setUserState(newUserData);
                            setIsAuthenticated(true);
                        }
                    } catch (error) {
                        console.debug('Token validation failed, user not authenticated');
                        await logout();
                    }
                } else {
                    // No valid authentication method
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
            }
        };

        initializeAuth();
    }, []);

    const login = async (loginResponse) => {
        // With cookie-based auth, tokens are set by server as HttpOnly cookies
        // loginResponse now contains { userId, email, message, success } without tokens
        const { userId, email } = loginResponse;

        // setTokens is now a no-op for cookie-based auth but kept for compatibility
        setTokens(null, null);

        try {
            // Fetch complete user profile
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
            // Always call server logout to clear HttpOnly cookies
            await authService.logout();
        } catch (error) {
            // Continue with local logout even if server call fails
            console.debug('Server logout failed, continuing with local logout');
        } finally {
            clearTokens(); // Clear any client-side references
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
        // With cookie-based auth, tokens are managed by server
        // This function is kept for compatibility but doesn't store tokens
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