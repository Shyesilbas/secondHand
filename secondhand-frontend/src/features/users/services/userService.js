import { get, put, post } from '../../../services/api/request';
import { API_ENDPOINTS } from '../../../constants/apiEndpoints';
import { 
    createUpdateEmailRequest, 
    createUpdatePhoneRequest, 
    createVerificationRequest 
} from '../../../types/users';

export const userService = {
    // Get current user profile
    getCurrentUser: async () => get(API_ENDPOINTS.USER.ME),

    // Update phone number
    updatePhone: async (phoneData) => {
        const updatePhoneData = createUpdatePhoneRequest(phoneData);
        return put(API_ENDPOINTS.USER.UPDATE_PHONE, updatePhoneData);
    },

    // Update email
    updateEmail: async (emailData) => {
        const updateEmailData = createUpdateEmailRequest(emailData);
        return put(API_ENDPOINTS.USER.UPDATE_EMAIL, updateEmailData);
    },

    // Verify account
    verify: async (verificationData) => {
        const verifyData = createVerificationRequest(verificationData);
        return post(API_ENDPOINTS.USER.VERIFY, verifyData);
    },
};