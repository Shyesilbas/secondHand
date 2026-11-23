import { get } from '../../common/services/api/request.js';
import { API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';

export const feeService = {
  getFeeSchedule: () => get(API_ENDPOINTS.FEES.SCHEDULE),
};
