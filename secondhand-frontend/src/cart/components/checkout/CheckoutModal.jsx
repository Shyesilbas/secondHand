import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import CheckoutSummaryStep from './CheckoutSummaryStep.jsx';
import AddressSelectionStep from './AddressSelectionStep.jsx';
import PaymentSelectionStep from './PaymentSelectionStep.jsx';

const CheckoutModal = ({ 
    isOpen,
    onClose,
    step,
    setStep,
    cartItems,
    cartCount,
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
    onCheckout,
    proceedDisabled,
    isCheckingOut
}) => {
    if (!isOpen) return null;

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <CheckoutSummaryStep 
                        cartItems={cartItems}
                        calculateTotal={calculateTotal}
                    />
                );
            case 2:
                return (
                    <AddressSelectionStep 
                        addresses={addresses}
                        selectedShippingAddressId={selectedShippingAddressId}
                        setSelectedShippingAddressId={setSelectedShippingAddressId}
                        selectedBillingAddressId={selectedBillingAddressId}
                        setSelectedBillingAddressId={setSelectedBillingAddressId}
                    />
                );
            case 3:
                return (
                    <PaymentSelectionStep 
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
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4">
                <div className="p-4 border-b flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Checkout</h3>
                    <button 
                        className="p-2 hover:bg-gray-100 rounded" 
                        onClick={onClose}
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="p-6">
                    {/* Step indicator */}
                    <div className="flex items-center space-x-2 mb-6">
                        {[1, 2, 3].map(s => (
                            <div 
                                key={s} 
                                className={`h-2 flex-1 rounded ${
                                    step >= s ? 'bg-blue-600' : 'bg-gray-200'
                                }`}
                            />
                        ))}
                    </div>

                    {/* Step content */}
                    {renderStepContent()}
                </div>
                
                <div className="p-4 border-t flex items-center justify-between">
                    <button 
                        className="px-4 py-2 border rounded" 
                        onClick={() => step > 1 ? setStep(step - 1) : onClose}
                    >
                        {step > 1 ? 'Back' : 'Cancel'}
                    </button>
                    
                    {step < 3 ? (
                        <button 
                            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50" 
                            onClick={() => setStep(step + 1)} 
                            disabled={
                                (step === 1 && cartCount === 0) || 
                                (step === 2 && !selectedShippingAddressId)
                            }
                        >
                            Next
                        </button>
                    ) : (
                        <button 
                            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50" 
                            onClick={onCheckout} 
                            disabled={proceedDisabled || isCheckingOut}
                        >
                            {isCheckingOut ? 'Placing…' : 'Place Order'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CheckoutModal;
