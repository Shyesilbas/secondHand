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
    paymentVerificationCode,
    setPaymentVerificationCode,
    onCheckout,
    proceedDisabled,
    isCheckingOut,
    showEWalletWarning,
    onConfirmEWalletWarning,
    sendVerificationCode,
    emails,
    isEmailsLoading,
    fetchEmails
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
                    <div>
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
                        <div className="mt-4">
                            <button 
                                className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50" 
                                onClick={async () => { await sendVerificationCode(); setStep(4); }} 
                                disabled={isCheckingOut}
                            >
                                Proceed to Payment
                            </button>
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div>
                        <h4 className="text-md font-semibold mb-3">Verification</h4>
                        <div className="mb-3">
                            <label className="block text-sm text-gray-700 mb-1">Verification Code</label>
                            <input
                                type="text"
                                value={paymentVerificationCode}
                                onChange={(e) => setPaymentVerificationCode(e.target.value)}
                                placeholder="Enter the code sent to your email"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="mb-4">
                            <button 
                                className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50" 
                                onClick={onCheckout} 
                                disabled={proceedDisabled || isCheckingOut || !paymentVerificationCode}
                            >
                                {isCheckingOut ? 'Processing…' : 'Complete Payment'}
                            </button>
                        </div>
                        <div className="mt-4">
                            <div className="flex items-center justify-between mb-2">
                                <h5 className="text-sm font-medium text-gray-700">Emails</h5>
                                <button className="text-blue-600 text-sm underline" onClick={fetchEmails}>Refresh</button>
                            </div>
                            <div className="max-h-48 overflow-auto border rounded p-2 bg-gray-50">
                                {isEmailsLoading ? (
                                    <div className="text-sm text-gray-500">Loading emails…</div>
                                ) : (emails && emails.length > 0 ? (
                                    emails.map((e, idx) => (
                                        <div key={idx} className="mb-2 p-2 bg-white rounded border">
                                            <div className="text-xs text-gray-500">{e.sentAt || e.createdAt}</div>
                                            <div className="text-sm font-medium">{e.subject || 'Verification Code'}</div>
                                            <div className="text-sm whitespace-pre-wrap">{e.body || e.content}</div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-sm text-gray-500">No emails found.</div>
                                ))}
                            </div>
                        </div>
                    </div>
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
                        {[1, 2, 3, 4].map(s => (
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
                    
                    {step < 4 ? (
                        <button 
                            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50" 
                            onClick={() => setStep(step + 1)} 
                            disabled={
                                (step === 1 && cartCount === 0) || 
                                (step === 2 && !selectedShippingAddressId) ||
                                (step === 3)
                            }
                        >
                            Next
                        </button>
                    ) : (
                        <>
                            {step === 4 && (
                                <button 
                                    className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50" 
                                    onClick={onCheckout} 
                                    disabled={proceedDisabled || isCheckingOut || !paymentVerificationCode}
                                >
                                    {isCheckingOut ? 'Processing…' : 'Complete Payment'}
                                </button>
                            )}
                            {showEWalletWarning && (
                                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                                        <h4 className="text-lg font-semibold text-gray-900 mb-2">Spending Warning</h4>
                                        <p className="text-sm text-gray-600 mb-4">
                                            Your eWallet spending warning limit has been reached or exceeded with this purchase. Do you want to proceed?
                                        </p>
                                        <div className="flex justify-end gap-2">
                                            <button className="px-4 py-2 border rounded" onClick={onClose}>Cancel</button>
                                            <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={onConfirmEWalletWarning}>Proceed</button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CheckoutModal;
