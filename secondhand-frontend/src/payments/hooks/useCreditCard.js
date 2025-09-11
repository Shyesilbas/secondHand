import { useState, useEffect } from 'react';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { creditCardService } from '../services/creditCardService.js';

export const useCreditCard = () => {
    const [creditCards, setCreditCards] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const notification = useNotification();

    useEffect(() => {
        fetchCreditCards();
    }, []);

    const normalizeData = (data) => {
        if (!data) return [];
        if (Array.isArray(data)) return data;
        if (Array.isArray(data.content)) return data.content;
        return [data];
    };

    const fetchCreditCards = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await creditCardService.getAll();
            setCreditCards(normalizeData(data));
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to fetch credit cards';
            setError(errorMessage);
            console.error('Failed to fetch credit cards:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const createCreditCard = async (limit) => {
        try {
            setIsLoading(true);
            setError(null);
            const newCard = await creditCardService.createCreditCard(limit);
            setCreditCards((prev) => [newCard, ...prev]);
            notification.showSuccess('Success', 'Credit card created successfully!');
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to create credit card';
            setError(errorMessage);
            notification.showError('Error', errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const deleteCreditCard = async () => {
        try {
            setIsLoading(true);
            setError(null);
            await creditCardService.deleteCreditCard();
            setCreditCards([]);
            notification.showSuccess('Success', 'Credit card deleted successfully!');
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to delete credit card';
            setError(errorMessage);
            notification.showError('Error', errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        creditCards,
        isLoading,
        error,
        createCreditCard,
        deleteCreditCard,
        refetch: fetchCreditCards
    };
};
