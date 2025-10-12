import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { creditCardService } from '../../payments/services/creditCardService.js';
import { bankService } from '../../payments/services/bankService.js';
import { orderService } from '../../order/services/orderService.js';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { useEWallet } from '../../ewallet/hooks/useEWallet.js';
import useAddresses from '../../user/hooks/useAddresses.js';
import { useEmails } from '../../payments/hooks/useEmails.js';

export const useCheckout = (cartCount, calculateTotal, clearCart) => {
    const navigate = useNavigate();
    const { showError, showSuccess } = useNotification();
    
    const [showCheckoutModal, setShowCheckoutModal] = useState(false);
    const [step, setStep] = useState(1);
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    // Only load data when checkout modal is open
    const { addresses } = useAddresses({ enabled: showCheckoutModal });
    const { eWallet } = useEWallet({ enabled: showCheckoutModal });
    const { emails, isLoading: isEmailsLoading, fetchEmails } = useEmails();

    const [selectedShippingAddressId, setSelectedShippingAddressId] = useState(null);
    const [selectedBillingAddressId, setSelectedBillingAddressId] = useState(null);

    const [selectedPaymentType, setSelectedPaymentType] = useState('CREDIT_CARD');
    const [cards, setCards] = useState([]);
    const [selectedCardNumber, setSelectedCardNumber] = useState(null);
    const [bankAccounts, setBankAccounts] = useState([]);
    const [selectedBankAccountIban, setSelectedBankAccountIban] = useState(null);

    const [showEWalletWarning, setShowEWalletWarning] = useState(false);
    const [paymentVerificationCode, setPaymentVerificationCode] = useState('');

    // Load payment methods only when checkout modal is open
    useEffect(() => {
        if (!showCheckoutModal) return;
        
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
    }, [showCheckoutModal]);

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
            if (selectedPaymentType === 'EWALLET' && eWallet && eWallet.spendingWarningLimit) {
                const projectedSpent = calculateTotal();
                if (projectedSpent >= eWallet.spendingWarningLimit) {
                    setShowEWalletWarning(true);
                    setIsCheckingOut(false);
                    return;
                }
            }
            const payload = {
                shippingAddressId: selectedShippingAddressId,
                billingAddressId: selectedBillingAddressId,
                notes: '',
                paymentType: selectedPaymentType,
                paymentVerificationCode: paymentVerificationCode?.trim() || null
            };
            console.debug('Checkout payload:', payload);
            await orderService.checkout(payload);
            await clearCart();
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
        // Reset states when modal closes to prevent stale data
        setStep(1);
        setSelectedShippingAddressId(null);
        setSelectedBillingAddressId(null);
        setSelectedPaymentType('CREDIT_CARD');
        setCards([]);
        setSelectedCardNumber(null);
        setBankAccounts([]);
        setSelectedBankAccountIban(null);
        setPaymentVerificationCode('');
        setShowEWalletWarning(false);
    };

    const sendVerificationCode = async () => {
        setIsCheckingOut(true);
        try {
            await orderService.initiatePaymentVerification?.({
                transactionType: 'ITEM_PURCHASE'
            });
            showSuccess('Verification Code Sent', 'Please check your email for the code.');
            try { await fetchEmails(); } catch {}
        } catch (e) {
            let errorMessage = 'Failed to send verification code';
            if (e?.response?.data?.message) {
                errorMessage = e.response.data.message;
            } else if (e?.response?.data?.error) {
                errorMessage = e.response.data.error;
            } else if (e?.response?.data) {
                errorMessage = typeof e.response.data === 'string' ? e.response.data : JSON.stringify(e.response.data);
            } else if (e?.message) {
                errorMessage = e.message;
            }
            showError('Verification Failed', errorMessage);
        } finally {
            setIsCheckingOut(false);
        }
    };

    const confirmEWalletWarningAndCheckout = async () => {
        setShowEWalletWarning(false);
        setIsCheckingOut(true);
        try {
            const payload = {
                shippingAddressId: selectedShippingAddressId,
                billingAddressId: selectedBillingAddressId,
                notes: '',
                paymentType: selectedPaymentType,
                paymentVerificationCode: paymentVerificationCode?.trim() || null
            };
            console.debug('Checkout payload (confirm):', payload);
            await orderService.checkout(payload);
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
        paymentVerificationCode,
        setPaymentVerificationCode,

        handleCheckout,
        proceedDisabled,
        showEWalletWarning,
        setShowEWalletWarning,
        confirmEWalletWarningAndCheckout,
        sendVerificationCode,
        emails,
        isEmailsLoading,
        fetchEmails
    };
};
