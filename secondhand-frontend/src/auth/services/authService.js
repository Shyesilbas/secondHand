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

    validateToken: (() => {
        let lastValidation = null;
        let lastValidationTime = 0;
        const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
        
        return async () => {
            const now = Date.now();
            if (lastValidation && (now - lastValidationTime) < CACHE_DURATION) {
                console.debug('Using cached validation result');
                return lastValidation;
            }
            
            console.debug('Making new validation request');
            try {
                const result = await get(API_ENDPOINTS.AUTH.VALIDATE);
                lastValidation = result;
                lastValidationTime = now;
                return result;
            } catch (error) {
                // Don't cache errors
                lastValidation = null;
                lastValidationTime = 0;
                throw error;
            }
        };
    })(),

    revokeAllSessions: async () => post(API_ENDPOINTS.AUTH.REVOKE_ALL_SESSIONS),
};