// tokenStorage.js - Cookie-based authentication version
const USER_KEY = 'user';

// Cookie utility functions
const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        return parts.pop().split(';').shift();
    }
    return null;
};

const deleteCookie = (name, path = '/') => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; SameSite=Strict; Secure`;
};

// Token management - now using cookies
export const setTokens = (accessToken, refreshToken) => {
    // Tokens are now set by the server as HttpOnly cookies
    // This function is kept for backward compatibility but doesn't store anything
    // The actual tokens are managed by the server through cookies
    console.debug('Tokens are now managed via secure HttpOnly cookies');
};

export const getToken = () => {
    // Try to get token from cookie (for non-HttpOnly scenarios)
    // In production, tokens should be HttpOnly and not accessible from JS
    // Using obfuscated cookie name for security
    return getCookie('sh_at');
};

export const getRefreshToken = () => {
    // Try to get refresh token from cookie (for non-HttpOnly scenarios)
    // In production, refresh tokens should be HttpOnly and not accessible from JS
    // Using obfuscated cookie name for security
    return getCookie('sh_rt');
};

export const clearTokens = () => {
    // Clear any client-side token references
    // The actual HttpOnly cookies will be cleared by the server on logout
    deleteCookie('sh_at', '/');
    deleteCookie('sh_rt', '/');
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
    // With HttpOnly cookies, we can't directly access tokens from JavaScript
    // We'll rely on the server to validate tokens and return appropriate responses
    // For initial authentication check, we'll try to validate with the server
    
    // Check if we have any accessible token cookies (non-HttpOnly fallback)
    const accessToken = getToken();
    const refreshToken = getRefreshToken();
    
    // If we can access tokens (non-HttpOnly mode), validate them
    if (accessToken && refreshToken) {
        return !isTokenExpired(refreshToken);
    }
    
    // If tokens are HttpOnly (production mode), we can't check them client-side
    // Return true and let server validation handle it
    // This will be validated in AuthContext initialization
    return true;
};

// Check if we're in cookie-based authentication mode
export const isCookieBasedAuth = () => {
    // If we can't access tokens via JavaScript, we're in cookie-based mode
    return !getToken() || !getRefreshToken();
};