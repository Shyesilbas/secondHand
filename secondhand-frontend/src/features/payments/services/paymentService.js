import apiClient from '../../../services/api/config';

export const paymentService = {
    // Pay listing fee
    payListingFee: async (paymentData) => {
        const response = await apiClient.post('/v1/payments/listings/pay-fee', paymentData);
        return response.data;
    },

    // Create general payment
    createPayment: async (paymentData) => {
        const response = await apiClient.post('/v1/payments/pay', paymentData);
        return response.data;
    },

    // Get my payments
    getMyPayments: async (page = 0, size = 10, sortBy = 'processedAt', sortDir = 'DESC') => {
        const response = await apiClient.get('/v1/payments/my-payments', {
            params: { page, size, sortBy, sortDir }
        });
        return response.data;
    },

    // Get payment statistics
    getPaymentStatistics: async () => {
        const response = await apiClient.get('/v1/payments/statistics');
        return response.data;
    },

    // Credit Card operations
    getCreditCards: async () => {
        const response = await apiClient.get('/v1/credit-card');
        return response.data;
    },


    // Bank Account operations
    getBankAccounts: async () => {
        const response = await apiClient.get('/v1/bank');
        return response.data;
    },

};