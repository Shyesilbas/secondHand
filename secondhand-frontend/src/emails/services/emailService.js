import { get, del } from '../../common/services/api/request.js';
import { API_ENDPOINTS } from '../../common/constants/apiEndpoints.js';
import { EmailDto } from '../emails.js';

export const emailService = {
    getUnreadCount: async () => {
        const data = await get(API_ENDPOINTS.EMAILS.UNREAD_COUNT);
        return data?.count ?? 0;
    },
    getMyEmails: async () => {
        try {
            const timestamp = new Date().getTime();
            const url = `${API_ENDPOINTS.EMAILS.MY_EMAILS}?_t=${timestamp}`;
            const data = await get(url);
            const result = Array.isArray(data) ? data.map(EmailDto) : [];
            return result;
        } catch (error) {
            console.error('Error fetching emails:', error);
            throw error;
        }
    },
    deleteEmail: async(emailId) => del(API_ENDPOINTS.EMAILS.DELETE(emailId)),
    deleteAll: async() => del(API_ENDPOINTS.EMAILS.DELETE_ALL)
};