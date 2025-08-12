import apiClient from '../../../services/api/config';
import { API_ENDPOINTS } from '../../../constants/apiEndpoints';
import { 
    createUpdateEmailRequest, 
    createUpdatePhoneRequest, 
    createVerificationRequest 
} from '../../../types/users';

export const userService = {
    // Get current user profile
    getCurrentUser: async () => {
        const response = await apiClient.get(API_ENDPOINTS.USER.ME);
        return response.data;
    },

    // Update phone number
    updatePhone: async (phoneData) => {
        const updatePhoneData = createUpdatePhoneRequest(phoneData);
        const response = await apiClient.put(API_ENDPOINTS.USER.UPDATE_PHONE, updatePhoneData);
        return response.data;
    },

    // Update email
    updateEmail: async (emailData) => {
        const updateEmailData = createUpdateEmailRequest(emailData);
        const response = await apiClient.put(API_ENDPOINTS.USER.UPDATE_EMAIL, updateEmailData);
        return response.data;
    },

    // Verify account
    verify: async (verificationData) => {
        const verifyData = createVerificationRequest(verificationData);
        const response = await apiClient.post(API_ENDPOINTS.USER.VERIFY, verifyData);
        return response.data;
    },
};