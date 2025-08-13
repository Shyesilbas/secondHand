import { get, post } from '../../../services/api/request';
import { API_ENDPOINTS } from '../../../constants/apiEndpoints';
import { 
    createLoginRequest, 
    createRegisterRequest, 
    createForgotPasswordRequest, 
    createResetPasswordRequest 
} from '../../../types/auth';

export const authService = {
    login: async (email, password) => {
        const loginData = createLoginRequest({ email, password });
        return post(API_ENDPOINTS.AUTH.LOGIN, loginData);
    },

    // Get current user profile
    getCurrentUser: async () => get(API_ENDPOINTS.USER.ME),

    register: async (userData) => {
        const registerData = createRegisterRequest(userData);
        return post(API_ENDPOINTS.AUTH.REGISTER, registerData);
    },

    logout: async () => post(API_ENDPOINTS.AUTH.LOGOUT),

    refreshToken: async (refreshToken) => post(API_ENDPOINTS.AUTH.REFRESH, { refreshToken }),

    forgotPassword: async (email) => {
        const forgotPasswordData = createForgotPasswordRequest({ email });
        return post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, forgotPasswordData);
    },

    resetPassword: async (token, newPassword) => {
        const resetPasswordData = createResetPasswordRequest({ token, newPassword });
        return post(API_ENDPOINTS.AUTH.RESET_PASSWORD, resetPasswordData);
    },

    validateToken: async () => get(API_ENDPOINTS.AUTH.VALIDATE),
};