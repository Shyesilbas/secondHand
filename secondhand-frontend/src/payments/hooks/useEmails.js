import { useState } from 'react';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { emailService } from '../../emails/services/emailService.js';

export const useEmails = () => {
    const [emails, setEmails] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const notification = useNotification();

    const fetchEmails = async () => {
        try {
            setIsLoading(true);
            const emailData = await emailService.getMyEmails();
            const list = Array.isArray(emailData) ? emailData : (emailData?.content ?? []);
            setEmails(list);
            return list;
        } catch (err) {
            notification.showError('Error', 'Email\'ler yüklenemedi.');
            return [];
        } finally {
            setIsLoading(false);
        }
    };

    const clearEmails = () => {
        setEmails([]);
    };

    return {
        emails,
        isLoading,
        fetchEmails,
        clearEmails
    };
};
