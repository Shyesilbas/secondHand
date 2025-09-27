import apiClient from './config.js';
import { getToken, getRefreshToken, setTokens, clearTokens, isCookieBasedAuth } from '../storage/tokenStorage.js';
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
        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

                const AUTH = API_ENDPOINTS.AUTH;
        const isAuthEndpoint = [AUTH.LOGIN, AUTH.REGISTER, AUTH.FORGOT_PASSWORD, AUTH.RESET_PASSWORD, AUTH.REFRESH]
            .some(path => originalRequest.url?.includes(path));

        if (isAuthEndpoint) {
            return Promise.reject(error);
        }

                if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
            
            if (originalRequest.url?.includes('/validate') || originalRequest.url?.includes('/showcases/active')) {
                console.debug('Public endpoint failed, not attempting refresh');
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