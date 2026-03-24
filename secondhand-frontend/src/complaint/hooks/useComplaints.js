import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createComplaint, getMyComplaints } from '../services/complaintService.js';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { COMPLAINT_DEFAULTS, COMPLAINT_MESSAGES } from '../complaintConstants.js';
import { getComplaintErrorMessage } from '../utils/complaintError.js';

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
        staleTime: COMPLAINT_DEFAULTS.STALE_TIME_MS,
        gcTime: COMPLAINT_DEFAULTS.GC_TIME_MS,
        refetchOnWindowFocus: false,
    });

    const createMutation = useMutation({
        mutationFn: createComplaint,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: COMPLAINT_KEYS.all });
            notify('success', COMPLAINT_MESSAGES.SUBMITTED_TITLE, COMPLAINT_MESSAGES.SUBMITTED_SUCCESS);
        },
        onError: (err) => {
            notify('error', COMPLAINT_MESSAGES.SUBMIT_FAILED_TITLE, getComplaintErrorMessage(err));
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
