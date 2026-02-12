import { get } from '../../common/services/api/request.js';
import { API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';

export const userBadgesService = {
  getBadges: async () => {
    return await get(API_ENDPOINTS.USER.BADGES);
  },
};
