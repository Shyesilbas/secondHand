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

// AuthContext ref
let authContextRef = null;
export const setAuthContextRef = (authContext) => {
    authContextRef = authContext;
};

apiClient.interceptors.request.use(
    (config) => {
        // With cookie-based auth, only add Authorization header if we're not using cookies
        // This allows backward compatibility with token-based clients
        if (!isCookieBasedAuth()) {
            const token = getToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        // For cookie-based auth, credentials are automatically sent with cookies
        config.withCredentials = true;
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
            
            // Don't try to refresh for validation endpoint failures (infinite loop prevention)
            if (originalRequest.url?.includes('/validate')) {
                console.debug('Validation endpoint failed, not attempting refresh');
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
                // For cookie-based auth, refresh token is handled automatically via cookies
                const response = await axios.post(`${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`,
                    {}, // Empty body since refresh token is in HttpOnly cookie
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        withCredentials: true, // Include cookies
                        timeout: 10000
                    }
                );

                // For cookie-based auth, new tokens are set in cookies by server
                // For backward compatibility, check if tokens are in response
                const newAccessToken = response.data.accessToken;
                const newRefreshToken = response.data.refreshToken;

                if (newAccessToken && newRefreshToken) {
                    // Non-cookie mode: store tokens
                    setTokens(newAccessToken, newRefreshToken);
                    processQueue(null, newAccessToken);
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                } else {
                    // Cookie mode: tokens are already set by server
                    processQueue(null, 'cookie-based');
                    // Remove Authorization header for cookie-based requests
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