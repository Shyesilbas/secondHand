import { API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';
import { get, post, put, del } from '../../common/services/api/request.js';

export const ewalletService = {
 createEWallet: async (request) => {
 return post(API_ENDPOINTS.EWALLET.CREATE, request);
 },

 getEWallet: async () => {
 return get(API_ENDPOINTS.EWALLET.GET);
 },

 updateLimits: async (newLimit) => {
 return put(API_ENDPOINTS.EWALLET.UPDATE_LIMITS, { newLimit });
 },

 updateSpendingWarningLimit: async (newLimit) => {
 return put(API_ENDPOINTS.EWALLET.UPDATE_SPENDING_WARNING, newLimit);
 },

 removeSpendingWarningLimit: async () => {
 return del(API_ENDPOINTS.EWALLET.REMOVE_SPENDING_WARNING);
 },

 // idempotencyKey is required: the backend applies a repeated key only once.
 deposit: async (amount, idempotencyKey, agreementsAccepted = false, acceptedAgreementIds = []) => {
 return post(API_ENDPOINTS.EWALLET.DEPOSIT, {
 amount,
 agreementsAccepted,
 acceptedAgreementIds
 }, { headers: { 'Idempotency-Key': idempotencyKey } });
 },

 // idempotencyKey is required: the backend applies a repeated key only once.
 withdraw: async (amount, idempotencyKey, agreementsAccepted = false, acceptedAgreementIds = []) => {
 return post(API_ENDPOINTS.EWALLET.WITHDRAW, {
 amount,
 agreementsAccepted,
 acceptedAgreementIds
 }, { headers: { 'Idempotency-Key': idempotencyKey } });
 },

 getTransactions: async (page = 0, size = 10) => {
 return get(`${API_ENDPOINTS.EWALLET.TRANSACTIONS}?page=${page}&size=${size}`);
 },

 checkBalance: async (amount) => {
 return get(`${API_ENDPOINTS.EWALLET.CHECK_BALANCE}?amount=${amount}`);
 },

 checkSpendingWarning: async (amount) => {
 return get(`${API_ENDPOINTS.EWALLET.SPENDING_WARNING_CHECK}?amount=${amount}`);
 }
};
