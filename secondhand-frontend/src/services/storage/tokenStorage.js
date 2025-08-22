// tokenStorage.js - Production ready version
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'user';

// Token management
export const setTokens = (accessToken, refreshToken) => {
    if (accessToken) {
        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    }
    if (refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
};

export const getToken = () => {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const getRefreshToken = () => {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const clearTokens = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
};

// User management
export const setUser = (userData) => {
    if (userData) {
        localStorage.setItem(USER_KEY, JSON.stringify(userData));
    } else {
        localStorage.removeItem(USER_KEY);
    }
};

export const getUser = () => {
    try {
        const userData = localStorage.getItem(USER_KEY);
        if (userData) {
            return JSON.parse(userData);
        }
    } catch (error) {
        localStorage.removeItem(USER_KEY);
    }
    return null;
};

export const clearUser = () => {
    localStorage.removeItem(USER_KEY);
};

// Helper functions
export const isTokenExpired = (token) => {
    if (!token) return true;

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp * 1000 < Date.now();
    } catch (error) {
        return true;
    }
};

export const hasValidTokens = () => {
    const accessToken = getToken();
    const refreshToken = getRefreshToken();

    if (!accessToken || !refreshToken) {
        return false;
    }

    return !isTokenExpired(refreshToken);
};