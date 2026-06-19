import { createContext, useContext } from 'react';

export const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Convenience hook for components that only need auth state (user, isAuthenticated, isLoading)
export const useAuthState = () => {
    const { authState } = useAuth();
    return authState;
};