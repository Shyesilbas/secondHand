import { useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { emailService } from '../../emails/services/emailService.js';
import { useAuth } from '../../auth/AuthContext.jsx';
import { PAYMENT_QUERY_KEYS } from '../paymentSchema.js';

export const useEmails = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const notification = useNotification();

    const queryFn = useCallback(async () => {
        const emailData = await emailService.getMyEmails();
        const list = Array.isArray(emailData) ? emailData : (emailData?.content ?? []);
        return Array.isArray(list) ? list : [];
    }, []);

    const {
        data,
        isLoading,
        refetch,
    } = useQuery({
        queryKey: [...PAYMENT_QUERY_KEYS.emailsMy, user?.id],
        queryFn,
        enabled: false,
        staleTime: 0,
        gcTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        retry: 0,
    });

    const emails = useMemo(() => (Array.isArray(data) ? data : []), [data]);

    const fetchEmails = useCallback(async () => {
        try {
            const res = await refetch();
            return Array.isArray(res.data) ? res.data : [];
        } catch {
            notification.showError('Error', 'Emails could not be loaded.');
            return [];
        }
    }, [notification, refetch]);

    const clearEmails = useCallback(() => {
        queryClient.setQueryData([...PAYMENT_QUERY_KEYS.emailsMy, user?.id], []);
    }, [queryClient, user?.id]);

    return {
        emails,
        isLoading,
        fetchEmails,
        clearEmails
    };
};
