import React, { memo } from 'react';
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
  eWallet,
  paymentVerificationCode,
  setPaymentVerificationCode,
  paymentVerificationExpiresAtMs,
  notes,
  setNotes,
  orderName,
  setOrderName,
  deliveryMethod,
  setDeliveryMethod,
  meetupLocation,
  setMeetupLocation,
  emails,
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
  areAllAgreementsAccepted,
}) => {
  const renderStepContent = () => {
    switch (step) {
      case 1:
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
            deliveryMethod={deliveryMethod}
            setDeliveryMethod={setDeliveryMethod}
            meetupLocation={meetupLocation}
            setMeetupLocation={setMeetupLocation}
            cartItems={cartItems}
            onNext={onNext}
            onBack={onBack}
          />
        );
      case 2: {
        const currency = cartItems.length > 0 ? cartItems[0].listing.currency : 'TRY';
        return (
          <CheckoutPaymentStep
            selectedPaymentType={selectedPaymentType}
            setSelectedPaymentType={setSelectedPaymentType}
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
      }
      case 3:
        return (
          <CheckoutReviewStep
            cartItems={cartItems}
            calculateTotal={calculateTotal}
            addresses={addresses}
            selectedShippingAddressId={selectedShippingAddressId}
            selectedBillingAddressId={selectedBillingAddressId}
            selectedPaymentType={selectedPaymentType}
            eWallet={eWallet}
            onNext={onNext}
            onBack={onBack}
            sendVerificationCode={sendVerificationCode}
            deliveryMethod={deliveryMethod}
            meetupLocation={meetupLocation}
          />
        );
      case 4:
        return (
          <CheckoutVerificationStep
            paymentVerificationCode={paymentVerificationCode}
            setPaymentVerificationCode={setPaymentVerificationCode}
            paymentVerificationExpiresAtMs={paymentVerificationExpiresAtMs}
            emails={emails}
            fetchEmails={fetchEmails}
            onCheckout={onCheckout}
            onBack={onBack}
            proceedDisabled={proceedDisabled}
            isCheckingOut={isCheckingOut}
            sendVerificationCode={sendVerificationCode}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-[#e5e3df] bg-background-primary shadow-sm shadow-black/[0.04]">
      {renderStepContent()}
    </div>
  );
};

export default memo(CheckoutStep);
