import { get, post } from './api/request.js';
import { API_ENDPOINTS } from '../constants/apiEndpoints.js';

export const membershipService = {
  getStatus: () => get(API_ENDPOINTS.MEMBERSHIP.STATUS),

  upgradeToPremium: (payload) => post(API_ENDPOINTS.MEMBERSHIP.UPGRADE, payload),

  cancelSubscription: () => post(API_ENDPOINTS.MEMBERSHIP.CANCEL),

  toggleAutoRenew: (autoRenew) => post(`${API_ENDPOINTS.MEMBERSHIP.TOGGLE_AUTO_RENEW}?autoRenew=${autoRenew}`),
};
