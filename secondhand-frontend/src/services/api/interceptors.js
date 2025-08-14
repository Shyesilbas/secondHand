import apiClient from './config';
import { getToken, getRefreshToken, setTokens, clearTokens } from '../storage/tokenStorage';
import axios from "axios";
import { API_ENDPOINTS, API_BASE_URL } from '../../constants/apiEndpoints';

apiClient.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Don't intercept auth endpoints (login, register, etc.) - let them handle their own errors
        const AUTH = API_ENDPOINTS.AUTH;
        const isAuthEndpoint = [AUTH.LOGIN, AUTH.REGISTER, AUTH.FORGOT_PASSWORD, AUTH.RESET_PASSWORD]
            .some(path => originalRequest.url?.includes(path));

        if (isAuthEndpoint) {
            return Promise.reject(error);
        }

        // Handle token refresh for protected endpoints only
        if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = getRefreshToken();
                
                if (!refreshToken) {
                    clearTokens();
                    window.location.href = '/login';
                    return Promise.reject(error);
                }

                // Call refresh endpoint
                const response = await axios.post(`${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`, { refreshToken });

                const { accessToken, refreshToken: newRefreshToken } = response.data;

                // Update stored tokens
                setTokens(accessToken, newRefreshToken);

                // Retry original request with new token
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return apiClient(originalRequest);

            } catch (refreshError) {
                console.error('Refresh token failed:', refreshError.response?.status, refreshError.response?.data);
                clearTokens();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;