import apiClient from './config.js';
import {clearTokens, getToken, isCookieBasedAuth, setTokens} from '../storage/tokenStorage.js';
import axios from "axios";
import {API_BASE_URL, API_ENDPOINTS} from '../../constants/apiEndpoints.js';
import logger from '../../utils/logger.js';

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
    logger.error('Session Expired. Please Login again.');
};

let authContextRef = null;
export const setAuthContextRef = (authContext) => {
    authContextRef = authContext;
};

apiClient.interceptors.request.use(
    (config) => {
                        if (!isCookieBasedAuth()) {
            const token = getToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
                config.withCredentials = true;

        // Manually add CSRF token from cookie if not already present
        if (!config.headers['X-XSRF-TOKEN']) {
            const csrfToken = document.cookie
                .split('; ')
                .find(row => row.startsWith('XSRF-TOKEN='))
                ?.split('=')[1];
            
            if (csrfToken) {
                config.headers['X-XSRF-TOKEN'] = csrfToken;
            }
        }

        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const status = error.response?.status;
        const errorData = error.response?.data;

        // Hata objesini zenginleştir - Backend'den gelen mesajları extract et
        if (errorData) {
            error.userMessage = errorData.message || null;
            error.errorCode = errorData.errorCode || errorData.code;
            error.validationErrors = errorData.validationErrors;
            error.errorDetails = {
                status: status,
                statusText: error.response?.statusText,
                timestamp: errorData.timestamp,
                path: errorData.path
            };
        } else if (!error.response) {
            // Network error
            error.userMessage = 'Network error. Please check your connection';
            error.errorCode = 'NETWORK_ERROR';
        }

        const AUTH = API_ENDPOINTS.AUTH;
        const isAuthEndpoint = [AUTH.LOGIN, AUTH.REGISTER, AUTH.FORGOT_PASSWORD, AUTH.RESET_PASSWORD, AUTH.REFRESH]
            .some(path => originalRequest.url?.includes(path));

        if (isAuthEndpoint) {
            // Auth endpoint'lerinde backend mesajını koru
            return Promise.reject(error);
        }

        // 403: Permission/CSRF hatası - özel handling
        if (status === 403) {
            if (errorData?.message?.toLowerCase().includes('csrf')) {
                error.errorCode = 'CSRF_ERROR';
            }
            return Promise.reject(error);
        }

        // Only retry on 401 (unauthorized). 403 can be CSRF or permission error, not a token expiry.
        if (status === 401 && !originalRequest._retry) {
            
            if (originalRequest.url?.includes('/validate') || originalRequest.url?.includes('/showcases/active')) {
                return Promise.reject(error);
            }

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    if (token !== 'cookie-based') {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                    }
                    return apiClient(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                                const response = await axios.post(`${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`,
                    {},                     {
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        withCredentials: true,                         timeout: 10000
                    }
                );

                                                const newAccessToken = response.data.accessToken;
                const newRefreshToken = response.data.refreshToken;

                if (newAccessToken && newRefreshToken) {
                                        setTokens(newAccessToken, newRefreshToken);
                    processQueue(null, newAccessToken);
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                } else {
                                        processQueue(null, 'cookie-based');
                                        delete originalRequest.headers.Authorization;
                }

                if (authContextRef?.handleTokenRefresh) {
                    authContextRef.handleTokenRefresh(newAccessToken, newRefreshToken);
                }

                return apiClient(originalRequest);

            } catch (refreshError) {
                processQueue(refreshError, null);

                if (authContextRef?.handleTokenRefreshFailure) {
                    authContextRef.handleTokenRefreshFailure();
                } else {
                    showTokenExpiredMessage();
                    clearTokens();
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