import { get, put, post } from '../../../services/api/request';
import { API_ENDPOINTS } from '../../../constants/apiEndpoints';
import { 
    createUpdateEmailRequest, 
    createUpdatePhoneRequest, 
    createVerificationRequest 
} from '../../../types/users';

export const userService = {
    getCurrentUser: async () => get(API_ENDPOINTS.USER.ME),

    // Update phone number
    updatePhone: async (phoneData) => {
        const updatePhoneData = createUpdatePhoneRequest(phoneData);
        return put(API_ENDPOINTS.USER.UPDATE_PHONE, updatePhoneData);
    },

    updateEmail: async (emailData) => {
        const updateEmailData = createUpdateEmailRequest(emailData);
        return put(API_ENDPOINTS.USER.UPDATE_EMAIL, updateEmailData);
    },

    verify: async (verificationData) => {
        const verifyData = createVerificationRequest(verificationData);
        return post(API_ENDPOINTS.USER.VERIFY, verifyData);
    },
};