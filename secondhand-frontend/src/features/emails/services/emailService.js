import apiClient from '../../../services/api/config';
import { API_ENDPOINTS } from '../../../constants/apiEndpoints';

export const emailService = {
    // Get my emails
    getMyEmails: async () => {
        const response = await apiClient.get(API_ENDPOINTS.EMAILS.MY_EMAILS);
        return response.data;
    },
};