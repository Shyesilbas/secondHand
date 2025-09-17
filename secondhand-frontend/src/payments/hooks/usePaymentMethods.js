import { useState } from 'react';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { creditCardService } from '../services/creditCardService.js';
import { bankService } from '../services/bankService.js';

export const usePaymentMethods = () => {
    const [creditCards, setCreditCards] = useState([]);
    const [bankAccounts, setBankAccounts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const notification = useNotification();

    const normalizeData = (data) => {
        if (!data) return [];
        if (Array.isArray(data)) return data;
        if (Array.isArray(data.content)) return data.content;
        return [data];
    };

    const fetchPaymentMethods = async () => {
        try {
            setIsLoading(true);
            const [cardsData, banksData] = await Promise.all([
                creditCardService.getAll(),
                bankService.getBankAccount()
            ]);
            setCreditCards(normalizeData(cardsData));
            setBankAccounts(banksData);
        } catch (err) {
            console.error('Failed to fetch payment methods:', err);
            notification.showError('Error', 'Payment methods could not be fetched. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    return {
        paymentMethods: {
            creditCards,
            bankAccounts
        },
        isLoading,
        refetch: fetchPaymentMethods
    };
};
