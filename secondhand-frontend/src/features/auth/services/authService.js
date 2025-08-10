import apiClient from '../../../services/api/config';
import { API_ENDPOINTS } from '../../../constants/apiEndpoints';

export const authService = {
    login: async (email, password) => {
        const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, {
            email,
            password,
        });
        return response.data;
    },

    // Get current user profile
    getCurrentUser: async () => {
        const response = await apiClient.get(API_ENDPOINTS.USER.ME);
        return response.data;
    },

    register: async (userData) => {
        const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, userData);
        return response.data;
    },

    logout: async () => {
        const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
        return response.data;
    },

    refreshToken: async (refreshToken) => {
        const response = await apiClient.post(API_ENDPOINTS.AUTH.REFRESH, {
            refreshToken,
        });
        return response.data;
    },

    forgotPassword: async (email) => {
        const response = await apiClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
            email,
        });
        return response.data;
    },

    resetPassword: async (token, newPassword) => {
        const response = await apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
            token,
            newPassword,
        });
        return response.data;
    },

    validateToken: async () => {
        const response = await apiClient.get(API_ENDPOINTS.AUTH.VALIDATE);
        return response.data;
    },
};