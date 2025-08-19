import { useState } from 'react';
import { useNotification } from '../../../context/NotificationContext';
import { emailService } from '../../../features/emails/services/emailService';

export const useEmails = () => {
    const [emails, setEmails] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const notification = useNotification();

    const fetchEmails = async () => {
        try {
            setIsLoading(true);
            console.log('Fetching emails...');
            const emailData = await emailService.getMyEmails();
            console.log('Emails fetched:', emailData);
            setEmails(emailData);
            return emailData;
        } catch (err) {
            console.error('Failed to fetch emails:', err);
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
