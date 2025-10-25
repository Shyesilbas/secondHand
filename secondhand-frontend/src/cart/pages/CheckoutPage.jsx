import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useCart } from '../hooks/useCart.js';
import { useCheckout } from '../hooks/index.js';
import CheckoutProgressBar from '../components/checkout/CheckoutProgressBar.jsx';
import CheckoutStep from '../components/checkout/CheckoutStep.jsx';
import CheckoutOrderSummary from '../components/checkout/CheckoutOrderSummary.jsx';
import LoadingIndicator from '../../common/components/ui/LoadingIndicator.jsx';

const CheckoutPage = () => {
    const navigate = useNavigate();
    const { cartItems, cartCount, clearCart } = useCart();
    
    const calculateTotal = () => {
        return cartItems.reduce((total, item) => {
            const price = parseFloat(item.listing.price) || 0;
            return total + (price * item.quantity);
        }, 0);
    };
    
    const checkout = useCheckout(cartCount, calculateTotal, clearCart);
    const [currentStep, setCurrentStep] = useState(1);

    const steps = [
        { id: 1, title: 'Review', description: 'Review your order' },
        { id: 2, title: 'Address & Note', description: 'Shipping and billing' },
        { id: 3, title: 'Payment Method', description: 'Choose payment option' },
        { id: 4, title: 'Verification', description: 'Confirm your purchase' }
    ];

    const handleStepChange = (step) => {
        setCurrentStep(step);
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        } else {
            navigate('/cart');
        }
    };

    const handleNext = () => {
        if (currentStep < 4) {
            setCurrentStep(currentStep + 1);
        }
    };

    if (cartCount === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-medium text-gray-900 mb-4">Your cart is empty</h1>
                    <p className="text-gray-600 mb-8">Add some items to your cart to get started.</p>
                    <button
                        onClick={() => navigate('/listings')}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Browse Listings
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => navigate('/cart')}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-medium text-gray-900">Checkout</h1>
                            <p className="text-gray-600 mt-1">Complete your purchase securely</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <CheckoutProgressBar 
                currentStep={currentStep} 
                steps={steps}
                onStepChange={handleStepChange}
            />

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Checkout Steps */}
                    <div className="lg:col-span-2">
                        <CheckoutStep
                            step={currentStep}
                            cartItems={cartItems}
                            calculateTotal={calculateTotal}
                            addresses={checkout.addresses}
                            selectedShippingAddressId={checkout.selectedShippingAddressId}
                            setSelectedShippingAddressId={checkout.setSelectedShippingAddressId}
                            selectedBillingAddressId={checkout.selectedBillingAddressId}
                            setSelectedBillingAddressId={checkout.setSelectedBillingAddressId}
                            selectedPaymentType={checkout.selectedPaymentType}
                            setSelectedPaymentType={checkout.setSelectedPaymentType}
                            cards={checkout.cards}
                            selectedCardNumber={checkout.selectedCardNumber}
                            setSelectedCardNumber={checkout.setSelectedCardNumber}
                            bankAccounts={checkout.bankAccounts}
                            selectedBankAccountIban={checkout.selectedBankAccountIban}
                            setSelectedBankAccountIban={checkout.setSelectedBankAccountIban}
                            eWallet={checkout.eWallet}
                            paymentVerificationCode={checkout.paymentVerificationCode}
                            setPaymentVerificationCode={checkout.setPaymentVerificationCode}
                            notes={checkout.notes}
                            setNotes={checkout.setNotes}
                            emails={checkout.emails}
                            isEmailsLoading={checkout.isEmailsLoading}
                            fetchEmails={checkout.fetchEmails}
                            onBack={handleBack}
                            onNext={handleNext}
                            onCheckout={checkout.handleCheckout}
                            proceedDisabled={checkout.proceedDisabled}
                            isCheckingOut={checkout.isCheckingOut}
                            sendVerificationCode={checkout.sendVerificationCode}
                        />
                    </div>

                    {/* Right Column - Order Summary */}
                    <div className="lg:col-span-1">
                        <CheckoutOrderSummary
                            cartItems={cartItems}
                            calculateTotal={calculateTotal}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
