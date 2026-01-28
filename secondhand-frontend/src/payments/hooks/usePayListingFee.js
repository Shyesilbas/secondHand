import { useState, useEffect } from 'react';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { paymentService } from '../services/paymentService.js';
import { orderService } from '../../order/services/orderService.js';
import { createListingFeePaymentRequest } from '../payments.js';
import { usePaymentAgreements } from './usePaymentAgreements.js';

export const usePayListingFee = ({ selectedListing: initialSelectedListing, feeConfig, onSuccess, onVerificationRequired }) => {
    const [selectedListing, setSelectedListing] = useState(initialSelectedListing);
    const [paymentType, setPaymentType] = useState('CREDIT_CARD');
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [modalStep, setModalStep] = useState('REVIEW');
    const [verificationCode, setVerificationCode] = useState('');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [codeExpiryTime, setCodeExpiryTime] = useState(null);
    const [isResendingCode, setIsResendingCode] = useState(false);
    const { showSuccess, showError, showInfo } = useNotification();

    const [countdown, setCountdown] = useState(null);

    // Payment agreements
    const {
        acceptedAgreements,
        handleAgreementToggle,
        resetAgreements,
        areAllAgreementsAccepted,
        getAcceptedAgreementIds
    } = usePaymentAgreements();

    useEffect(() => {
        if (!codeExpiryTime) {
            setCountdown(null);
            return;
        }
        const tick = () => {
            const now = Date.now();
            const expiry = new Date(codeExpiryTime).getTime();
            const msLeft = Math.max(0, expiry - now);
            const totalSeconds = Math.floor(msLeft / 1000);
            const mm = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
            const ss = String(totalSeconds % 60).padStart(2, '0');
            setCountdown(`${mm}:${ss}`);
            if (msLeft === 0) {
                setCodeExpiryTime(null);
            }
        };
        tick();
        const timer = setInterval(tick, 1000);
        return () => clearInterval(timer);
    }, [codeExpiryTime]);

    const handlePayment = async () => {
        if (!selectedListing) {
            showError('Error', 'Please select a listing to pay for.');
            return;
        }

        if (!feeConfig) {
            showError('Error', 'Fee configuration not loaded. Please refresh the page.');
            return;
        }
        setModalStep('REVIEW');
        setShowConfirmModal(true);
    };

    const confirmPayment = async () => {
        if (!selectedListing || !feeConfig) {
            showError('Error', 'Please select a listing and ensure fee configuration is loaded.');
            return;
        }

        setIsProcessingPayment(true);

        try {
            if (modalStep === 'REVIEW') {
                await orderService.initiatePaymentVerification({
                    transactionType: 'LISTING_CREATION',
                    listingId: selectedListing.id,
                    amount: feeConfig.totalCreationFee
                });
                showInfo('Verification Required', 'Enter the verification code sent to your email.');
                const expiryTime = new Date();
                expiryTime.setMinutes(expiryTime.getMinutes() + 3);
                setCodeExpiryTime(expiryTime);
                setModalStep('VERIFY');
                if (onVerificationRequired) {
                    onVerificationRequired();
                }
            } else if (modalStep === 'VERIFY') {
                const paymentData = createListingFeePaymentRequest({
                    listingId: selectedListing.id,
                    paymentType: paymentType,
                    verificationCode: verificationCode,
                    agreementsAccepted: true,
                    acceptedAgreementIds: getAcceptedAgreementIds()
                });
                await paymentService.createListingFeePayment(paymentData);

                showSuccess('Success', 'Listing fee payment successful! Your listing will be published.');

                setSelectedListing(null);
                setVerificationCode('');
                setCodeExpiryTime(null);
                setModalStep('REVIEW');
                setShowConfirmModal(false);

                if (onSuccess) {
                    onSuccess();
                }
            }
        } catch (err) {
            const message =
                err?.response?.data?.message ||
                err?.message ||
                'An unexpected error occurred.';
            showError('Error', message);
        } finally {
            setIsProcessingPayment(false);
        }
    };

    const resendVerificationCode = async () => {
        if (!selectedListing) {
            showError('Error', 'Please select a listing first.');
            return;
        }

        setIsResendingCode(true);
        try {
            await orderService.initiatePaymentVerification({
                transactionType: 'LISTING_CREATION',
                listingId: selectedListing.id,
                amount: feeConfig?.totalCreationFee
            });
            showSuccess('Success', 'A new verification code has been sent to your email.');
            setVerificationCode('');
            const expiryTime = new Date();
            expiryTime.setMinutes(expiryTime.getMinutes() + 3);
            setCodeExpiryTime(expiryTime);
            if (onVerificationRequired) {
                onVerificationRequired();
            }
        } catch (err) {
            const message =
                err?.response?.data?.message ||
                err?.message ||
                'An unexpected error occurred.';
            showError('Error', message);
        } finally {
            setIsResendingCode(false);
        }
    };

    return {
        selectedListing,
        setSelectedListing,
        paymentType,
        setPaymentType,
        isProcessingPayment,
        modalStep,
        verificationCode,
        setVerificationCode,
        codeExpiryTime,
        countdown,
        isResendingCode,
        showConfirmModal,
        setShowConfirmModal,
        handlePayment,
        confirmPayment,
        resendVerificationCode,
        // Agreement related
        acceptedAgreements,
        agreementsAccepted: areAllAgreementsAccepted([]), // Will be updated when we have required agreements
        onAgreementToggle: handleAgreementToggle
    };
};
