import apiClient from '../../common/services/api/config.js';
import { API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';
import { post } from '../../common/services/api/request.js';

export const verificationService = {

    sendVerificationCode: async () => {
        const response = await apiClient.post(API_ENDPOINTS.USER.SEND_VERIFICATION);
        return response.data;
    },

    verify: async (verificationData) => {
        console.log('verificationService.verify called with:', verificationData);
        const requestPayload = { code: verificationData.code };
        console.log('Request payload:', requestPayload);
        console.log('API endpoint:', API_ENDPOINTS.USER.VERIFY);
        try {
            const result = await post(API_ENDPOINTS.USER.VERIFY, requestPayload);
            console.log('Verification service response:', result);
            return result;
        } catch (error) {
            console.error('Verification service error:', error);
            throw error;
        }
    },
};