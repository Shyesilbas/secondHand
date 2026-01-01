import { API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';
import { get } from '../../common/services/api/request.js';

const normalizeStartDate = (date) => {
  if (!date) return null;
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized.toISOString();
};

const normalizeEndDate = (date) => {
  if (!date) return null;
  const normalized = new Date(date);
  normalized.setHours(23, 59, 59, 999);
  return normalized.toISOString();
};

export const dashboardService = {
  getSellerDashboard: async (startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) {
      params.append('startDate', normalizeStartDate(startDate));
    }
    if (endDate) {
      params.append('endDate', normalizeEndDate(endDate));
    }
    const url = `${API_ENDPOINTS.DASHBOARD.SELLER}${params.toString() ? '?' + params.toString() : ''}`;
    return get(url);
  },

  getBuyerDashboard: async (startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) {
      params.append('startDate', normalizeStartDate(startDate));
    }
    if (endDate) {
      params.append('endDate', normalizeEndDate(endDate));
    }
    const url = `${API_ENDPOINTS.DASHBOARD.BUYER}${params.toString() ? '?' + params.toString() : ''}`;
    return get(url);
  },
};

