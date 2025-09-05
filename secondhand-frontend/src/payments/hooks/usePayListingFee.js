import { useState, useEffect } from 'react';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { paymentService } from '../services/paymentService.js';
import { createListingFeePaymentRequest } from '../payments.js';

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

    useEffect(() => {
        if (codeExpiryTime) {
            const timer = setInterval(() => {
                const now = new Date().getTime();
                const expiry = new Date(codeExpiryTime).getTime();
                const timeLeft = expiry - now;

                if (timeLeft <= 0) {
                    setCodeExpiryTime(null);
                    clearInterval(timer);
                }
            }, 1000);

            return () => clearInterval(timer);
        }
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
        setIsProcessingPayment(true);

        try {
            const paymentData = createListingFeePaymentRequest({
                listingId: selectedListing.id,
                paymentType: paymentType,
                verificationCode: verificationCode,
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

        } catch (err) {
            if (err.response?.data?.error === 'PAYMENT_VERIFICATION_REQUIRED' || err.response?.data?.errorCode === 'PAYMENT_VERIFICATION_REQUIRED') {
                showInfo('Verification Required', 'Enter the verification code sent to your email.');
                setModalStep('VERIFY');
                const expiryTime = new Date();
                expiryTime.setMinutes(expiryTime.getMinutes() + 15);
                setCodeExpiryTime(expiryTime);
                if (onVerificationRequired) onVerificationRequired();
            } else {
                showError('Error', err.response?.data?.message || 'Listing fee payment failed. Please try again later.');
            }
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
            const paymentData = createListingFeePaymentRequest({
                listingId: selectedListing.id,
                paymentType: paymentType,
                verificationCode: '',
            });
            await paymentService.createListingFeePayment(paymentData);
        } catch (err) {
            if (err.response?.data?.error === 'PAYMENT_VERIFICATION_REQUIRED' || err.response?.data?.errorCode === 'PAYMENT_VERIFICATION_REQUIRED') {
                showSuccess('Success', 'A new verification code has been sent to your email.');
                setVerificationCode('');
            } else {
                showError('Error', err.response?.data?.message || 'Failed to resend verification code.');
            }
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
        isResendingCode,
        showConfirmModal,
        setShowConfirmModal,
        handlePayment,
        confirmPayment,
        resendVerificationCode
    };
};
