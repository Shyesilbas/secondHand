import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePayListingFee } from './hooks/usePayListingFee.js';
import { useDraftListings } from './hooks/useDraftListings.js';
import { useFeeConfig } from './hooks/useFeeConfig.js';
import { usePaymentMethods } from './hooks/usePaymentMethods.js';
import { useEmails } from './hooks/useEmails.js';
import BackButton from '../common/components/ui/BackButton.jsx';
import ErrorMessage from '../common/components/ui/ErrorMessage.jsx';
import EmptyState from '../common/components/ui/EmptyState.jsx';
import DraftListingsList from './components/DraftListingsList.jsx';
import PaymentPanel from './components/PaymentPanel.jsx';
import ConfirmationModal from './components/ConfirmationModal.jsx';
import EmailDisplayModal from './components/EmailDisplayModal.jsx';
import LoadingIndicator from "../common/components/ui/LoadingIndicator.jsx";

const PayListingFeePage = () => {
    const navigate = useNavigate();

    const { draftListings, isLoading: isListingsLoading, error: listingsError, refetch: refetchListings } = useDraftListings();
    const { feeConfig, isLoading: isConfigLoading, error: configError } = useFeeConfig();
    const { paymentMethods, isLoading: isPaymentMethodsLoading, refetch: refetchPaymentMethods } = usePaymentMethods();
    const { emails, isLoading: isEmailsLoading, fetchEmails, clearEmails } = useEmails();
    const {
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
        handlePayment,
        confirmPayment,
        resendVerificationCode,
        showConfirmModal,
        setShowConfirmModal
    } = usePayListingFee({
        selectedListing: null,
        feeConfig,
        onSuccess: refetchListings,
        onVerificationRequired: fetchEmails
    });

    const isLoading = isListingsLoading || isConfigLoading;
    const error = listingsError || configError;

    useEffect(() => {
        if (showConfirmModal) {
            refetchPaymentMethods();
        }
    }, [showConfirmModal]);

    if (isLoading) {
        return <LoadingIndicator />;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <BackButton onClick={() => navigate(-1)} />
                <h1 className="text-3xl font-bold text-gray-900">
                    Listing Fee Payment
                </h1>
                <p className="text-gray-600 mt-2">
                    You can pay the listing fee for your draft listings here.
                </p>
            </div>

            {error && <ErrorMessage message={error} />}

            {draftListings.length === 0 ? (
                <EmptyState
                    icon="clipboard"
                    title="No Draft Listings"
                    description="No draft listings found. You can create a new listing by clicking the button below."
                    actionText="Create Listing"
                    onAction={() => navigate('/listings/create')}
                />
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                            await refetchPaymentMethods();
                            handlePayment();
                        }}
                    />
                </div>
            )}

            {showConfirmModal && (
                <ConfirmationModal
                    selectedListing={selectedListing}
                    feeConfig={feeConfig}
                    paymentType={paymentType}
                    paymentMethods={paymentMethods}
                    isLoadingPaymentMethods={isPaymentMethodsLoading}
                    onConfirm={confirmPayment}
                    onCancel={() => setShowConfirmModal(false)}
                    onNavigateToPaymentMethods={(type) => {
                        setShowConfirmModal(false);
                        navigate(`/payments/${type === 'CREDIT_CARD' ? 'credit-cards' : 'bank-accounts'}`);
                    }}
                    step={modalStep}
                    isProcessing={isProcessingPayment}
                    verificationCode={verificationCode}
                    onChangeVerificationCode={setVerificationCode}
                    codeExpiryTime={codeExpiryTime}
                    onShowEmails={fetchEmails}
                    onResendCode={resendVerificationCode}
                    isResendingCode={isResendingCode}
                />
            )}

            {emails.length > 0 && (
                <EmailDisplayModal
                    emails={emails}
                    onClose={clearEmails}
                />
            )}
        </div>
    );
};

export default PayListingFeePage;
