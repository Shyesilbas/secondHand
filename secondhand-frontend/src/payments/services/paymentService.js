import { get, post } from '../../common/services/api/request.js';
import { API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';
import { PaymentDto, ListingFeeConfigDTO, createPaymentRequest } from '../payments.js';

export const paymentService = {

    createPayment: async (paymentData) => {
        const paymentRequestData = createPaymentRequest(paymentData);
        const response = await post(API_ENDPOINTS.PAYMENTS.CREATE, paymentRequestData);
        return response.data;
    },

    createListingFeePayment: async (paymentData) => {
        const response = await post(API_ENDPOINTS.PAYMENTS.LISTING_FEE_PAYMENT, paymentData);
        return response.data;
    },

    getMyPayments: async (page = 0, size = 5) => {
        const data = await get(API_ENDPOINTS.PAYMENTS.MY_PAYMENTS, { params: { page, size } });
        if (data.content && Array.isArray(data.content)) {
            data.content = data.content.map(PaymentDto);
        }
        return data;
    },

    getListingFeeConfig: async () => {
        const response = await get(API_ENDPOINTS.PAYMENTS.LISTING_FEE_CONFIG);
        console.log('Fee config response:', response);
        return response;
    },

    getStatistics: async (paymentType) => {
        if (paymentType) {
            return get(`${API_ENDPOINTS.PAYMENTS.STATISTICS}?paymentType=${encodeURIComponent(paymentType)}`);
        }
        return get(API_ENDPOINTS.PAYMENTS.STATISTICS);
    },

  

};
