import { useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { emailService } from '../../emails/services/emailService.js';
import { useAuthState } from '../../auth/AuthContext.jsx';
import { PAYMENT_QUERY_KEYS } from '../paymentSchema.js';
import { EMAIL_QUERY_STALE_MS } from '../../emails/emailConstants.js';
import { parseCustomDate } from '../utils/otp.js';

export const useEmails = () => {
    const { user } = useAuthState();
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
        staleTime: EMAIL_QUERY_STALE_MS,
        gcTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        retry: 0,
    });

    const emails = useMemo(() => (Array.isArray(data) ? data : []), [data]);

    const fetchEmails = useCallback(async (minTimestamp = 0) => {
        let attempts = 0;
        const maxAttempts = 3;
        
        while (attempts < maxAttempts) {
            const res = await refetch();
            if (res.isError) {
                const msg = res.error?.message || res.error?.response?.data?.message || 'Emails could not be loaded.';
                notification.showError('Error', msg);
                return [];
            }
            
            const list = Array.isArray(res.data) ? res.data : [];
            if (minTimestamp > 0 && list.length > 0) {
                // Find the newest email's timestamp
                const newestEmail = [...list].sort((a, b) => {
                    return parseCustomDate(b.sentAt || b.createdAt) - parseCustomDate(a.sentAt || a.createdAt);
                })[0];
                
                const newestTime = parseCustomDate(newestEmail?.sentAt || newestEmail?.createdAt);
                if (newestTime >= minTimestamp) {
                    return list; // Found the new email!
                }
                
                // If the newest email is older than minTimestamp, wait 500ms and try again
                attempts++;
                if (attempts < maxAttempts) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            } else {
                return list;
            }
        }
        
        const finalRes = await refetch();
        return Array.isArray(finalRes.data) ? finalRes.data : [];
    }, [notification, refetch]);

    const markAsRead = useCallback(async (emailId) => {
        try {
            await emailService.markAsRead(emailId);
            queryClient.setQueryData([...PAYMENT_QUERY_KEYS.emailsMy, user?.id], (oldData) => {
                if (!Array.isArray(oldData)) return oldData;
                return oldData.map((email) => 
                    email.id === emailId ? { ...email, isRead: true, read: true } : email
                );
            });
            // Update unread count by invalidating or refetching it if needed
            // (We assume another query handles unread count, but for UI sync, manually updating cache is good)
        } catch {
            notification.showError('Error', 'Could not mark email as read.');
        }
    }, [queryClient, user?.id, notification]);

    const clearEmails = useCallback(() => {
        queryClient.setQueryData([...PAYMENT_QUERY_KEYS.emailsMy, user?.id], []);
    }, [queryClient, user?.id]);

    return {
        emails,
        isLoading,
        fetchEmails,
        markAsRead,
        clearEmails
    };
};
