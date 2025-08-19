import { get, del } from '../../../services/api/request';
import { API_ENDPOINTS } from '../../../constants/apiEndpoints';
import { EmailDto } from '../../../types/emails';

export const emailService = {
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