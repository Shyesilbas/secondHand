import apiClient from '../../../services/api/config';
import { API_ENDPOINTS } from '../../../constants/apiEndpoints';

export const passwordService = {
    changePassword: async (passwordData) => {
        const response = await apiClient.put(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, passwordData);
        return response.data;
    },

    forgotPassword: async (email) => {
        const response = await apiClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
        return response.data;
    },

    resetPassword: async (token, newPassword) => {
        const response = await apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, { 
            token, 
            newPassword 
        });
        return response.data;
    },
};