import { API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';
import { get, post, put, del } from '../../common/services/api/request.js';

export const ewalletService = {
        createEWallet: async (request) => {
        return post(API_ENDPOINTS.EWALLET.CREATE, request);
    },

        getEWallet: async () => {
        return get(API_ENDPOINTS.EWALLET.GET);
    },

        updateLimits: async (newLimit) => {
        return put(API_ENDPOINTS.EWALLET.UPDATE_LIMITS, { newLimit });
    },

    updateSpendingWarningLimit: async (newLimit) => {
        return put(API_ENDPOINTS.EWALLET.UPDATE_SPENDING_WARNING, newLimit);
    },

    removeSpendingWarningLimit: async () => {
        return del(API_ENDPOINTS.EWALLET.REMOVE_SPENDING_WARNING);
    },

    deposit: async (amount, bankId, agreementsAccepted = false, acceptedAgreementIds = []) => {
        return post(API_ENDPOINTS.EWALLET.DEPOSIT, { 
            amount, 
            bankId, 
            agreementsAccepted, 
            acceptedAgreementIds 
        });
    },

    withdraw: async (amount, bankId, agreementsAccepted = false, acceptedAgreementIds = []) => {
        return post(API_ENDPOINTS.EWALLET.WITHDRAW, { 
            amount, 
            bankId, 
            agreementsAccepted, 
            acceptedAgreementIds 
        });
    },

        getTransactions: async (page = 0, size = 10) => {
        return get(`${API_ENDPOINTS.EWALLET.TRANSACTIONS}?page=${page}&size=${size}`);
    },

        checkBalance: async (amount) => {
        return get(`${API_ENDPOINTS.EWALLET.CHECK_BALANCE}?amount=${amount}`);
    }
};
