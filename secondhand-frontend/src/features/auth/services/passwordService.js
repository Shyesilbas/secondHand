import apiClient from '../../../services/api/config';
import { API_ENDPOINTS } from '../../../constants/apiEndpoints';
import { 
    createChangePasswordRequest, 
    createForgotPasswordRequest, 
    createResetPasswordRequest 
} from '../../../types/auth';

export const passwordService = {
    changePassword: async (passwordData) => {
        const changePasswordData = createChangePasswordRequest(passwordData);
        const response = await apiClient.put(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, changePasswordData);
        return response.data;
    },

    resetPassword: async (token, newPassword) => {
        const resetPasswordData = createResetPasswordRequest({ token, newPassword });
        const response = await apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, resetPasswordData);
        return response.data;
    },
};