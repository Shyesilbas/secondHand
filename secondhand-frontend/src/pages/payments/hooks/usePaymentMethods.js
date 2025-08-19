import { useState } from 'react';
import { useNotification } from '../../../context/NotificationContext';
import { creditCardService } from '../../../features/payments/services/creditCardService';
import { bankService } from '../../../features/payments/services/bankService';

export const usePaymentMethods = () => {
    const [creditCards, setCreditCards] = useState([]);
    const [bankAccounts, setBankAccounts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const notification = useNotification();

    const fetchPaymentMethods = async () => {
        try {
            setIsLoading(true);
            const [cardsData, banksData] = await Promise.all([
                creditCardService.getAllCreditCards(),
                bankService.getBankAccount()
            ]);
            setCreditCards(cardsData);
            setBankAccounts(banksData);
        } catch (err) {
            console.error('Failed to fetch payment methods:', err);
            notification.showError('Error', 'Ödeme yöntemleri yüklenemedi.');
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
