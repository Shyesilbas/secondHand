import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { creditCardService } from '../../payments/services/creditCardService.js';
import { bankService } from '../../payments/services/bankService.js';
import { orderService } from '../../order/services/orderService.js';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { useEWallet } from '../../ewallet/hooks/useEWallet.js';
import useAddresses from '../../user/hooks/useAddresses.js';

export const useCheckout = (cartCount, calculateTotal, clearCart) => {
    const navigate = useNavigate();
    const { showError, showSuccess } = useNotification();
    const { addresses } = useAddresses();
    const { eWallet } = useEWallet();

        const [showCheckoutModal, setShowCheckoutModal] = useState(false);
    const [step, setStep] = useState(1);
    const [isCheckingOut, setIsCheckingOut] = useState(false);

        const [selectedShippingAddressId, setSelectedShippingAddressId] = useState(null);
    const [selectedBillingAddressId, setSelectedBillingAddressId] = useState(null);

        const [selectedPaymentType, setSelectedPaymentType] = useState('CREDIT_CARD');
    const [cards, setCards] = useState([]);
    const [selectedCardNumber, setSelectedCardNumber] = useState(null);
    const [bankAccounts, setBankAccounts] = useState([]);
    const [selectedBankAccountIban, setSelectedBankAccountIban] = useState(null);

        useEffect(() => {
                creditCardService
            .getAll()
            .then((data) => {
                let normalized = [];
                if (Array.isArray(data)) {
                    normalized = data;
                } else if (data && Array.isArray(data.content)) {
                    normalized = data.content;
                } else if (data && (data.number || data.cardNumber)) {
                    normalized = [data];
                }
                setCards(normalized);
            })
            .catch((err) => {
                console.error('Error loading cards:', err);
                setCards([]);
            });

                bankService
            .getBankAccount()
            .then((data) => {
                const normalized = Array.isArray(data) 
                    ? data 
                    : (data && Array.isArray(data.content) ? data.content : []);
                setBankAccounts(normalized);
            })
            .catch(() => setBankAccounts([]));
    }, []);

        useEffect(() => {
        if (selectedPaymentType === 'TRANSFER' && 
            Array.isArray(bankAccounts) && 
            bankAccounts.length > 0 && 
            !selectedBankAccountIban) {
            setSelectedBankAccountIban(bankAccounts[0].IBAN || null);
        }
        
        if (selectedPaymentType === 'CREDIT_CARD' && 
            Array.isArray(cards) && 
            cards.length > 0 && 
            !selectedCardNumber) {
            const number = cards[0].number || cards[0].cardNumber || null;
            setSelectedCardNumber(number);
        }
    }, [selectedPaymentType, bankAccounts, selectedBankAccountIban, cards, selectedCardNumber]);

        const proceedDisabled = useMemo(() => {
        if (cartCount === 0) return true;
        if (!selectedShippingAddressId) return true;
        if (selectedPaymentType === 'CREDIT_CARD' && (!Array.isArray(cards) || cards.length === 0)) return true;
        if (selectedPaymentType === 'CREDIT_CARD' && !selectedCardNumber) return true;
        if (selectedPaymentType === 'TRANSFER' && (!Array.isArray(bankAccounts) || bankAccounts.length === 0)) return true;
        if (selectedPaymentType === 'TRANSFER' && !selectedBankAccountIban) return true;
        if (selectedPaymentType === 'EWALLET' && !eWallet) return true;
        if (selectedPaymentType === 'EWALLET' && eWallet && eWallet.balance < calculateTotal()) return true;
        return false;
    }, [cartCount, selectedShippingAddressId, selectedPaymentType, cards, selectedCardNumber, bankAccounts, selectedBankAccountIban, eWallet, calculateTotal]);

    const handleCheckout = async () => {
        setIsCheckingOut(true);
        try {
            await orderService.checkout({
                shippingAddressId: selectedShippingAddressId,
                billingAddressId: selectedBillingAddressId,
                notes: '',
                paymentType: selectedPaymentType
            });
            clearCart();
            showSuccess('Order Placed Successfully', 'Your order has been placed and you will receive a confirmation email shortly.');
            navigate('/profile/orders');
        } catch (e) {
                        let errorMessage = 'Checkout failed';
            
            if (e?.response?.data?.message) {
                errorMessage = e.response.data.message;
            } else if (e?.response?.data?.error) {
                errorMessage = e.response.data.error;
            } else if (e?.response?.data) {
                errorMessage = typeof e.response.data === 'string' ? e.response.data : JSON.stringify(e.response.data);
            } else if (e?.message) {
                errorMessage = e.message;
            }
            
            showError('Checkout Failed', errorMessage);
        } finally {
            setIsCheckingOut(false);
        }
    };

    const openCheckoutModal = () => {
        setStep(1);
        setShowCheckoutModal(true);
    };

    const closeCheckoutModal = () => {
        setShowCheckoutModal(false);
    };

    return {
                showCheckoutModal,
        step,
        setStep,
        isCheckingOut,
        openCheckoutModal,
        closeCheckoutModal,

                addresses,
        selectedShippingAddressId,
        setSelectedShippingAddressId,
        selectedBillingAddressId,
        setSelectedBillingAddressId,

                selectedPaymentType,
        setSelectedPaymentType,
        cards,
        selectedCardNumber,
        setSelectedCardNumber,
        bankAccounts,
        selectedBankAccountIban,
        setSelectedBankAccountIban,
        eWallet,

                handleCheckout,
        proceedDisabled
    };
};
