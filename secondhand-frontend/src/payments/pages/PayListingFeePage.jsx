import { useTranslation } from "react-i18next";
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useDraftListings, usePayListingFee } from '../hooks/useListingPaymentFlow.js';
import { useEnums } from '../../common/hooks/useEnums.js';
import { usePaymentMethods } from '../hooks/useFinancialAccountManager.js';
import { useEmails } from '../hooks/useEmails.js';
import BackButton from '../../common/components/ui/BackButton.jsx';
import ErrorMessage from '../../common/components/ui/ErrorMessage.jsx';
import EmptyState from '../../common/components/ui/EmptyState.jsx';
import DraftListingsList from '../components/DraftListingsList.jsx';
import PaymentPanel from '../components/PaymentPanel.jsx';
import PaymentVerificationModal from '../components/PaymentVerificationModal.jsx';
import LoadingIndicator from "../../common/components/ui/LoadingIndicator.jsx";
import { useEWallet } from '../../ewallet/hooks/useEWallet.js';
import { ROUTES } from '../../common/constants/routes.js';
const PayListingFeePage = () => {
  const {
    t
  } = useTranslation();
  const navigate = useNavigate();
  const {
    draftListings,
    isLoading: isListingsLoading,
    error: listingsError,
    refetch: refetchListings
  } = useDraftListings();
  const {
    enums,
    isLoading: isConfigLoading
  } = useEnums();
  const {
    paymentMethods,
    isLoading: isPaymentMethodsLoading,
    refetch: refetchPaymentMethods
  } = usePaymentMethods();
  const feeConfig = enums.listingFeeConfig;
  const {
    emails,
    fetchEmails,
    clearEmails
  } = useEmails();
  const {
    eWallet
  } = useEWallet();
  const {
    selectedListing,
    setSelectedListing,
    paymentType,
    setPaymentType,
    isProcessingPayment,
    verificationCode,
    setVerificationCode,
    codeExpiryTime,
    isResendingCode,
    handlePayment,
    startVerification,
    verifyAndPay,
    resendVerificationCode,
    showConfirmModal,
    setShowConfirmModal,
    acceptedAgreements,
    agreementsAccepted,
    onAgreementToggle,
    onRequiredAgreementsChange
  } = usePayListingFee({
    selectedListing: null,
    feeConfig,
    onSuccess: refetchListings
  });
  const isLoading = isListingsLoading || isConfigLoading;
  const error = listingsError;

  // Pre-select listing from URL if provided
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const targetListingId = urlParams.get('listingId');
    if (targetListingId && draftListings?.length > 0 && !selectedListing) {
      const found = draftListings.find(l => l.id === targetListingId);
      if (found) {
        setSelectedListing(found);
      }
    }
  }, [draftListings, selectedListing, setSelectedListing]);
  useEffect(() => {
    if (showConfirmModal) {
      refetchPaymentMethods();
    }
  }, [showConfirmModal, refetchPaymentMethods]);
  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
        {/* Ambient Background Glows */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
            <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-400/10 blur-[120px]" />
            <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-purple-400/10 blur-[120px]" />
            <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[60%] rounded-full bg-blue-300/10 blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8 lg:py-12 relative z-10">
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="mb-10 flex items-center justify-between"
            >
                <div>
                    <div className="mb-4">
                        <BackButton onClick={() => navigate(-1)} />
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900">
                        {t("listing_fee_payment")}
                    </h1>
                    <p className="mt-2 text-base text-slate-500 max-w-2xl">
                        {t("complete_a_secure_payment_to_publish_you")}
                    </p>
                </div>
            </motion.div>

            {isLoading && (
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="mt-6 flex justify-center py-12"
                >
                    <LoadingIndicator />
                </motion.div>
            )}

            {!isLoading && error && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                    <ErrorMessage message={error} />
                </motion.div>
            )}

            {!isLoading && (draftListings.length === 0 && !selectedListing ? (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    className="mt-6 rounded-[2.5rem] border border-white/60 bg-white/60 backdrop-blur-xl px-8 py-16 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
                >
                    <EmptyState 
                        title={t("no_draft_listings")} 
                        description={
                            <>
                                {t("no_draft_listings_found_you_can_create_a")}{' '}
                                <button onClick={() => navigate(ROUTES.CREATE_LISTING)} className="font-semibold text-indigo-600 underline decoration-indigo-200 underline-offset-4 transition-colors hover:text-indigo-800 hover:decoration-indigo-400">
                                    {t("clicking_here")}
                                </button>.
                            </>
                        } 
                    />
                </motion.div>
            ) : (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="mt-6"
                >
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
                        <DraftListingsList listings={draftListings} selectedListing={selectedListing} onSelectListing={setSelectedListing} onListingChanged={refetchListings} />

                        <PaymentPanel selectedListing={selectedListing} feeConfig={feeConfig} paymentType={paymentType} onPaymentTypeChange={setPaymentType} isProcessingPayment={isProcessingPayment} onPayment={async () => {
                            handlePayment();
                        }} eWallet={eWallet} agreementsAccepted={agreementsAccepted} acceptedAgreementIds={acceptedAgreements} onAgreementToggle={onAgreementToggle} onRequiredAgreementsChange={onRequiredAgreementsChange} />
                    </div>
                </motion.div>
            ))}

            {showConfirmModal && <PaymentVerificationModal isOpen={showConfirmModal} selectedListing={selectedListing} feeConfig={feeConfig} paymentType={paymentType} paymentMethods={paymentMethods} isLoadingPaymentMethods={isPaymentMethodsLoading} eWallet={eWallet} onStartVerification={startVerification} onVerifyAndPay={verifyAndPay} onCancel={() => setShowConfirmModal(false)} onNavigateToPaymentMethods={() => {
                setShowConfirmModal(false);
                navigate('/payments');
            }} isProcessing={isProcessingPayment} verificationCode={verificationCode} onChangeVerificationCode={setVerificationCode} codeExpiryTime={codeExpiryTime} onResendCode={resendVerificationCode} isResendingCode={isResendingCode} emails={emails} onFetchEmails={fetchEmails} onClearEmails={clearEmails} />}
        </div>
    </div>
  );
};
export default PayListingFeePage;