import { useState, useCallback } from 'react';
import { paymentService } from '../../payments/services/paymentService.js';

export const useOrdersReceipt = () => {
    const [receiptOpen, setReceiptOpen] = useState(false);
    const [receiptPayment, setReceiptPayment] = useState(null);

    const openReceipt = useCallback(async (paymentReference) => {
        try {
            const payments = await paymentService.getMyPayments(0, 100);
            const list = payments.content || [];
            const payment = list.find(p => String(p.paymentId) === String(paymentReference));
            if (payment) {
                setReceiptPayment(payment);
                setReceiptOpen(true);
            }
        } catch (e) {
            console.error('Error fetching receipt:', e);
        }
    }, []);

    const closeReceipt = useCallback(() => {
        setReceiptOpen(false);
        setReceiptPayment(null);
    }, []);

    return {
        receiptOpen,
        receiptPayment,
        openReceipt,
        closeReceipt
    };
};
