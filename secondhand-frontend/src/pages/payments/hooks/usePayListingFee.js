import { useState, useEffect } from 'react';
import { useNotification } from '../../../notification/NotificationContext.jsx';
import { paymentService } from '../../../features/payments/services/paymentService';
import { createListingFeePaymentRequest } from '../../../types/payments';

export const usePayListingFee = ({ selectedListing: initialSelectedListing, feeConfig, onSuccess, onVerificationRequired }) => {
    const [selectedListing, setSelectedListing] = useState(initialSelectedListing);
    const [paymentType, setPaymentType] = useState('CREDIT_CARD');
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    // Modal step: REVIEW -> VERIFY
    const [modalStep, setModalStep] = useState('REVIEW');
    const [verificationCode, setVerificationCode] = useState('');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [codeExpiryTime, setCodeExpiryTime] = useState(null);
    const [isResendingCode, setIsResendingCode] = useState(false);
    const notification = useNotification();

    // Code expiry timer
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
            notification.showError('Hata', 'Lütfen ödeme yapacağınız ilanı seçin.');
            return;
        }

        if (!feeConfig) {
            notification.showError('Hata', 'Ücret yapılandırması yüklenmedi. Lütfen sayfayı yenileyin.');
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
            console.log('Sending payment request:', paymentData);
            await paymentService.createListingFeePayment(paymentData);

            // Payment successful
            notification.showSuccess('Başarılı', 'İlan ücreti ödemesi başarılı! İlanınız yayınlanacak.');
            
            // Reset state
            setSelectedListing(null);
            setVerificationCode('');
            setCodeExpiryTime(null);
            setModalStep('REVIEW');
            setShowConfirmModal(false);
            
            // Call success callback
            if (onSuccess) {
                onSuccess();
            }
            
        } catch (err) {
            console.log('Payment error:', err.response?.data);
            if (err.response?.data?.error === 'PAYMENT_VERIFICATION_REQUIRED' || err.response?.data?.errorCode === 'PAYMENT_VERIFICATION_REQUIRED') {
                notification.showInfo('Doğrulama Gerekli', 'E-postanıza gönderilen doğrulama kodunu giriniz.');
                setModalStep('VERIFY');
                // Set code expiry time (15 minutes) without auto-fetching emails
                const expiryTime = new Date();
                expiryTime.setMinutes(expiryTime.getMinutes() + 15);
                setCodeExpiryTime(expiryTime);
            } else {
                notification.showError('Hata', err.response?.data?.message || 'İlan ücreti ödemesi başarısız. Lütfen daha sonra tekrar deneyin.');
            }
        } finally {
            setIsProcessingPayment(false);
        }
    };

    const resendVerificationCode = async () => {
        if (!selectedListing) {
            notification.showError('Hata', 'Lütfen önce bir ilan seçin.');
            return;
        }

        setIsResendingCode(true);
        try {
            const paymentData = createListingFeePaymentRequest({
                listingId: selectedListing.id,
                paymentType: paymentType,
                verificationCode: '', // Empty code to request new one
            });
            
            await paymentService.createListingFeePayment(paymentData);
        } catch (err) {
            if (err.response?.data?.error === 'PAYMENT_VERIFICATION_REQUIRED' || err.response?.data?.errorCode === 'PAYMENT_VERIFICATION_REQUIRED') {
                notification.showSuccess('Yeni Kod Gönderildi', 'Yeni doğrulama kodu e-postanıza gönderildi.');
                setVerificationCode('');
                // Do not auto-fetch emails; user can open via modal action
            } else {
                notification.showError('Hata', err.response?.data?.message || 'Yeni kod gönderilemedi.');
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
