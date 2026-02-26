import apiClient from '../../common/services/api/interceptors.js';
import { API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';
import { post } from '../../common/services/api/request.js';

export const verificationService = {

    sendVerificationCode: async () => {
        const response = await apiClient.post(API_ENDPOINTS.USER.SEND_VERIFICATION);
        return response.data;
    },

    verify: async (verificationData) => {
        return post(API_ENDPOINTS.USER.VERIFY, { code: verificationData.code });
    },
};