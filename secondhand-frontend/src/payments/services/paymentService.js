import { get, post, del } from '../../common/services/api/request.js';
import { API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';
import { BankDto, PaymentDto, ListingFeeConfigDTO, createPaymentRequest } from '../paymentSchema.js';

export const paymentService = {

    createPayment: async (paymentData) => {
        const paymentRequestData = createPaymentRequest(paymentData);
        const idempotencyKey =
            paymentData.idempotencyKey
            || `payment-${paymentRequestData.listingId || 'general'}-${Date.now()}`;
        const config = {
            headers: {
                'Idempotency-Key': idempotencyKey
            }
        };
        return await post(API_ENDPOINTS.PAYMENTS.CREATE, paymentRequestData, config);
    },

    createListingFeePayment: async (paymentData) => {
        const idempotencyKey = `listing-fee-${paymentData.listingId}-${Date.now()}`;
        const config = {
            headers: {
                'Idempotency-Key': idempotencyKey
            }
        };
        return await post(API_ENDPOINTS.PAYMENTS.LISTING_FEE_PAYMENT, paymentData, config);
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
        if (filters.seller && filters.seller.trim()) params.sellerName = filters.seller.trim();
        
        const data = await get(API_ENDPOINTS.PAYMENTS.MY_PAYMENTS, { params });
        if (data.content && Array.isArray(data.content)) {
            data.content = data.content.map(PaymentDto);
        }
        return data;
    },

    getListingFeeConfig: async () => {
        const response = await get(API_ENDPOINTS.PAYMENTS.LISTING_FEE_CONFIG);
        return response;
    },

    getStatistics: async (paymentType) => {
        if (paymentType) {
            return get(`${API_ENDPOINTS.PAYMENTS.STATISTICS}?paymentType=${encodeURIComponent(paymentType)}`);
        }
        return get(API_ENDPOINTS.PAYMENTS.STATISTICS);
    },

    getCreditCards: async () => {
        return get(API_ENDPOINTS.CREDIT_CARDS.GET_ALL);
    },

    createCreditCard: async (limit) => {
        return post(API_ENDPOINTS.CREDIT_CARDS.CREATE, { limit });
    },

    deleteCreditCard: async () => {
        return del(API_ENDPOINTS.CREDIT_CARDS.DELETE);
    },

    createBankAccount: async () => {
        const data = await post(API_ENDPOINTS.BANK_ACCOUNTS.CREATE);
        return BankDto(data);
    },

    getBankAccounts: async () => {
        const data = await get(API_ENDPOINTS.BANK_ACCOUNTS.GET_ALL);
        const rawData = Array.isArray(data) ? data : [data].filter(Boolean);
        return rawData.map(BankDto);
    },

    deleteBankAccount: async () => del(API_ENDPOINTS.BANK_ACCOUNTS.DELETE),

};
