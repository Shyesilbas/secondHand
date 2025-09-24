import { get, post } from '../../common/services/api/request.js';
import { API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';
import { 
    createLoginRequest, 
    createRegisterRequest, 
    createForgotPasswordRequest, 
    createResetPasswordRequest 
} from '../auth.js';

export const authService = {
    login: async (email, password) => {
        const loginData = createLoginRequest({ email, password });
        return post(API_ENDPOINTS.AUTH.LOGIN, loginData);
    },

        getCurrentUser: async () => get(API_ENDPOINTS.USER.ME),

    register: async (userData) => {
        const registerData = createRegisterRequest(userData);
        return post(API_ENDPOINTS.AUTH.REGISTER, registerData);
    },

    completeOAuth: async (payload) => {
        return post(API_ENDPOINTS.AUTH.OAUTH_COMPLETE, payload);
    },

    logout: async () => post(API_ENDPOINTS.AUTH.LOGOUT),

    refreshToken: async () => post(API_ENDPOINTS.AUTH.REFRESH, {}),

    forgotPassword: async (email) => {
        const forgotPasswordData = createForgotPasswordRequest({ email });
        return post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, forgotPasswordData);
    },

    resetPassword: async ({ email, verificationCode, newPassword, confirmPassword }) => {
        return post(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
            email,
            verificationCode,
            newPassword,
            confirmPassword,
        });
    },

    validateToken: async () => get(API_ENDPOINTS.AUTH.VALIDATE),

    revokeAllSessions: async () => post(API_ENDPOINTS.AUTH.REVOKE_ALL_SESSIONS),
};