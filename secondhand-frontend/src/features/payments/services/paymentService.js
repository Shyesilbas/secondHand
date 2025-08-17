import { get, post } from '../../../services/api/request';
import { API_ENDPOINTS } from '../../../constants/apiEndpoints';
import { PaymentDto, ListingFeeConfigDTO, createPaymentRequest } from '../../../types/payments';

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
    }

};
