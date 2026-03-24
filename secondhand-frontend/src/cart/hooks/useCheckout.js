import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../../order/services/orderService.js';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { useEWallet } from '../../ewallet/hooks/useEWallet.js';
import useAddresses from '../../user/hooks/useAddresses.js';
import { useEmails } from '../../payments/hooks/useEmails.js';
import { paymentService } from '../../payments/services/paymentService.js';
import { useAgreementsState } from '../../payments/hooks/useListingPaymentFlow.js';
import logger from '../../common/utils/logger.js';
import { ROUTES } from '../../common/constants/routes.js';
import { CART_CHECKOUT_DEFAULTS, CART_MESSAGES, CART_PAYMENT_TYPES } from '../cartConstants.js';
import { getCheckoutErrorMessage } from '../utils/checkoutError.js';

export const useCheckout = (cartCount, calculateTotal, clearCart, couponCode, offerId) => {
    const navigate = useNavigate();
    const { showError, showSuccess } = useNotification();
    
    const [showCheckoutModal, setShowCheckoutModal] = useState(false);
    const [step, setStep] = useState(CART_CHECKOUT_DEFAULTS.INITIAL_CHECKOUT_STEP);
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    const { addresses } = useAddresses();
    const { eWallet } = useEWallet();
    const { emails, isLoading: isEmailsLoading, fetchEmails } = useEmails();

    const [selectedShippingAddressId, setSelectedShippingAddressId] = useState(null);
    const [selectedBillingAddressId, setSelectedBillingAddressId] = useState(null);

    const [selectedPaymentType, setSelectedPaymentType] = useState(CART_PAYMENT_TYPES.CREDIT_CARD);
    const [cards, setCards] = useState([]);
    const [selectedCardNumber, setSelectedCardNumber] = useState(null);
    const [bankAccounts, setBankAccounts] = useState([]);
    const [selectedBankAccountIban, setSelectedBankAccountIban] = useState(null);

    const [showEWalletWarning, setShowEWalletWarning] = useState(false);
    const [paymentVerificationCode, setPaymentVerificationCode] = useState('');
    const [notes, setNotes] = useState('');
    const [orderName, setOrderName] = useState('');

    const {
        acceptedAgreements,
        onAgreementToggle,
        onRequiredAgreementsChange,
        areAllAgreementsAccepted,
        getAcceptedAgreementIds,
    } = useAgreementsState();

    useEffect(() => {
        
        paymentService
            .getCreditCards()
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
                logger.error('Error loading cards:', err);
                setCards([]);
            });

        paymentService
            .getBankAccounts()
            .then((data) => {
                const normalized = Array.isArray(data)
                    ? data
                    : (data && Array.isArray(data.content) ? data.content : []);
                setBankAccounts(normalized);
            })
            .catch(() => setBankAccounts([]));
    }, []);

    useEffect(() => {
        if (selectedPaymentType === CART_PAYMENT_TYPES.TRANSFER &&
            Array.isArray(bankAccounts) &&
            bankAccounts.length > 0 &&
            !selectedBankAccountIban) {
            setSelectedBankAccountIban(bankAccounts[0].IBAN || null);
        }
        
        if (selectedPaymentType === CART_PAYMENT_TYPES.CREDIT_CARD &&
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
        if (selectedPaymentType === CART_PAYMENT_TYPES.CREDIT_CARD && (!Array.isArray(cards) || cards.length === 0)) return true;
        if (selectedPaymentType === CART_PAYMENT_TYPES.CREDIT_CARD && !selectedCardNumber) return true;
        if (selectedPaymentType === CART_PAYMENT_TYPES.TRANSFER && (!Array.isArray(bankAccounts) || bankAccounts.length === 0)) return true;
        if (selectedPaymentType === CART_PAYMENT_TYPES.TRANSFER && !selectedBankAccountIban) return true;
        if (selectedPaymentType === CART_PAYMENT_TYPES.EWALLET && !eWallet) return true;
        if (selectedPaymentType === CART_PAYMENT_TYPES.EWALLET && eWallet && eWallet.balance < calculateTotal()) return true;
        return false;
    }, [cartCount, selectedShippingAddressId, selectedPaymentType, cards, selectedCardNumber, bankAccounts, selectedBankAccountIban, eWallet, calculateTotal]);

    const handleCheckout = async () => {
        setIsCheckingOut(true);
        try {
            if (selectedPaymentType === CART_PAYMENT_TYPES.EWALLET && eWallet && eWallet.spendingWarningLimit) {
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
                notes: notes?.trim() || null,
                name: orderName?.trim() || null,
                paymentType: selectedPaymentType,
                paymentVerificationCode: paymentVerificationCode?.trim() || null,
                agreementsAccepted: true,
                acceptedAgreementIds: getAcceptedAgreementIds(),
                couponCode: couponCode?.trim() || null,
                offerId: offerId || null
            };
            await orderService.checkout(payload);
            await clearCart();
            showSuccess(CART_MESSAGES.ORDER_PLACED_TITLE, CART_MESSAGES.ORDER_PLACED_DESCRIPTION);
            navigate(ROUTES.MY_ORDERS);
        } catch (e) {
            showError(
                CART_MESSAGES.CHECKOUT_FAILED_TITLE,
                getCheckoutErrorMessage(e, CART_MESSAGES.CHECKOUT_FAILED)
            );
        } finally {
            setIsCheckingOut(false);
        }
    };

    const openCheckoutModal = () => {
        setStep(CART_CHECKOUT_DEFAULTS.INITIAL_CHECKOUT_STEP);
        setShowCheckoutModal(true);
    };

    const closeCheckoutModal = () => {
        setShowCheckoutModal(false);
        // Reset states when modal closes to prevent stale data
        setStep(CART_CHECKOUT_DEFAULTS.INITIAL_CHECKOUT_STEP);
        setSelectedShippingAddressId(null);
        setSelectedBillingAddressId(null);
        setSelectedPaymentType(CART_PAYMENT_TYPES.CREDIT_CARD);
        setCards([]);
        setSelectedCardNumber(null);
        setBankAccounts([]);
        setSelectedBankAccountIban(null);
        setPaymentVerificationCode('');
        setNotes('');
        setShowEWalletWarning(false);
    };

    const sendVerificationCode = async () => {
        setIsCheckingOut(true);
        try {
            await orderService.initiatePaymentVerification?.({
                transactionType: CART_CHECKOUT_DEFAULTS.VERIFICATION_TRANSACTION_TYPE,
                couponCode: couponCode?.trim() || null,
                offerId: offerId || null
            });
            showSuccess(CART_MESSAGES.VERIFICATION_SENT_TITLE, CART_MESSAGES.VERIFICATION_SENT_DESCRIPTION);
            try { await fetchEmails(); } catch {}
        } catch (e) {
            showError(
                CART_MESSAGES.VERIFICATION_SEND_FAILED_TITLE,
                getCheckoutErrorMessage(e, CART_MESSAGES.VERIFICATION_SEND_FAILED)
            );
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
                notes: notes?.trim() || null,
                name: orderName?.trim() || null,
                paymentType: selectedPaymentType,
                paymentVerificationCode: paymentVerificationCode?.trim() || null,
                agreementsAccepted: true,
                acceptedAgreementIds: getAcceptedAgreementIds(),
                couponCode: couponCode?.trim() || null,
                offerId: offerId || null
            };
            await orderService.checkout(payload);
            clearCart();
            showSuccess(CART_MESSAGES.ORDER_PLACED_TITLE, CART_MESSAGES.ORDER_PLACED_DESCRIPTION);
            navigate(ROUTES.MY_ORDERS);
        } catch (e) {
            showError(
                CART_MESSAGES.CHECKOUT_FAILED_TITLE,
                getCheckoutErrorMessage(e, CART_MESSAGES.CHECKOUT_FAILED)
            );
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
        notes,
        setNotes,
        orderName,
        setOrderName,

        handleCheckout,
        proceedDisabled,
        showEWalletWarning,
        setShowEWalletWarning,
        confirmEWalletWarningAndCheckout,
        sendVerificationCode,
        emails,
        isEmailsLoading,
        fetchEmails,
        
        // Agreement related
        acceptedAgreements,
        onRequiredAgreementsChange,
        onAgreementToggle,
        areAllAgreementsAccepted
    };
};
