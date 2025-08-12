import apiClient from '../../../services/api/config';
import { API_ENDPOINTS } from '../../../constants/apiEndpoints';
import { 
    createLoginRequest, 
    createRegisterRequest, 
    createForgotPasswordRequest, 
    createResetPasswordRequest 
} from '../../../types/auth';

export const authService = {
    login: async (email, password) => {
        const loginData = createLoginRequest({ email, password });
        const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, loginData);
        return response.data;
    },

    // Get current user profile
    getCurrentUser: async () => {
        const response = await apiClient.get(API_ENDPOINTS.USER.ME);
        return response.data;
    },

    register: async (userData) => {
        const registerData = createRegisterRequest(userData);
        const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, registerData);
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
        const forgotPasswordData = createForgotPasswordRequest({ email });
        const response = await apiClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, forgotPasswordData);
        return response.data;
    },

    resetPassword: async (token, newPassword) => {
        const resetPasswordData = createResetPasswordRequest({ token, newPassword });
        const response = await apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, resetPasswordData);
        return response.data;
    },

    validateToken: async () => {
        const response = await apiClient.get(API_ENDPOINTS.AUTH.VALIDATE);
        return response.data;
    },
};