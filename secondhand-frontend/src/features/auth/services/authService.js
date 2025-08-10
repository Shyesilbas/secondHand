import apiClient from '../../../services/api/config';

export const authService = {
    login: async (email, password) => {
        const response = await apiClient.post('/auth/login', {
            email,
            password,
        });
        return response.data;
    },

    // Get current user profile
    getCurrentUser: async () => {
        const response = await apiClient.get('/v1/users/me');
        return response.data;
    },

    register: async (userData) => {
        const response = await apiClient.post('/auth/register', userData);
        return response.data;
    },

    logout: async () => {
        const response = await apiClient.post('/auth/logout');
        return response.data;
    },

    refreshToken: async (refreshToken) => {
        const response = await apiClient.post('/auth/refresh', {
            refreshToken,
        });
        return response.data;
    },

    forgotPassword: async (email) => {
        const response = await apiClient.post('/auth/password/forgot', {
            email,
        });
        return response.data;
    },

    resetPassword: async (token, newPassword) => {
        const response = await apiClient.post('/auth/password/reset', {
            token,
            newPassword,
        });
        return response.data;
    },

    validateToken: async () => {
        const response = await apiClient.get('/auth/validate');
        return response.data;
    },
};