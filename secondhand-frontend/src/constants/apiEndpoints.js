export const API_BASE_URL = 'http://localhost:8080/api';

export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        LOGOUT: '/auth/logout',
        REFRESH: '/auth/refresh',
        FORGOT_PASSWORD: '/auth/password/forgot',
        RESET_PASSWORD: '/auth/password/reset',
        CHANGE_PASSWORD: '/auth/password/change',
        VALIDATE: '/auth/validate',
    },
    USER: {
        ME: '/v1/users/me',
        UPDATE_EMAIL: '/v1/users/email',
        UPDATE_PHONE: '/v1/users/phone',
        VERIFY: '/v1/users/verification/verify',
        SEND_VERIFICATION: '/v1/users/verification/send',
    },
    LISTINGS: {
        ALL: '/v1/listings/allListings',
        MY_LISTINGS: '/v1/listings/my-listings',
        BY_STATUS: (status) => `/v1/listings/my-listings/status/${status}`,
        BY_ID: (id) => `/v1/listings/${id}`,
        CREATE: '/v1/listings',
        UPDATE: (id) => `/v1/listings/${id}`,
        DELETE: (id) => `/v1/listings/${id}`,
    },
    PAYMENTS: {
        CREATE: '/v1/payments/pay',
        LISTING_FEE: '/v1/payments/listings/pay-fee',
        MY_PAYMENTS: '/v1/payments/my-payments',
        STATISTICS: '/v1/payments/statistics',
    },
    CREDIT_CARDS: {
        GET_ALL: '/v1/credit-card',
        CREATE: '/v1/credit-card',
        UPDATE: (id) => `/v1/credit-card/${id}`,
        DELETE: (id) => `/v1/credit-card/${id}`,
    },
    BANK_ACCOUNTS: {
        GET_ALL: '/v1/bank',
        CREATE: '/v1/bank',
        UPDATE: (id) => `/v1/bank/${id}`,
        DELETE: (id) => `/v1/bank/${id}`,
    },
    EMAILS: {
        MY_EMAILS: '/v1/emails/my-emails',
    },
};