import { get, del } from '../../../services/api/request';
import { API_ENDPOINTS } from '../../../constants/apiEndpoints';
import { EmailDto } from '../../../types/emails';

export const emailService = {
    getMyEmails: async () => {
        const data = await get(API_ENDPOINTS.EMAILS.MY_EMAILS);
        return Array.isArray(data) ? data.map(EmailDto) : [];
    },
    deleteEmail: async(emailId) => del(API_ENDPOINTS.EMAILS.DELETE(emailId)),
    deleteAll: async() => del(API_ENDPOINTS.EMAILS.DELETE_ALL)
};