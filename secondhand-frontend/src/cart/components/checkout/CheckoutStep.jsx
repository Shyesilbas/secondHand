import CheckoutAddressStep from './CheckoutAddressStep.jsx';
import CheckoutPaymentStep from './CheckoutPaymentStep.jsx';
import CheckoutVerificationStep from './CheckoutVerificationStep.jsx';
import { getCheckoutCurrency } from '../../utils/checkoutLinePricing.js';

// `checkout` is the useCheckout() result; each step takes only the fields it needs from it.
const CheckoutStep = ({ step, checkout, cartItems, calculateTotal, onBack, onNext, onGoToStep }) => {
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <CheckoutAddressStep
            addresses={checkout.addresses}
            selectedShippingAddressId={checkout.selectedShippingAddressId}
            setSelectedShippingAddressId={checkout.setSelectedShippingAddressId}
            selectedBillingAddressId={checkout.selectedBillingAddressId}
            setSelectedBillingAddressId={checkout.setSelectedBillingAddressId}
            notes={checkout.notes}
            setNotes={checkout.setNotes}
            orderName={checkout.orderName}
            setOrderName={checkout.setOrderName}
            deliveryMethod={checkout.deliveryMethod}
            setDeliveryMethod={checkout.setDeliveryMethod}
            meetupLocation={checkout.meetupLocation}
            setMeetupLocation={checkout.setMeetupLocation}
            cartItems={cartItems}
            onNext={onNext}
            onBack={onBack}
          />
        );
      case 2:
        return (
          <CheckoutPaymentStep
            eWallet={checkout.eWallet}
            calculateTotal={calculateTotal}
            currency={getCheckoutCurrency(cartItems)}
            addresses={checkout.addresses}
            selectedShippingAddressId={checkout.selectedShippingAddressId}
            deliveryMethod={checkout.deliveryMethod}
            meetupLocation={checkout.meetupLocation}
            orderName={checkout.orderName}
            notes={checkout.notes}
            onEditDelivery={() => onGoToStep(1)}
            onNext={onNext}
            onBack={onBack}
            sendVerificationCode={checkout.sendVerificationCode}
            acceptedAgreements={checkout.acceptedAgreements}
            onAgreementToggle={checkout.onAgreementToggle}
            onRequiredAgreementsChange={checkout.onRequiredAgreementsChange}
            areAllAgreementsAccepted={checkout.areAllAgreementsAccepted}
          />
        );
      case 3:
        return (
          <CheckoutVerificationStep
            paymentVerificationCode={checkout.paymentVerificationCode}
            setPaymentVerificationCode={checkout.setPaymentVerificationCode}
            paymentVerificationExpiresAtMs={checkout.paymentVerificationExpiresAtMs}
            emails={checkout.emails}
            fetchEmails={checkout.fetchEmails}
            onCheckout={checkout.handleCheckout}
            onBack={onBack}
            proceedDisabled={checkout.proceedDisabled}
            isCheckingOut={checkout.isCheckingOut}
            sendVerificationCode={checkout.sendVerificationCode}
            totalAmount={calculateTotal()}
            currency={getCheckoutCurrency(cartItems)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="overflow-hidden rounded border border-border bg-background-primary">
      {renderStepContent()}
    </div>
  );
};

export default CheckoutStep;
