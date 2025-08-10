const TOKEN_KEY = 'secondhand_access_token';
const REFRESH_TOKEN_KEY = 'secondhand_refresh_token';
const USER_KEY = 'secondhand_user';

export const getToken = () => {
    return localStorage.getItem(TOKEN_KEY);
};

export const getRefreshToken = () => {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const getUser = () => {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
};

export const setTokens = (accessToken, refreshToken) => {
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

export const setUser = (user) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearTokens = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
};

export const isAuthenticated = () => {
    return !!getToken();
};