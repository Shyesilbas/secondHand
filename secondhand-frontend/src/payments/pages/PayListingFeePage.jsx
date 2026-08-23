import PageContainer from '@/common/components/layout/PageContainer';
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
import { PAYMENT_TYPES } from '../paymentSchema.js';

const PayListingFeePage = () => {
 const { t } = useTranslation();
 const navigate = useNavigate();

 const {
 draftListings,
 isLoading: isListingsLoading,
 error: listingsError,
 refetch: refetchListings
 } = useDraftListings();

 const { enums, isLoading: isConfigLoading } = useEnums();
 const {
 paymentMethods,
 isLoading: isPaymentMethodsLoading,
 refetch: refetchPaymentMethods
 } = usePaymentMethods();

 const feeConfig = enums?.listingFeeConfig;
 const { emails, fetchEmails, clearEmails } = useEmails();
 const { eWallet } = useEWallet();

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

 // Pre-select listing from URL parameter if provided
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
 <div className="min-h-screen bg-slate-50/60 relative overflow-hidden pb-16">
 {/* Ambient background glows */}
 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 overflow-hidden pointer-events-none z-0">
 <div className="absolute -top-24 left-1/4 w-[40rem] h-[40rem] rounded-full bg-slate-800/10 blur-[130px]" />
 <div className="absolute top-10 right-1/4 w-[30rem] h-[30rem] rounded-full bg-slate-800/10 blur-[120px]" />
 </div>

 <PageContainer className="py-4 lg:py-6 relative z-10">
 {/* Header Navigation & Banner */}
 <motion.div
 initial={{ opacity: 0, y: -15 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.4 }}
 className="mb-5"
 >
 <div className="mb-2">
 <BackButton onClick={() => navigate(-1)} />
 </div>

 <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 pb-4 border-b border-slate-200/80">
 <div>
 <span className="text-xs font-extrabold uppercase tracking-widest text-slate-900 mb-1 block">
 {t("checkout_marketplace")}
 </span>
 <h1 className="text-3xl font-black text-slate-900 tracking-tight">
 {t("listing_fee_payment")}
 </h1>
 <p className="mt-1.5 text-sm text-slate-500 max-w-xl leading-relaxed">
 {t("complete_a_secure_payment_to_publish_you")}
 </p>
 </div>

 {/* Workflow Step Indicator */}
 <div className="flex items-center gap-2 bg-white/80 backdrop-blur-xl border border-slate-200/80 p-2.5 rounded-2xl shadow-sm self-start md:self-auto">
 <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-100 text-slate-900 font-bold text-xs">
 <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-white text-[10px]">1</span>
 <span>Select</span>
 </div>
 <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
 </svg>
 <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-100 text-slate-600 font-medium text-xs">
 <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-400 text-white text-[10px]">2</span>
 <span>Pay Fee</span>
 </div>
 <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
 </svg>
 <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-100 text-slate-600 font-medium text-xs">
 <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-400 text-white text-[10px]">3</span>
 <span>Published</span>
 </div>
 </div>
 </div>
 </motion.div>

 {/* Loading State */}
 {isLoading && (
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 className="flex flex-col items-center justify-center py-20 bg-white/60 backdrop-blur-xl rounded-3xl border border-slate-200/80 shadow-sm"
 >
 <LoadingIndicator />
 <p className="mt-4 text-sm font-semibold text-slate-600 animate-pulse">{t("loading_listings")}...</p>
 </motion.div>
 )}

 {/* Error State */}
 {!isLoading && error && (
 <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
 <ErrorMessage message={error} />
 </motion.div>
 )}

 {/* Main Content / Empty State */}
 {!isLoading && (
 draftListings.length === 0 && !selectedListing ? (
 <motion.div
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ duration: 0.3 }}
 className="rounded-3xl border border-slate-200/80 bg-white/80 backdrop-blur-xl px-8 py-16 text-center shadow-xl shadow-slate-200/50"
 >
 <EmptyState
 title={t("no_draft_listings")}
 description={
 <div className="space-y-4">
 <p className="text-slate-500">
 {t("no_draft_listings_found_you_can_create_a")}{' '}
 <button
 onClick={() => navigate(ROUTES.CREATE_LISTING)}
 className="font-bold text-slate-900 hover:text-slate-900 underline decoration-slate-300 underline-offset-4"
 >
 {t("clicking_here")}
 </button>.
 </p>
 </div>
 }
 />
 </motion.div>
 ) : (
 <motion.div
 initial={{ opacity: 0, y: 15 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.4, delay: 0.1 }}
 >
 <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
 {/* Left Column: Draft Listings Selector */}
 <DraftListingsList
 listings={draftListings}
 selectedListing={selectedListing}
 onSelectListing={setSelectedListing}
 onListingChanged={refetchListings}
 />

 {/* Right Column: Checkout Panel */}
 <PaymentPanel
 selectedListing={selectedListing}
 feeConfig={feeConfig}
 paymentType={PAYMENT_TYPES.EWALLET}
 isProcessingPayment={isProcessingPayment}
 onPayment={async () => {
 handlePayment();
 }}
 eWallet={eWallet}
 agreementsAccepted={agreementsAccepted}
 acceptedAgreementIds={acceptedAgreements}
 onAgreementToggle={onAgreementToggle}
 onRequiredAgreementsChange={onRequiredAgreementsChange}
 />
 </div>
 </motion.div>
 )
 )}

 {/* Verification & 3DS Modal */}
 {showConfirmModal && (
 <PaymentVerificationModal
 isOpen={showConfirmModal}
 selectedListing={selectedListing}
 feeConfig={feeConfig}
 paymentType={PAYMENT_TYPES.EWALLET}
 paymentMethods={paymentMethods}
 isLoadingPaymentMethods={isPaymentMethodsLoading}
 eWallet={eWallet}
 onStartVerification={startVerification}
 onVerifyAndPay={verifyAndPay}
 onCancel={() => setShowConfirmModal(false)}
 onNavigateToPaymentMethods={() => {
 setShowConfirmModal(false);
 navigate('/payments');
 }}
 isProcessing={isProcessingPayment}
 verificationCode={verificationCode}
 onChangeVerificationCode={setVerificationCode}
 codeExpiryTime={codeExpiryTime}
 onResendCode={resendVerificationCode}
 isResendingCode={isResendingCode}
 emails={emails}
 onFetchEmails={fetchEmails}
 onClearEmails={clearEmails}
 />
 )}
 </PageContainer>
 </div>
 );
};

export default PayListingFeePage;