import React from 'react';
import CheckoutReviewStep from './CheckoutReviewStep.jsx';
import CheckoutAddressStep from './CheckoutAddressStep.jsx';
import CheckoutPaymentStep from './CheckoutPaymentStep.jsx';
import CheckoutVerificationStep from './CheckoutVerificationStep.jsx';

const CheckoutStep = ({
    step,
    cartItems,
    calculateTotal,
    addresses,
    selectedShippingAddressId,
    setSelectedShippingAddressId,
    selectedBillingAddressId,
    setSelectedBillingAddressId,
    selectedPaymentType,
    setSelectedPaymentType,
    cards,
    selectedCardNumber,
    setSelectedCardNumber,
    bankAccounts,
    selectedBankAccountIban,
    setSelectedBankAccountIban,
    eWallet,
    paymentVerificationCode,
    setPaymentVerificationCode,
    notes,
    setNotes,
    emails,
    isEmailsLoading,
    fetchEmails,
    onBack,
    onNext,
    onCheckout,
    proceedDisabled,
    isCheckingOut,
    sendVerificationCode
}) => {
    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <CheckoutReviewStep
                        cartItems={cartItems}
                        calculateTotal={calculateTotal}
                        onNext={onNext}
                        onBack={onBack}
                    />
                );
            case 2:
                return (
                    <CheckoutAddressStep
                        addresses={addresses}
                        selectedShippingAddressId={selectedShippingAddressId}
                        setSelectedShippingAddressId={setSelectedShippingAddressId}
                        selectedBillingAddressId={selectedBillingAddressId}
                        setSelectedBillingAddressId={setSelectedBillingAddressId}
                        notes={notes}
                        setNotes={setNotes}
                        onNext={onNext}
                        onBack={onBack}
                    />
                );
            case 3:
                return (
                    <CheckoutPaymentStep
                        selectedPaymentType={selectedPaymentType}
                        setSelectedPaymentType={setSelectedPaymentType}
                        cards={cards}
                        selectedCardNumber={selectedCardNumber}
                        setSelectedCardNumber={setSelectedCardNumber}
                        bankAccounts={bankAccounts}
                        selectedBankAccountIban={selectedBankAccountIban}
                        setSelectedBankAccountIban={setSelectedBankAccountIban}
                        eWallet={eWallet}
                        calculateTotal={calculateTotal}
                        onNext={onNext}
                        onBack={onBack}
                        sendVerificationCode={sendVerificationCode}
                    />
                );
            case 4:
                return (
                    <CheckoutVerificationStep
                        paymentVerificationCode={paymentVerificationCode}
                        setPaymentVerificationCode={setPaymentVerificationCode}
                        emails={emails}
                        isEmailsLoading={isEmailsLoading}
                        fetchEmails={fetchEmails}
                        onCheckout={onCheckout}
                        onBack={onBack}
                        proceedDisabled={proceedDisabled}
                        isCheckingOut={isCheckingOut}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="transition-all duration-300 ease-in-out">
                {renderStepContent()}
            </div>
        </div>
    );
};

export default CheckoutStep;
