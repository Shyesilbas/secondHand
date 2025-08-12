import apiClient from '../../../services/api/config';
import { API_ENDPOINTS } from '../../../constants/apiEndpoints';
import { 
    createPaymentRequest, 
    createListingFeePaymentRequest 
} from '../../../types/payments';

export const paymentService = {
    // Pay listing fee
    payListingFee: async (paymentData) => {
        const listingFeeData = createListingFeePaymentRequest(paymentData);
        const response = await apiClient.post(API_ENDPOINTS.PAYMENTS.LISTING_FEE, listingFeeData);
        return response.data;
    },

    // Create general payment
    createPayment: async (paymentData) => {
        const paymentRequestData = createPaymentRequest(paymentData);
        const response = await apiClient.post(API_ENDPOINTS.PAYMENTS.CREATE, paymentRequestData);
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

    // Get listing fee configuration
    getListingFeeConfig: async () => {
        const response = await apiClient.get(API_ENDPOINTS.PAYMENTS.LISTING_FEE_CONFIG);
        return response.data;
    },

};