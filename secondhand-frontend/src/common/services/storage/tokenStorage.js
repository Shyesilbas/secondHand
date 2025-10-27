const USER_KEY = 'user';

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

export const setTokens = (accessToken, refreshToken) => {
                console.debug('Tokens are now managed via secure HttpOnly cookies');
};

export const getToken = () => {
                return getCookie('sh_at');
};

export const getRefreshToken = () => {
                return getCookie('sh_rt');
};

export const clearTokens = () => {
            deleteCookie('sh_at', '/');
    deleteCookie('sh_rt', '/');
    localStorage.removeItem(USER_KEY);
};

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
    
        if (accessToken && refreshToken) {
        return !isTokenExpired(refreshToken);
    }
    
                return true;
};

export const isCookieBasedAuth = () => {
    const accessToken = getToken();
    const refreshToken = getRefreshToken();

    // Cookie-based auth if both cookies exist
    return !!(accessToken && refreshToken);
};