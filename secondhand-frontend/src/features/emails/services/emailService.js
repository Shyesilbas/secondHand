import { get } from '../../../services/api/request';
import { API_ENDPOINTS } from '../../../constants/apiEndpoints';

export const emailService = {
    // Get my emails
    getMyEmails: async () => get(API_ENDPOINTS.EMAILS.MY_EMAILS),
};