import {Check} from 'lucide-react';
import CheckoutReviewStep from './CheckoutReviewStep.jsx';
import CheckoutAddressStep from './CheckoutAddressStep.jsx';
import CheckoutPaymentStep from './CheckoutPaymentStep.jsx';
import CheckoutVerificationStep from './CheckoutVerificationStep.jsx';

const STEPS = [
    { id: 1, label: 'Review' },
    { id: 2, label: 'Address' },
    { id: 3, label: 'Payment' },
    { id: 4, label: 'Verify' },
];

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
    orderName,
    setOrderName,
    emails,
    isEmailsLoading,
    fetchEmails,
    onBack,
    onNext,
    onCheckout,
    proceedDisabled,
    isCheckingOut,
    sendVerificationCode,
    acceptedAgreements,
    onAgreementToggle,
    onRequiredAgreementsChange,
    areAllAgreementsAccepted
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
                        orderName={orderName}
                        setOrderName={setOrderName}
                        onNext={onNext}
                        onBack={onBack}
                    />
                );
            case 3:
                const currency = cartItems.length > 0 ? cartItems[0].listing.currency : 'TRY';
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
                        currency={currency}
                        onNext={onNext}
                        onBack={onBack}
                        sendVerificationCode={sendVerificationCode}
                        acceptedAgreements={acceptedAgreements}
                        onAgreementToggle={onAgreementToggle}
                        onRequiredAgreementsChange={onRequiredAgreementsChange}
                        areAllAgreementsAccepted={areAllAgreementsAccepted}
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
        <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
            {/* Step progress */}
            <div className="px-5 py-3 border-b border-gray-50 bg-gray-50/30">
                <div className="flex items-center justify-between max-w-sm mx-auto">
                    {STEPS.map((s, i) => {
                        const isActive = step === s.id;
                        const isCompleted = step > s.id;
                        return (
                            <div key={s.id} className="flex items-center gap-2.5 flex-1 last:flex-initial">
                                <div className="flex items-center gap-1.5 shrink-0">
                                    <div className={`
                                        w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-semibold transition-colors
                                        ${isActive ? 'bg-gray-900 text-white' : isCompleted ? 'bg-gray-200 text-gray-500' : 'bg-gray-100 text-gray-300'}
                                    `}>
                                        {isCompleted ? <Check className="w-2.5 h-2.5" /> : s.id}
                                    </div>
                                    <span className={`text-[10px] font-medium hidden sm:inline ${
                                        isActive ? 'text-gray-900' : isCompleted ? 'text-gray-500' : 'text-gray-300'
                                    }`}>
                                        {s.label}
                                    </span>
                                </div>
                                {i < STEPS.length - 1 && (
                                    <div className={`flex-1 h-px ${isCompleted ? 'bg-gray-300' : 'bg-gray-100'}`} />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {renderStepContent()}
        </div>
    );
};

export default CheckoutStep;