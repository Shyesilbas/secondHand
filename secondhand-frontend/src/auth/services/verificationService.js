import apiClient from '../../common/services/api/config.js';
import { API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';
import { post } from '../../common/services/api/request.js';

export const verificationService = {

    sendVerificationCode: async () => {
        const response = await apiClient.post(API_ENDPOINTS.USER.SEND_VERIFICATION);
        return response.data;
    },

    verify: async (verificationData) => {
        const requestPayload = { code: verificationData.code };
        return post(API_ENDPOINTS.USER.VERIFY, requestPayload);
    },
};