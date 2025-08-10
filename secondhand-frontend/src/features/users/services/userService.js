import apiClient from '../../../services/api/config';
import { API_ENDPOINTS } from '../../../constants/apiEndpoints';

export const userService = {
    // Get current user profile
    getCurrentUser: async () => {
        const response = await apiClient.get(API_ENDPOINTS.USER.ME);
        return response.data;
    },

    // Update phone number
    updatePhone: async (phoneData) => {
        const response = await apiClient.put(API_ENDPOINTS.USER.UPDATE_PHONE, phoneData);
        return response.data;
    },

    // Update email
    updateEmail: async (emailData) => {
        const response = await apiClient.put(API_ENDPOINTS.USER.UPDATE_EMAIL, emailData);
        return response.data;
    },

    // Verify account
    verify: async (verificationData) => {
        const response = await apiClient.post(API_ENDPOINTS.USER.VERIFY, verificationData);
        return response.data;
    },
};