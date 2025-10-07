import React from 'react';
import { CreditCardIcon, ShieldCheckIcon, ShoppingBagIcon, TruckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { formatCurrency } from '../../../common/formatters.js';
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

    const isPaymentMethodSelected = () => {
        if (selectedPaymentType === 'CREDIT_CARD') {
            return !!selectedCardNumber;
        } else if (selectedPaymentType === 'TRANSFER') {
            return !!selectedBankAccountIban;
        } else if (selectedPaymentType === 'EWALLET') {
            return !!eWallet;
        }
        return false;
    };

    const stepConfig = [
        { number: 1, title: 'Review', icon: ShoppingBagIcon },
        { number: 2, title: 'Address', icon: TruckIcon },
        { number: 3, title: 'Payment', icon: CreditCardIcon },
        { number: 4, title: 'Verify', icon: ShieldCheckIcon }
    ];

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <div>
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-2">Review Your Order</h2>
                            <p className="text-sm text-gray-600">Please review your items and quantities before proceeding.</p>
                        </div>
                        <CheckoutSummaryStep
                            cartItems={cartItems}
                            calculateTotal={calculateTotal}
                        />
                    </div>
                );
            case 2:
                return (
                    <div>
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-2">Shipping & Billing Addresses</h2>
                            <p className="text-sm text-gray-600">Select your shipping and billing addresses for this order.</p>
                        </div>
                        <AddressSelectionStep
                            addresses={addresses}
                            selectedShippingAddressId={selectedShippingAddressId}
                            setSelectedShippingAddressId={setSelectedShippingAddressId}
                            selectedBillingAddressId={selectedBillingAddressId}
                            setSelectedBillingAddressId={setSelectedBillingAddressId}
                        />
                    </div>
                );
            case 3:
                return (
                    <div>
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-2">Payment Method</h2>
                            <p className="text-sm text-gray-600">Choose how you'd like to pay for your order.</p>
                        </div>
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
                    </div>
                );
            case 4:
                return (
                    <div>
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-2">Verify Payment</h2>
                            <p className="text-sm text-gray-600">Enter the verification code sent to your email to complete your purchase.</p>
                        </div>

                        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Verification Code</label>
                            <input
                                type="text"
                                value={paymentVerificationCode}
                                onChange={(e) => setPaymentVerificationCode(e.target.value)}
                                placeholder="Enter 6-digit code"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-center font-mono bg-white"
                                maxLength="6"
                            />
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <h5 className="text-sm font-semibold text-gray-900">Verification Emails</h5>
                                </div>
                                <button
                                    className="text-gray-600 text-sm hover:text-gray-900 hover:bg-gray-100 px-2 py-1 rounded-md transition-colors flex items-center gap-1"
                                    onClick={fetchEmails}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Refresh
                                </button>
                            </div>
                            <div className="max-h-64 overflow-y-auto">
                                {isEmailsLoading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                                    </div>
                                ) : (emails && emails.length > 0 ? (
                                    <div className="space-y-3">
                                        {([...emails]
                                            .sort((a, b) => new Date(b.sentAt || b.createdAt) - new Date(a.sentAt || a.createdAt))
                                            .slice(0, 2)
                                        ).map((e, idx) => (
                                            <div key={idx} className="p-4 hover:bg-gray-50 transition-colors border border-gray-100 rounded-lg">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                                            {e.sentAt || e.createdAt}
                                                        </span>
                                                    </div>
                                                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                                                        Email #{idx + 1}
                                                    </span>
                                                </div>
                                                <div className="mb-3">
                                                    <h6 className="text-sm font-semibold text-gray-900 mb-1">
                                                        {e.subject || 'Verification Code'}
                                                    </h6>
                                                </div>
                                                <div className="bg-white border border-gray-200 rounded-md p-3">
                                                    <div className="text-sm text-gray-800 font-mono leading-relaxed whitespace-pre-wrap break-words">
                                                        {e.body || e.content}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                                        <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        <p className="text-sm">No emails found</p>
                                    </div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white w-full max-w-4xl rounded-lg shadow-lg overflow-hidden flex flex-col max-h-[90vh]">
                {/* Clean Header */}
                <div className="bg-white px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <ShieldCheckIcon className="w-5 h-5 text-gray-600" />
                            <h3 className="text-lg font-semibold text-gray-900">Secure Checkout</h3>
                        </div>
                        <button
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                            onClick={onClose}
                        >
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Simple Progress Steps */}
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center justify-between max-w-2xl mx-auto">
                        {stepConfig.map((s, idx) => {
                            const Icon = s.icon;
                            const isActive = step === s.number;
                            const isCompleted = step > s.number;

                            return (
                                <React.Fragment key={s.number}>
                                    <div className="flex items-center space-x-2">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                                            isActive ? 'bg-gray-900 text-white' :
                                                isCompleted ? 'bg-green-600 text-white' :
                                                    'bg-gray-200 text-gray-500'
                                        }`}>
                                            {isCompleted ? (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            ) : (
                                                <Icon className="w-4 h-4" />
                                            )}
                                        </div>
                                        <span className={`text-sm font-medium ${
                                            isActive || isCompleted ? 'text-gray-900' : 'text-gray-500'
                                        }`}>
                                            {s.title}
                                        </span>
                                    </div>
                                    {idx < stepConfig.length - 1 && (
                                        <div className={`h-px w-8 transition-colors ${
                                            step > s.number ? 'bg-green-600' : 'bg-gray-200'
                                        }`} />
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 overflow-y-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            {renderStepContent()}
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-gray-50 rounded-lg p-4 sticky top-4">
                                <h4 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <ShoppingBagIcon className="w-4 h-4 text-gray-600" />
                                    Order Summary
                                </h4>
                                
                                <div className="space-y-2 mb-4">
                                    {cartItems.map((item) => (
                                        <div key={item.id} className="flex items-center justify-between text-sm">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-gray-900 truncate">{item.listing.title}</p>
                                                <p className="text-xs text-gray-500">
                                                    {item.quantity} × {formatCurrency(item.listing.price, item.listing.currency)}
                                                </p>
                                            </div>
                                            <span className="text-sm font-medium text-gray-900 ml-2">
                                                {formatCurrency(parseFloat(item.listing.price) * item.quantity, item.listing.currency)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                
                                <div className="space-y-2 border-t border-gray-200 pt-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Subtotal</span>
                                        <span className="font-medium text-gray-900">
                                            {cartItems.length > 0 ? formatCurrency(calculateTotal(), cartItems[0].listing.currency) : '$0.00'}
                                        </span>
                                    </div>
                                    
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Shipping</span>
                                        <span className="font-medium text-green-600">Free</span>
                                    </div>
                                    
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Tax</span>
                                        <span className="font-medium text-gray-900">$0.00</span>
                                    </div>
                                    
                                    <div className="border-t border-gray-200 pt-2">
                                        <div className="flex justify-between text-base font-semibold">
                                            <span className="text-gray-900">Total</span>
                                            <span className="text-gray-900">
                                                {cartItems.length > 0 ? formatCurrency(calculateTotal(), cartItems[0].listing.currency) : '$0.00'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 pt-3 border-t border-gray-200">
                                    <div className="flex items-center gap-2 text-xs text-gray-600">
                                        <ShieldCheckIcon className="w-3 h-3" />
                                        <span>Secure checkout</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                    <button
                        className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-white hover:border-gray-400 font-medium transition-colors flex items-center gap-2"
                        onClick={() => step > 1 ? setStep(step - 1) : onClose()}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        {step > 1 ? 'Back' : 'Cancel'}
                    </button>
                    {step < 3 ? (
                        <button
                            className="px-6 py-2 bg-gray-900 text-white hover:bg-gray-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                            onClick={() => setStep(step + 1)}
                            disabled={
                                (step === 1 && cartCount === 0) ||
                                (step === 2 && (!selectedShippingAddressId || !selectedBillingAddressId))
                            }
                        >
                            Continue
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    ) : step === 3 ? (
                        <button
                            className="px-6 py-2 bg-gray-900 text-white hover:bg-gray-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                            onClick={async () => {
                                await sendVerificationCode();
                                setStep(4);
                            }}
                            disabled={isCheckingOut || !isPaymentMethodSelected()}
                        >
                            <ShieldCheckIcon className="w-4 h-4" />
                            Proceed to Verification
                        </button>
                    ) : step === 4 ? (
                        <button
                            className="px-6 py-2 bg-green-600 text-white hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                            onClick={onCheckout}
                            disabled={proceedDisabled || isCheckingOut || !paymentVerificationCode}
                        >
                            {isCheckingOut ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <ShieldCheckIcon className="w-4 h-4" />
                                    Complete Payment
                                </>
                            )}
                        </button>
                    ) : null}
                </div>
            </div>

            {/* eWallet Warning Modal */}
            {showEWalletWarning && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
                    <div className="bg-white rounded-lg w-full max-w-md mx-4 overflow-hidden">
                        <div className="bg-gray-900 px-6 py-4">
                            <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                Spending Warning
                            </h4>
                        </div>
                        <div className="p-6">
                            <p className="text-gray-700 mb-6">
                                Your eWallet spending warning limit has been reached or exceeded with this purchase. Do you want to proceed?
                            </p>
                            <div className="flex gap-3">
                                <button
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                                    onClick={onClose}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="flex-1 px-4 py-2 bg-gray-900 text-white hover:bg-gray-800 font-medium transition-colors"
                                    onClick={onConfirmEWalletWarning}
                                >
                                    Proceed Anyway
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CheckoutModal;