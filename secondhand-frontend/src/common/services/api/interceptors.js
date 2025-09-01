import apiClient from './config.js';
import { getToken, getRefreshToken, setTokens, clearTokens } from '../storage/tokenStorage.js';
import axios from "axios";
import { API_ENDPOINTS, API_BASE_URL } from '../../constants/apiEndpoints.js';

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

const showTokenExpiredMessage = () => {
    console.error('Session Expired. Please Login again.');
};

// AuthContext ref
let authContextRef = null;
export const setAuthContextRef = (authContext) => {
    authContextRef = authContext;
};

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

        // Auth endpoint'leri skip et
        const AUTH = API_ENDPOINTS.AUTH;
        const isAuthEndpoint = [AUTH.LOGIN, AUTH.REGISTER, AUTH.FORGOT_PASSWORD, AUTH.RESET_PASSWORD, AUTH.REFRESH]
            .some(path => originalRequest.url?.includes(path));

        if (isAuthEndpoint) {
            return Promise.reject(error);
        }

        // 401/403 için token refresh
        if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return apiClient(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshToken = getRefreshToken();

                if (!refreshToken) {
                    throw new Error('No refresh token available');
                }

                const response = await axios.post(`${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`,
                    { refreshToken },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        timeout: 10000
                    }
                );

                const newAccessToken = response.data.accessToken;
                const newRefreshToken = response.data.refreshToken;

                if (!newAccessToken) {
                    throw new Error('No access token in refresh response');
                }

                setTokens(newAccessToken, newRefreshToken);

                if (authContextRef?.handleTokenRefresh) {
                    authContextRef.handleTokenRefresh(newAccessToken, newRefreshToken);
                }

                processQueue(null, newAccessToken);

                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return apiClient(originalRequest);

            } catch (refreshError) {
                processQueue(refreshError, null);

                if (authContextRef?.handleTokenRefreshFailure) {
                    authContextRef.handleTokenRefreshFailure();
                } else {
                    showTokenExpiredMessage();
                    clearTokens();
                    setTimeout(() => {
                        window.location.href = '/login';
                    }, 1000);
                }

                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;