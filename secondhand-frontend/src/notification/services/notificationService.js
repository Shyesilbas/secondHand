import { get, put } from '../../common/services/api/request.js';
import { API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';

export const notificationService = {
    getNotifications: async (page = 0, size = 20) => {
        return get(API_ENDPOINTS.NOTIFICATIONS.ALL, {
            params: { page, size }
        });
    },

    getUnreadCount: async () => {
        const response = await get(API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT);
        return response.unreadCount || 0;
    },

    markAsRead: async (notificationId) => {
        return put(API_ENDPOINTS.NOTIFICATIONS.MARK_AS_READ(notificationId));
    },

    markAllAsRead: async () => {
        return put(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_AS_READ);
    },
};

