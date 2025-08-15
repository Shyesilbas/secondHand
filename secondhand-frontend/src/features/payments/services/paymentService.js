import { get, post } from '../../../services/api/request';
import { API_ENDPOINTS } from '../../../constants/apiEndpoints';
import { ListingFeeConfigDTO, createPaymentRequest } from '../../../types/payments';

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
        return get(API_ENDPOINTS.PAYMENTS.MY_PAYMENTS, { params: { page, size } });
    },


    getListingFeeConfig: async () => {
        const response = await get(API_ENDPOINTS.PAYMENTS.LISTING_FEE_CONFIG);
        return { ...ListingFeeConfigDTO, ...response.data };
    }

};
