import { get, del } from '../../common/services/api/request.js';
import { API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';
import { EmailDto } from '../emails.js';

export const emailService = {
    getUnreadCount: async () => {
        const data = await get(API_ENDPOINTS.EMAILS.UNREAD_COUNT);
        return data?.count ?? 0;
    },
    getMyEmails: async (page = 0, size = 20) => {
        try {
            const timestamp = new Date().getTime();
            const query = new URLSearchParams({
                page: String(page),
                size: String(size),
                _t: String(timestamp)
            }).toString();
            const url = `${API_ENDPOINTS.EMAILS.MY_EMAILS}?${query}`;
            const data = await get(url);
            if (data && Array.isArray(data.content)) {
                return {
                    ...data,
                    content: data.content.map(EmailDto)
                };
            }
            return {
                content: [],
                totalElements: 0,
                totalPages: 0,
                number: 0,
                size
            };
        } catch (error) {
            console.error('Error fetching emails:', error);
            throw error;
        }
    },
    deleteEmail: async(emailId) => del(API_ENDPOINTS.EMAILS.DELETE(emailId)),
    deleteAll: async() => del(API_ENDPOINTS.EMAILS.DELETE_ALL)
};