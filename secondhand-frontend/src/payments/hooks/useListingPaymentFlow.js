import { useCallback, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNotification } from '../../notification/NotificationContext.jsx';
import { paymentService } from '../services/paymentService.js';
import { orderService } from '../../order/services/orderService.js';
import { createListingFeePaymentRequest } from '../paymentSchema.js';
import { handleError } from '../../common/errorHandler.js';
import { listingService } from '../../listing/services/listingService.js';
import { useAuthState } from '../../auth/AuthContext.jsx';
import { PAYMENT_QUERY_KEYS } from '../paymentSchema.js';

export const useAgreementsState = () => {
  const [acceptedAgreements, setAcceptedAgreements] = useState(new Set());
  const [requiredAgreementIds, setRequiredAgreementIds] = useState(new Set());

  const onAgreementToggle = useCallback((agreementId) => {
    setAcceptedAgreements((prev) => {
      const next = new Set(prev);
      if (next.has(agreementId)) {
        next.delete(agreementId);
      } else {
        next.add(agreementId);
      }
      return next;
    });
  }, []);

  const onRequiredAgreementsChange = useCallback((agreements) => {
    if (!Array.isArray(agreements)) {
      setRequiredAgreementIds(new Set());
      return;
    }

    const ids = agreements
      .map((a) => (typeof a === 'string' ? a : a?.agreementId))
      .filter(Boolean);

    setRequiredAgreementIds(new Set(ids));
  }, []);

  const areAllAgreementsAccepted = useCallback(() => {
    if (requiredAgreementIds.size === 0) return true;
    for (const id of requiredAgreementIds) {
      if (!acceptedAgreements.has(id)) return false;
    }
    return true;
  }, [acceptedAgreements, requiredAgreementIds]);

  const getAcceptedAgreementIds = useCallback(() => Array.from(acceptedAgreements), [acceptedAgreements]);

  return {
    acceptedAgreements,
    onAgreementToggle,
    onRequiredAgreementsChange,
    areAllAgreementsAccepted,
    getAcceptedAgreementIds,
  };
};

export const useDraftListings = () => {
  const { user, isAuthenticated } = useAuthState();

  const queryFn = useCallback(async () => {
    // İlk sayfadan (page=0) makul bir limit ile taslak ilanları çek
    const data = await listingService.getMyListingsByStatus('DRAFT', 0, 50);

    // Backend artık Page döndürüyor; content dizisini kullan
    if (data && Array.isArray(data.content)) {
      return data.content;
    }

    // Eski/non-paginated response için geri dönüş uyumluluğu
    return Array.isArray(data) ? data : [];
  }, []);

  const {
    data: draftListings = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [...PAYMENT_QUERY_KEYS.draftListings, user?.id],
    queryFn,
    enabled: !!(isAuthenticated && user?.id),
    staleTime: 30 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    retry: 1,
  });

  return {
    draftListings,
    isLoading,
    error: error?.response?.data?.message || error?.message || null,
    refetch,
  };
};

export const usePayListingFee = ({ selectedListing: initialSelectedListing, feeConfig, onSuccess }) => {
  const [selectedListing, setSelectedListing] = useState(initialSelectedListing);
  const [paymentType, setPaymentType] = useState('CREDIT_CARD');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [codeExpiryTime, setCodeExpiryTime] = useState(null);
  const [isResendingCode, setIsResendingCode] = useState(false);
  const { showSuccess, showError, showInfo } = useNotification();

  const [countdown, setCountdown] = useState(null);

  const {
    acceptedAgreements,
    onAgreementToggle,
    onRequiredAgreementsChange,
    areAllAgreementsAccepted,
    getAcceptedAgreementIds,
  } = useAgreementsState();

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
    setShowConfirmModal(true);
  };

  const startVerification = useCallback(async () => {
    if (!selectedListing || !feeConfig) {
      showError('Error', 'Please select a listing and ensure fee configuration is loaded.');
      return false;
    }

    setIsProcessingPayment(true);

    try {
      await orderService.initiatePaymentVerification({
        transactionType: 'LISTING_CREATION',
        listingId: selectedListing.id,
        amount: feeConfig.totalCreationFee
      });
      showInfo('Verification Required', 'Enter the verification code sent to your email.');
      const expiryTime = new Date();
      expiryTime.setMinutes(expiryTime.getMinutes() + 3);
      setCodeExpiryTime(expiryTime);
      return true;
    } catch (err) {
      handleError(err, showError);
      return false;
    } finally {
      setIsProcessingPayment(false);
    }
  }, [selectedListing, feeConfig, showError, showInfo]);

  const verifyAndPay = useCallback(async () => {
    if (!selectedListing || !feeConfig) {
      showError('Error', 'Please select a listing and ensure fee configuration is loaded.');
      return false;
    }

    setIsProcessingPayment(true);

    try {
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
      setShowConfirmModal(false);

      if (onSuccess) {
        onSuccess();
      }
      return true;
    } catch (err) {
      handleError(err, showError);
      return false;
    } finally {
      setIsProcessingPayment(false);
    }
  }, [selectedListing, feeConfig, paymentType, verificationCode, getAcceptedAgreementIds, onSuccess, showError, showSuccess]);

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
    } catch (err) {
      handleError(err, showError);
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
    verificationCode,
    setVerificationCode,
    codeExpiryTime,
    countdown,
    isResendingCode,
    showConfirmModal,
    setShowConfirmModal,
    handlePayment,
    startVerification,
    verifyAndPay,
    resendVerificationCode,
    acceptedAgreements,
    agreementsAccepted: areAllAgreementsAccepted(),
    onAgreementToggle,
    onRequiredAgreementsChange
  };
};

