import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../../order/services/orderService.js';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { useEWallet } from '../../ewallet/hooks/useEWallet.js';
import useAddresses from '../../user/hooks/useAddresses.js';
import { useEmails } from '../../payments/hooks/useEmails.js';
import { useAgreementsState } from '../../payments/hooks/useListingPaymentFlow.js';
import logger from '../../common/utils/logger.js';
import { ROUTES } from '../../common/constants/routes.js';
import { CART_CHECKOUT_DEFAULTS, CART_MESSAGES, CART_PAYMENT_TYPES } from '../cartConstants.js';
import { OTP_CODE_VALIDITY_SECONDS } from '../../payments/paymentSchema.js';
import { getCheckoutErrorMessage } from '../utils/checkoutError.js';

export const useCheckout = (cartCount, calculateTotal, resetCartState, couponCode, offerId) => {
    const navigate = useNavigate();
    const { showError, showSuccess } = useNotification();
    
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    const { addresses } = useAddresses();
    const { eWallet } = useEWallet();
    const { emails, fetchEmails } = useEmails();

    const [selectedShippingAddressId, setSelectedShippingAddressId] = useState(null);
    const [selectedBillingAddressId, setSelectedBillingAddressId] = useState(null);

    const [selectedPaymentType, setSelectedPaymentType] = useState(CART_PAYMENT_TYPES.EWALLET);

    const [showEWalletWarning, setShowEWalletWarning] = useState(false);
    const [paymentVerificationCode, setPaymentVerificationCode] = useState('');
    const [paymentVerificationExpiresAtMs, setPaymentVerificationExpiresAtMs] = useState(null);
    const [notes, setNotes] = useState('');
    const [orderName, setOrderName] = useState('');
    const [deliveryMethod, setDeliveryMethod] = useState('CARGO');
    const [meetupLocation, setMeetupLocation] = useState('');

    const findAddressById = (id) => {
        if (!id || !Array.isArray(addresses)) return null;
        return addresses.find((address) => String(address.id) === String(id)) || null;
    };

    const navigateToOrderSuccess = (checkoutResult) => {
        const orderId = checkoutResult?.id || checkoutResult?.orderId || null;
        const orderNumber = checkoutResult?.orderNumber || checkoutResult?.orderNo || null;
        const shippingAddress = findAddressById(selectedShippingAddressId);
        navigate(ROUTES.ORDER_SUCCESS, {
            state: {
                order: checkoutResult || null,
                orderId,
                orderNumber,
                totalAmount: calculateTotal(),
                createdAt: new Date().toISOString(),
                itemCount: cartCount,
                shippingAddress,
            },
        });
    };

    const {
        acceptedAgreements,
        onAgreementToggle,
        onRequiredAgreementsChange,
        areAllAgreementsAccepted,
        getAcceptedAgreementIds,
    } = useAgreementsState();

    useEffect(() => {
        if (selectedPaymentType !== CART_PAYMENT_TYPES.EWALLET) {
            setSelectedPaymentType(CART_PAYMENT_TYPES.EWALLET);
        }
    }, [selectedPaymentType]);

    const proceedDisabled = useMemo(() => {
        // If we have an offer, we don't strictly need cartCount > 0
        if (!offerId && cartCount === 0) return true;
        
        // Basic requirement: address
        if (!selectedShippingAddressId) return true;
        
        if (!eWallet || (eWallet.balance < calculateTotal())) return true;
        
        return false;
    }, [cartCount, offerId, selectedShippingAddressId, eWallet, calculateTotal]);

    const handleCheckout = async () => {
        if (isCheckingOut) return;
        
        setIsCheckingOut(true);
        try {
            logger.info('Initiating checkout process...', { paymentType: selectedPaymentType, offerId });

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
                billingAddressId: selectedBillingAddressId || selectedShippingAddressId,
                notes: String(notes || '').trim() || null,
                name: String(orderName || '').trim() || null,
                paymentType: selectedPaymentType,
                paymentVerificationCode: String(paymentVerificationCode || '').trim() || null,
                agreementsAccepted: true,
                acceptedAgreementIds: getAcceptedAgreementIds(),
                couponCode: String(couponCode || '').trim() || null,
                offerId: offerId || null,
                deliveryMethod: deliveryMethod,
                meetupLocation: deliveryMethod === 'SAFE_MEETUP' ? meetupLocation : null
            };

            logger.debug('Checkout payload prepared:', payload);

            const checkoutResult = await orderService.checkout(payload);
            
            logger.info('Checkout successful', { orderId: checkoutResult?.id });
            
            resetCartState?.();
            showSuccess(CART_MESSAGES.ORDER_PLACED_TITLE, CART_MESSAGES.ORDER_PLACED_DESCRIPTION);
            navigateToOrderSuccess(checkoutResult);
        } catch (e) {
            logger.error('Checkout failed:', e);
            showError(
                CART_MESSAGES.CHECKOUT_FAILED_TITLE,
                getCheckoutErrorMessage(e, CART_MESSAGES.CHECKOUT_FAILED)
            );
        } finally {
            setIsCheckingOut(false);
        }
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
            setPaymentVerificationExpiresAtMs(Date.now() + OTP_CODE_VALIDITY_SECONDS * 1000);
            try {
                await fetchEmails();
            } catch (err) {
                logger.warn('Failed to fetch emails:', err);
            }
            return true;
        } catch (e) {
            showError(
                CART_MESSAGES.VERIFICATION_SEND_FAILED_TITLE,
                getCheckoutErrorMessage(e, CART_MESSAGES.VERIFICATION_SEND_FAILED)
            );
            return false;
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
                billingAddressId: selectedBillingAddressId || selectedShippingAddressId,
                notes: String(notes || '').trim() || null,
                name: String(orderName || '').trim() || null,
                paymentType: selectedPaymentType,
                paymentVerificationCode: String(paymentVerificationCode || '').trim() || null,
                agreementsAccepted: true,
                acceptedAgreementIds: getAcceptedAgreementIds(),
                couponCode: String(couponCode || '').trim() || null,
                offerId: offerId || null,
                deliveryMethod: deliveryMethod,
                meetupLocation: deliveryMethod === 'SAFE_MEETUP' ? meetupLocation : null
            };
            const checkoutResult = await orderService.checkout(payload);
            resetCartState?.();
            showSuccess(CART_MESSAGES.ORDER_PLACED_TITLE, CART_MESSAGES.ORDER_PLACED_DESCRIPTION);
            navigateToOrderSuccess(checkoutResult);
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
        isCheckingOut,

        addresses,
        selectedShippingAddressId,
        setSelectedShippingAddressId,
        selectedBillingAddressId,
        setSelectedBillingAddressId,

        selectedPaymentType,
        setSelectedPaymentType,
        eWallet,
        paymentVerificationCode,
        setPaymentVerificationCode,
        paymentVerificationExpiresAtMs,
        notes,
        setNotes,
        orderName,
        setOrderName,
        deliveryMethod,
        setDeliveryMethod,
        meetupLocation,
        setMeetupLocation,

        handleCheckout,
        proceedDisabled,
        showEWalletWarning,
        setShowEWalletWarning,
        confirmEWalletWarningAndCheckout,
        sendVerificationCode,
        emails,
        fetchEmails,
        
        // Agreement related
        acceptedAgreements,
        onRequiredAgreementsChange,
        onAgreementToggle,
        areAllAgreementsAccepted
    };
};
