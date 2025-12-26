import { API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';
import { get } from '../../common/services/api/request.js';

export const dashboardService = {
  getSellerDashboard: async (startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) {
      params.append('startDate', startDate.toISOString());
    }
    if (endDate) {
      params.append('endDate', endDate.toISOString());
    }
    const url = `${API_ENDPOINTS.DASHBOARD.SELLER}${params.toString() ? '?' + params.toString() : ''}`;
    return get(url);
  },

  getBuyerDashboard: async (startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) {
      params.append('startDate', startDate.toISOString());
    }
    if (endDate) {
      params.append('endDate', endDate.toISOString());
    }
    const url = `${API_ENDPOINTS.DASHBOARD.BUYER}${params.toString() ? '?' + params.toString() : ''}`;
    return get(url);
  },
};

