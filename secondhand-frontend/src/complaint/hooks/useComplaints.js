import {useCallback, useState} from 'react';
import {createComplaint, getMyComplaints} from '../service/complaintService.js';
import {useNotification} from '../../notification/NotificationContext.jsx';

export const useComplaints = () => {
    const [complaints, setComplaints] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const { showNotification } = useNotification();

    const notify = useCallback((type, title, message) => {
        showNotification({ type, title, message });
    }, [showNotification]);

    const handleCreateComplaint = useCallback(async (complaintData) => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await createComplaint(complaintData);
            notify('success', 'Complaint Submitted', 'Your complaint has been submitted successfully.' +
                ' You can Follow your complaints from Profile -> Quick Actions -> Support & Complaints');
            return result;
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to submit complaint.';
            setError(errorMessage);
            notify('error', 'Complaint Failed', errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [notify]);

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
            notify('error', 'Load Failed', errorMessage);
            return [];
        } finally {
            setIsLoading(false);
        }
    }, [notify]);

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
