import { get, post, del } from '../../common/services/api/request.js';
import { API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';
import { BankDto } from '../banks.js';

export const bankService = {

  createBankAccount: async () => {
    const data = await post(API_ENDPOINTS.BANK_ACCOUNTS.CREATE);
    return BankDto(data);
  },

  getBankAccount: async () => {
    const data = await get(API_ENDPOINTS.BANK_ACCOUNTS.GET_ALL);
    const rawData = Array.isArray(data) ? data : [data].filter(Boolean);
    return rawData.map(BankDto);
  },

  deleteBankAccount: async () => del(API_ENDPOINTS.BANK_ACCOUNTS.DELETE),
};