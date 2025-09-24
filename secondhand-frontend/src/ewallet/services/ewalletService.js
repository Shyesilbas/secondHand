import { API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';
import { get, post, put } from '../../common/services/api/request.js';

export const ewalletService = {
        createEWallet: async () => {
        return post(API_ENDPOINTS.EWALLET.CREATE);
    },

        getEWallet: async () => {
        return get(API_ENDPOINTS.EWALLET.GET);
    },

        updateLimits: async (newLimit) => {
        return put(API_ENDPOINTS.EWALLET.UPDATE_LIMITS, { newLimit });
    },

        deposit: async (amount, bankId) => {
        return post(API_ENDPOINTS.EWALLET.DEPOSIT, { amount, bankId });
    },

        withdraw: async (amount, bankId) => {
        return post(API_ENDPOINTS.EWALLET.WITHDRAW, { amount, bankId });
    },

        getTransactions: async (page = 0, size = 10) => {
        return get(`${API_ENDPOINTS.EWALLET.TRANSACTIONS}?page=${page}&size=${size}`);
    },

        checkBalance: async (amount) => {
        return get(`${API_ENDPOINTS.EWALLET.CHECK_BALANCE}?amount=${amount}`);
    }
};
