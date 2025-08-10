import apiClient from '../../../services/api/config';
import { API_ENDPOINTS } from '../../../constants/apiEndpoints';

export const verificationService = {
    /**
     * Send verification code to user's email
     * @returns {Promise} API response
     */
    sendVerificationCode: async () => {
        const response = await apiClient.post(API_ENDPOINTS.USER.SEND_VERIFICATION);
        return response.data;
    },

    /**
     * Verify account with code
     * @param {string} code - Verification code received via email
     * @returns {Promise} API response
     */
    verifyAccount: async (code) => {
        const response = await apiClient.post(API_ENDPOINTS.USER.VERIFY, { code });
        return response.data;
    },
};