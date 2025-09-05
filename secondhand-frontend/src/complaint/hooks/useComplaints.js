import { useState, useCallback } from 'react';
import { createComplaint, getMyComplaints } from '../service/complaintService.js';
import { useNotification } from '../../notification/NotificationContext.jsx';

export const useComplaints = () => {
    const [complaints, setComplaints] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const { showNotification } = useNotification();

    const handleCreateComplaint = useCallback(async (complaintData) => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await createComplaint(complaintData);

            showNotification({
                type: 'success',
                title: 'Complaint Submitted',
                message: 'Your complaint has been submitted successfully.'
            });

            return result;
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to submit complaint.';
            setError(errorMessage);
            showNotification({
                type: 'error',
                title: 'Complaint Failed',
                message: errorMessage
            });
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [showNotification]);

    const handleGetUserComplaints = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const data = await getMyComplaints();
            setComplaints(data);
            return data;
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to load complaints.';
            setError(errorMessage);
            showNotification({
                type: 'error',
                title: 'Load Failed',
                message: errorMessage
            });
            return [];
        } finally {
            setIsLoading(false);
        }
    }, [showNotification]);

    const clearError = useCallback(() => setError(null), []);

    return {
        complaints,
        isLoading,
        error,
        createComplaint: handleCreateComplaint,
        getUserComplaints: handleGetUserComplaints,
        clearError
    };
};
