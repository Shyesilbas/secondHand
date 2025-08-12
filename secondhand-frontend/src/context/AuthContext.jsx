import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUser, getToken, clearTokens, setUser, setTokens } from '../services/storage/tokenStorage';
import { authService } from '../features/auth/services/authService';
import { UserDTO } from '../types';

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
        const initializeAuth = () => {
            const token = getToken();
            const userData = getUser();

            if (token && userData) {
                setUserState(userData);
                setIsAuthenticated(true);
            }
            setIsLoading(false);
        };

        initializeAuth();
    }, []);

        const login = async (loginResponse) => {
        const { accessToken, refreshToken, userId, email } = loginResponse;
        
        // Store tokens
        setTokens(accessToken, refreshToken);
        
        try {
            const userProfile = await authService.getCurrentUser();
            
            const userData = { 
                ...UserDTO,
                id: userId,
                email,
                name: userProfile.name,
                surname: userProfile.surname,
                phoneNumber: userProfile.phoneNumber,
                gender: userProfile.gender,
                birthdate: userProfile.birthdate,
                accountStatus: userProfile.accountStatus,
                accountVerified: userProfile.accountVerified,
                canSell: userProfile.canSell,
                accountCreationDate: userProfile.accountCreationDate
            };
            setUser(userData);
            setUserState(userData);
            setIsAuthenticated(true);
        } catch (error) {
            console.error('Failed to fetch user profile:', error);
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

    const logout = async () => {
        try {
            await authService.logout();
        } catch (error) {
            console.error('Backend logout failed:', error);
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

    const value = {
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        updateUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};