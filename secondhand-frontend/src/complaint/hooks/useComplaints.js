import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createComplaint, getMyComplaints } from '../service/complaintService.js';
import { useNotification } from '../../notification/NotificationContext.jsx';

const COMPLAINT_KEYS = {
    all: ['complaints'],
    my: () => [...COMPLAINT_KEYS.all, 'my'],
};

export const useComplaints = () => {
    const { showNotification } = useNotification();
    const queryClient = useQueryClient();

    const notify = useCallback((type, title, message) => {
        showNotification({ type, title, message });
    }, [showNotification]);

    const {
        data: complaints = [],
        isLoading,
        error: queryError,
        refetch,
    } = useQuery({
        queryKey: COMPLAINT_KEYS.my(),
        queryFn: getMyComplaints,
        enabled: false, // Only fetch when getUserComplaints is called
        staleTime: 5 * 60 * 1000,
        gcTime: 15 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    const createMutation = useMutation({
        mutationFn: createComplaint,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: COMPLAINT_KEYS.all });
            notify('success', 'Complaint Submitted', 'Your complaint has been submitted successfully.' +
                ' You can Follow your complaints from Profile -> Quick Actions -> Support & Complaints');
        },
        onError: (err) => {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to submit complaint.';
            notify('error', 'Complaint Failed', errorMessage);
        },
    });

    const error = queryError?.message || createMutation.error?.message || null;

    return {
        complaints,
        isLoading: isLoading || createMutation.isPending,
        error,
        createComplaint: (data) => createMutation.mutateAsync(data),
        getUserComplaints: refetch,
        clearError: () => {},
    };
};
