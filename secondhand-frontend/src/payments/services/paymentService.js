import { get, post } from '../../common/services/api/request.js';
import { API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';
import { PaymentDto } from '../paymentSchema.js';

export const paymentService = {

 createListingFeePayment: async (paymentData) => {
 const { idempotencyKey, ...body } = paymentData;
 if (!idempotencyKey) {
 throw new Error('createListingFeePayment requires an idempotencyKey');
 }
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
 if (filters.providerName) params.providerName = filters.providerName;
 if (filters.paymentDirection) params.paymentDirection = filters.paymentDirection;
 // Date inputs give YYYY-MM-DD; the backend binds ISO local date-times and compares them as-is.
 if (filters.dateFrom) params.dateFrom = `${filters.dateFrom}T00:00:00`;
 if (filters.dateTo) params.dateTo = `${filters.dateTo}T23:59:59`;
 if (filters.amountMin) params.amountMin = filters.amountMin;
 if (filters.amountMax) params.amountMax = filters.amountMax;
 if (filters.seller && filters.seller.trim()) params.searchTerm = filters.seller.trim();
 
 const data = await get(API_ENDPOINTS.PAYMENTS.MY_PAYMENTS, { params });
 if (data.content && Array.isArray(data.content)) {
 data.content = data.content.map(PaymentDto);
 }
 return data;
 },

 /** Backend `PaymentStatisticsDto`; `providerName` narrows the totals to one provider. */
 getStatistics: async (providerName) => (
 providerName
 ? get(API_ENDPOINTS.PAYMENTS.STATISTICS, { params: { providerName } })
 : get(API_ENDPOINTS.PAYMENTS.STATISTICS)
 ),

 /** Backend `ListingFeeQuoteDto`: the fee the backend charges and whether the caller's eWallet covers it. */
 getListingFeeQuote: async () => get(API_ENDPOINTS.PAYMENTS.LISTING_FEE_QUOTE),

};
