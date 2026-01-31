import React, { useEffect } from 'react';
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

const PayListingFeePage = () => {
    const navigate = useNavigate();

    const { draftListings, isLoading: isListingsLoading, error: listingsError, refetch: refetchListings } = useDraftListings();
    const { enums, isLoading: isConfigLoading } = useEnums();
    const { paymentMethods, isLoading: isPaymentMethodsLoading, refetch: refetchPaymentMethods } = usePaymentMethods();

    const feeConfig = enums.listingFeeConfig;
    const { emails, isLoading: isEmailsLoading, fetchEmails, clearEmails } = useEmails();
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
        countdown,
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

    useEffect(() => {
        if (showConfirmModal) {
            refetchPaymentMethods();
        }
    }, [showConfirmModal, refetchPaymentMethods]);

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <BackButton onClick={() => navigate(-1)} />
                        <h1 className="mt-4 text-3xl font-bold tracking-tighter text-slate-900">
                            Listing Fee Payment
                        </h1>
                        <p className="mt-2 text-sm text-slate-500">
                            Complete a secure payment to publish your draft listing to the marketplace.
                        </p>
                    </div>
                </div>

                {isLoading && (
                    <div className="mt-6">
                        <LoadingIndicator />
                    </div>
                )}

                {!isLoading && error && <ErrorMessage message={error} />}

                {!isLoading && (draftListings.length === 0 ? (
                    <div className="mt-6 rounded-[2rem] border border-slate-200/60 bg-white/80 px-6 py-10 shadow-[0_18px_45px_rgba(15,23,42,0.05)]">
                        <EmptyState
                            title="No Draft Listings"
                            description={
                                <>
                                    No draft listings found. You can create a new listing by{' '}
                                    <button
                                        onClick={() => navigate('/listings/create')}
                                        className="font-medium text-indigo-600 underline transition-colors hover:text-indigo-700"
                                    >
                                        clicking here
                                    </button>
                                    .
                                </>
                            }
                        />
                    </div>
                ) : (
                    <div className="mt-6 rounded-[2rem] border border-slate-200/60 bg-white/90 px-4 py-5 shadow-[0_22px_60px_rgba(15,23,42,0.06)] sm:px-6 sm:py-6">
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                            <DraftListingsList
                                listings={draftListings}
                                selectedListing={selectedListing}
                                onSelectListing={setSelectedListing}
                                onListingChanged={refetchListings}
                            />

                            <PaymentPanel
                                selectedListing={selectedListing}
                                feeConfig={feeConfig}
                                paymentType={paymentType}
                                onPaymentTypeChange={setPaymentType}
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
                    </div>
                ))}

                {showConfirmModal && (
                    <PaymentVerificationModal
                        isOpen={showConfirmModal}
                        selectedListing={selectedListing}
                        feeConfig={feeConfig}
                        paymentType={paymentType}
                        paymentMethods={paymentMethods}
                        isLoadingPaymentMethods={isPaymentMethodsLoading}
                        eWallet={eWallet}
                        onStartVerification={startVerification}
                        onVerifyAndPay={verifyAndPay}
                        onCancel={() => setShowConfirmModal(false)}
                        onNavigateToPaymentMethods={(type) => {
                            setShowConfirmModal(false);
                            navigate(`/payments/${type === 'CREDIT_CARD' ? 'credit-cards' : 'bank-accounts'}`);
                        }}
                        isProcessing={isProcessingPayment}
                        verificationCode={verificationCode}
                        onChangeVerificationCode={setVerificationCode}
                        codeExpiryTime={codeExpiryTime}
                        countdown={countdown}
                        onResendCode={resendVerificationCode}
                        isResendingCode={isResendingCode}
                        emails={emails}
                        isEmailsLoading={isEmailsLoading}
                        onFetchEmails={fetchEmails}
                        onClearEmails={clearEmails}
                    />
                )}
            </div>
        </div>
    );
};

export default PayListingFeePage;

