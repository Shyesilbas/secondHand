import apiClient, {API_BASE_URL} from './config';
import { getToken, getRefreshToken, setTokens, clearTokens } from '../storage/tokenStorage';
import axios from "axios";

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

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = getRefreshToken();
                if (!refreshToken) {
                    clearTokens();
                    window.location.href = '/login';
                    return Promise.reject(error);
                }

                // Call refresh endpoint
                const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                    refreshToken: refreshToken
                });

                const { accessToken, refreshToken: newRefreshToken } = response.data;

                // Update stored tokens
                setTokens(accessToken, newRefreshToken);

                // Retry original request with new token
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return apiClient(originalRequest);

            } catch (refreshError) {
                clearTokens();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;