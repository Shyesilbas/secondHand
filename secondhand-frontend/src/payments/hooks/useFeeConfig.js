import { useState, useEffect } from 'react';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { paymentService } from '../services/paymentService.js';

export const useFeeConfig = () => {
    const [feeConfig, setFeeConfig] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const notification = useNotification();

    const fetchFeeConfig = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const config = await paymentService.getListingFeeConfig();
            console.log('Fee config received:', config);
            setFeeConfig(config);
        } catch (err) {
            console.error('Failed to fetch fee config:', err);
            const errorMessage = 'Fee config could not be fetched. Please try again later .';
            setError(errorMessage);
            notification.showError('Error', errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchFeeConfig();
    }, []);

    return {
        feeConfig,
        isLoading,
        error,
        refetch: fetchFeeConfig
    };
};
