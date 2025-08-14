import { get, post, del } from '../../../services/api/request';
import { API_ENDPOINTS } from '../../../constants/apiEndpoints';

export const bankService = {

  createBankAccount: async () => post(API_ENDPOINTS.BANK_ACCOUNTS.CREATE),

  getBankAccount: async () => get(API_ENDPOINTS.BANK_ACCOUNTS.GET_ALL),

  deleteBankAccount: async () => del(API_ENDPOINTS.BANK_ACCOUNTS.DELETE),
};