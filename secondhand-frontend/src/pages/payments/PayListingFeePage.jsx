import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePayListingFee } from './hooks/usePayListingFee';
import { useDraftListings } from './hooks/useDraftListings';
import { useFeeConfig } from './hooks/useFeeConfig';
import { usePaymentMethods } from './hooks/usePaymentMethods';
import { useEmails } from './hooks/useEmails';
import BackButton from '../../components/ui/BackButton';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorMessage from '../../components/ui/ErrorMessage';
import EmptyState from '../../components/ui/EmptyState';
import DraftListingsList from './components/DraftListingsList';
import PaymentPanel from './components/PaymentPanel';
import ConfirmationModal from './components/ConfirmationModal';
import EmailDisplayModal from './components/EmailDisplayModal';

const PayListingFeePage = () => {
    const navigate = useNavigate();
    
    // Custom hooks for different concerns
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
        showVerify,
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

    if (isLoading) {
        return <LoadingSpinner />;
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
                        showVerify={showVerify}
                        verificationCode={verificationCode}
                        onVerificationCodeChange={setVerificationCode}
                        codeExpiryTime={codeExpiryTime}
                        isResendingCode={isResendingCode}
                        onPayment={handlePayment}
                        onConfirmPayment={confirmPayment}
                        onResendCode={resendVerificationCode}
                        onShowEmails={fetchEmails}
                        isLoadingEmails={isEmailsLoading}
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