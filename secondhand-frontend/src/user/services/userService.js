import { get, put, post } from '../../common/services/api/request.js';
import { API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';
import { 
    createUpdatePhoneRequest,
} from '../users.js';

export const userService = {

    // Get user by ID
    getUserById: async (userId) => {
        return get(API_ENDPOINTS.USER.BY_ID(userId));
    },

    // Update phone number
    updatePhone: async (phoneData) => {
        const updatePhoneData = createUpdatePhoneRequest(phoneData);
        return put(API_ENDPOINTS.USER.UPDATE_PHONE, updatePhoneData);
    },
};