import apiClient from '../../../services/api/config';
import { API_ENDPOINTS } from '../../../constants/apiEndpoints';

export const paymentService = {
    // Pay listing fee
    payListingFee: async (paymentData) => {
        const response = await apiClient.post(API_ENDPOINTS.PAYMENTS.LISTING_FEE, paymentData);
        return response.data;
    },

    // Create general payment
    createPayment: async (paymentData) => {
        const response = await apiClient.post(API_ENDPOINTS.PAYMENTS.CREATE, paymentData);
        return response.data;
    },

    // Get my payments
    getMyPayments: async (page = 0, size = 10, sortBy = 'processedAt', sortDir = 'DESC') => {
        const response = await apiClient.get(API_ENDPOINTS.PAYMENTS.MY_PAYMENTS, {
            params: { page, size, sortBy, sortDir }
        });
        return response.data;
    },

    // Get payment statistics
    getPaymentStatistics: async () => {
        const response = await apiClient.get(API_ENDPOINTS.PAYMENTS.STATISTICS);
        return response.data;
    },

    // Credit Card operations
    getCreditCards: async () => {
        const response = await apiClient.get(API_ENDPOINTS.CREDIT_CARDS.GET_ALL);
        return response.data;
    },

    // Bank Account operations
    getBankAccounts: async () => {
        const response = await apiClient.get(API_ENDPOINTS.BANK_ACCOUNTS.GET_ALL);
        return response.data;
    },

    getListingFeeConfig: async () => {
        const response = await apiClient.get(API_ENDPOINTS.PAYMENTS.LISTING_FEE_CONFIG);
        return response.data;
    },

};