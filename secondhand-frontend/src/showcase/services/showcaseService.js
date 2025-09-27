import { get, post } from '../../common/services/api/request.js';
import { API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';

const withErrorHandling = async (operation, errorMessage) => {
  try {
    return await operation();
  } catch (error) {
    if (error.response?.status === 401) {
      console.debug('Showcase API requires authentication - this is expected for unauthenticated users');
    } else {
      console.error(errorMessage, error);
    }
    throw error;
  }
};

export const showcaseService = {
  getActiveShowcases: async () => {
    return withErrorHandling(
      () => get(API_ENDPOINTS.SHOWCASES.ACTIVE),
      'Error fetching active showcases'
    );
  },

  getUserShowcases: async () => {
    return withErrorHandling(
      () => get(API_ENDPOINTS.SHOWCASES.MY_SHOWCASES),
      'Error fetching user showcases'
    );
  },

  createShowcase: async (listingId, days, paymentType) => {
    const payload = {
      listingId,
      days,
      paymentType
    };
    
    return withErrorHandling(
      () => post(API_ENDPOINTS.SHOWCASES.CREATE, payload),
      'Error creating showcase'
    );
  },

  extendShowcase: async (showcaseId, days) => {
    return withErrorHandling(
      () => post(API_ENDPOINTS.SHOWCASES.EXTEND(showcaseId), null, { params: { days } }),
      'Error extending showcase'
    );
  },

  cancelShowcase: async (showcaseId) => {
    return withErrorHandling(
      () => post(API_ENDPOINTS.SHOWCASES.CANCEL(showcaseId)),
      'Error cancelling showcase'
    );
  }
};
