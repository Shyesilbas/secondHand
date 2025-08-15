import apiClient from '../../../services/api/config';
import { API_ENDPOINTS } from '../../../constants/apiEndpoints';
import { post } from '../../../services/api/request';

export const VerificationRequestDTO = {
    code: '',
};

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