export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        LOGOUT: '/auth/logout',
        REFRESH: '/auth/refresh',
        FORGOT_PASSWORD: '/auth/password/forgot',
        RESET_PASSWORD: '/auth/password/reset',
        VALIDATE: '/auth/validate',
    },

    LISTINGS: {
        ALL: '/v1/listings/allListings',
        BY_ID: '/v1/listings',
        BY_STATUS: '/v1/listings/status',
        CREATE: '/v1/listings',
        UPDATE: '/v1/listings',
        DELETE: '/v1/listings',
    },

    USER: {
        PROFILE: '/user/profile',
        UPDATE_EMAIL: '/user/email',
        UPDATE_PHONE: '/user/phone',
        VERIFY: '/user/verify',
    },

    PAYMENTS: {
        CARDS: '/payments/cards',
        BANKS: '/payments/banks',
        PROCESS: '/payments/process',
    },
};