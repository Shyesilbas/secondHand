import { get, post } from '../../common/services/api/request.js';
import { API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';
import { PaymentDto, createPaymentRequest } from '../paymentSchema.js';

export const paymentService = {

    createPayment: async (paymentData) => {
        const paymentRequestData = createPaymentRequest(paymentData);
        const idempotencyKey =
            paymentData.idempotencyKey
            || `pay-${paymentRequestData.listingId || 'general'}-${paymentRequestData.paymentType || 'x'}-${paymentRequestData.amount}`;
        const config = {
            headers: {
                'Idempotency-Key': idempotencyKey
            }
        };
        return await post(API_ENDPOINTS.PAYMENTS.CREATE, paymentRequestData, config);
    },

    createListingFeePayment: async (paymentData) => {
        const { idempotencyKey: explicitKey, ...body } = paymentData;
        const idempotencyKey =
            explicitKey
            || `listing-fee-${body.listingId || 'unknown'}`;
        const config = {
            headers: {
                'Idempotency-Key': idempotencyKey
            }
        };
        return await post(API_ENDPOINTS.PAYMENTS.LISTING_FEE_PAYMENT, body, config);
    },

    getMyPayments: async (page = 0, size = 5, filters = {}) => {
        const params = { page, size };
        
        if (filters.transactionType) params.transactionType = filters.transactionType;
        if (filters.paymentType) params.paymentType = filters.paymentType;
        if (filters.paymentDirection) params.paymentDirection = filters.paymentDirection;
        if (filters.dateFrom) params.dateFrom = new Date(filters.dateFrom).toISOString();
        if (filters.dateTo) params.dateTo = new Date(filters.dateTo).toISOString();
        if (filters.amountMin) params.amountMin = parseFloat(filters.amountMin);
        if (filters.amountMax) params.amountMax = parseFloat(filters.amountMax);
        if (filters.seller && filters.seller.trim()) params.searchTerm = filters.seller.trim();
        
        const data = await get(API_ENDPOINTS.PAYMENTS.MY_PAYMENTS, { params });
        if (data.content && Array.isArray(data.content)) {
            data.content = data.content.map(PaymentDto);
        }
        return data;
    },

    getStatistics: async (paymentType) => {
        if (paymentType) {
            return get(`${API_ENDPOINTS.PAYMENTS.STATISTICS}?paymentType=${encodeURIComponent(paymentType)}`);
        }
        return get(API_ENDPOINTS.PAYMENTS.STATISTICS);
    },

};
