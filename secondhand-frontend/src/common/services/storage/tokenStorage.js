const USER_KEY = 'user';

export const setUser = (userData) => {
    if (userData) {
        // Remove sensitive data before storing
        const sanitizedUserData = { ...userData };
        
        // Remove password and other sensitive fields
        delete sanitizedUserData.password;
        delete sanitizedUserData.currentPassword;
        delete sanitizedUserData.newPassword;
        delete sanitizedUserData.confirmPassword;
        delete sanitizedUserData.accessToken;
        delete sanitizedUserData.refreshToken;
        delete sanitizedUserData.token;
        
        // Remove any other sensitive fields that might exist
        Object.keys(sanitizedUserData).forEach(key => {
            if (key.toLowerCase().includes('password') || 
                key.toLowerCase().includes('token') ||
                key.toLowerCase().includes('secret') ||
                key.toLowerCase().includes('key')) {
                delete sanitizedUserData[key];
            }
        });
        
        localStorage.setItem(USER_KEY, JSON.stringify(sanitizedUserData));
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
    } catch {
        localStorage.removeItem(USER_KEY);
    }
    return null;
};

export const clearUser = () => {
    localStorage.removeItem(USER_KEY);
};