import { get, post } from '../../../services/api/request';
import { API_ENDPOINTS } from '../../../constants/apiEndpoints';
import { 
    createPaymentRequest, 
    createListingFeePaymentRequest 
} from '../../../types/payments';

export const paymentService = {
    // Pay listing fee
    payListingFee: async (paymentData) => {
        const listingFeeData = createListingFeePaymentRequest(paymentData);
        return post(API_ENDPOINTS.PAYMENTS.LISTING_FEE, listingFeeData);
    },

    // Create general payment
    createPayment: async (paymentData) => {
        const paymentRequestData = createPaymentRequest(paymentData);
        return post(API_ENDPOINTS.PAYMENTS.CREATE, paymentRequestData);
    },

    // Get my payments
    getMyPayments: async (page = 0, size = 5) => {
        return get(API_ENDPOINTS.PAYMENTS.MY_PAYMENTS, { params: { page, size } });
    },

    // Get payment statistics
    getPaymentStatistics: async () => get(API_ENDPOINTS.PAYMENTS.STATISTICS),

    // Get listing fee configuration
    getListingFeeConfig: async () => get(API_ENDPOINTS.PAYMENTS.LISTING_FEE_CONFIG),

};